from contextlib import asynccontextmanager

from fastapi import FastAPI, BackgroundTasks, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timezone

from app.database import init_db, get_db
from app.models import Video, Chunk
from app.schemas import VideoIngestRequest, VideoStatusResponse, AskRequest, Source, AskResponse, SummaryResponse
from app.services import youtube_service
from app.services.ingestion_service import start_ingestion
from app.services.retrieval_service import retrieve_relevant_chunks , retrieve_all_chunks
from app.services.generation_service import generate_answer
from app.services.routing_service import route_query
from app.services.summarization_service import summarize_all_chunks, final_summary_answer

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(title="YT RAG Summarizer", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/videos", response_model=VideoStatusResponse)
async def ingest_video(
    payload: VideoIngestRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    try:
        video_id = youtube_service.extract_video_id(payload.url)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    video = await db.get(Video, video_id)
    if video is None:
        video = Video(video_id=video_id, url=payload.url, status="pending")
        db.add(video)
        await db.commit()
        await db.refresh(video)
        background_tasks.add_task(start_ingestion, video_id, payload.url)
    elif video.status == "failed":
        video.status = "pending"
        video.error_message = None
        await db.commit()
        background_tasks.add_task(start_ingestion, video_id, payload.url)

    return VideoStatusResponse(
        video_id=video.video_id,
        url=video.url,
        title=video.title,
        duration_sec=video.duration_sec,
        status=video.status,
        error_message=video.error_message,
        chunk_count=0,
    )


@app.get("/videos/{video_id}", response_model=VideoStatusResponse)
async def get_video_status(video_id: str, db: AsyncSession = Depends(get_db)):
    video = await db.get(Video, video_id)
    if video is None:
        raise HTTPException(status_code=404, detail="Video not found")

    count = await db.scalar(select(func.count()).select_from(Chunk).where(Chunk.video_id == video_id))

    return VideoStatusResponse(
        video_id=video.video_id,
        url=video.url,
        title=video.title,
        duration_sec=video.duration_sec,
        status=video.status,
        error_message=video.error_message,
        chunk_count=count or 0,
    )

@app.post("/videos/{video_id}/ask", response_model=AskResponse | SummaryResponse)
async def query_about_video(video_id: str, payload: AskRequest, db: AsyncSession = Depends(get_db)):
    video = await db.get(Video, video_id)

    if video is None :
        raise HTTPException(status_code=404, detail="Video Not Found")

    if video.status != "ready":
        raise HTTPException(status_code=400, detail="video under processing")

    route_type = route_query(payload.query)

    if route_type == "summarize_video":
        if video.summary_cache:
            return SummaryResponse(
                answer=video.summary_cache
            )
        chunks = await retrieve_all_chunks(db, video_id)
        batch_summaries = summarize_all_chunks(chunks)
        final = final_summary_answer(batch_summaries)

        video.summary_cache = final
        video.summary_generated_at = datetime.now(timezone.utc)

        await db.commit()
        return SummaryResponse(
            answer= final
        )
    else:
        chunks = await retrieve_relevant_chunks(db, video_id, payload.query)
        answer = generate_answer(payload.query, chunks)

        sources = []
        for chunk in chunks:
            sources.append(
                Source(start_sec=chunk.start_sec,
                        timestamp_url=f"https://youtube.com/watch?v={video_id}&t={int(chunk.start_sec)}s")
            )


        return AskResponse(
            answer=answer,
            sources= sources 
        )