from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import Chunk
from app.services.embedding_service import embed_query

async def retrieve_relevant_chunks(db: AsyncSession, video_id:str, query:str, k:int =5) -> list[Chunk]:
    query_vector = embed_query(query)
    stmt = (
        select(Chunk)
         .where(Chunk.video_id == video_id)
         .order_by(Chunk.embedding.cosine_distance(query_vector))
         .limit(k)
    )

    result = await db.execute(stmt)
    chunks = result.scalars().all()

    return chunks