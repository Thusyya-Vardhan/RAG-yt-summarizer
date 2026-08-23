from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import text

from app.config import settings

engine = create_async_engine(settings.database_url, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


async def init_db() -> None:
    async with engine.begin() as conn:
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector "))
        await conn.run_sync(Base.metadata.create_all)
        await conn.execute(
            text(
                "CREATE INDEX IF NOT EXISTS chunks_embedding_hnsw_idx "
                "ON chunks using hnsw (embedding vector_cosine_ops)"
            )
        )