from contextlib import asynccontextmanager

from fastapi import FastAPI, BackgroundTasks, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import init_db, get_db
from app.models import Video, Chunk
from app.schemas import VideoIngestRequest, VideoStatusResponse
from app.services import youtube_service
from app.services.ingestion_service import start_ingestion


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(title="YT RAG Summarizer", lifespan=lifespan)


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