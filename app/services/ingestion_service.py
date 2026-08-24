from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import AsyncSessionLocal
from app.models import Video,Chunk
from app.services import youtube_service, chunking_service, embedding_service

async def start_ingestion(video_id:str, url:str) -> None:
    async with AsyncSessionLocal() as db:
        video = await db.get(Video, video_id)
        if video is None:
            return

        video.status = "processing"
        await db.commit()

        try:
            segments = youtube_service.fetch_transcript(video_id)
            title= youtube_service.fetch_title(video_id)

            timestamped_chunks = chunking_service.chunk_transcript(segments)
            if not timestamped_chunks:
                raise ValueError("Transcript produced zero chunks")

            embeddings = embedding_service.embed_texts([c.content for c in timestamped_chunks])

            for tc , vector in zip(timestamped_chunks, embeddings):
                db.add(
                    Chunk(
                        video_id=video_id,
                        chunk_index=tc.chunk_index,
                        content=tc.content,
                        start_sec=tc.start_sec,
                        end_sec=tc.end_sec,
                        embedding=vector,
                    )
                )

                video.title= title
                video.duration_sec = int(timestamped_chunks[-1].end_sec)
                video.status = "ready"
                await db.commit()

        except Exception as exc:
            await db.rollback()
            video.status = "failed"
            video.error_message = str(exc)
            await db.commit()