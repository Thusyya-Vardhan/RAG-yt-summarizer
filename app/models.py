from datetime import datetime, timezone

from sqlalchemy import String, Text, Integer, Float , ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column , relationship
from pgvector.sqlalchemy import Vector

from app.database import Base
from app.config import settings

class Video(Base):
    __tablename__ = "videos"

    video_id: Mapped[str] = mapped_column(String(32), primary_key=True)
    url: Mapped[str] = mapped_column(Text, nullable=False)
    title: Mapped[str | None] = mapped_column(Text, nullable=True)
    duration_sec: Mapped[int | None] = mapped_column(Integer, nullable=True)
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="pending")
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    summary_cache: Mapped[str | None] = mapped_column(Text, nullable=True)
    summary_generated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
 
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
 
    chunks: Mapped[list["Chunk"]] = relationship(
        back_populates="video", cascade="all, delete-orphan", order_by="Chunk.chunk_index"
    )

class Chunk(Base):
    __tablename__ = "chunks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    video_id: Mapped[str] = mapped_column(String(32), ForeignKey("videos.video_id"), nullable=False)
    chunk_index: Mapped[int] = mapped_column(Integer, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    start_sec: Mapped[float] = mapped_column(Float, nullable=False)
    end_sec: Mapped[float] = mapped_column(Float, nullable=False)
    embedding: Mapped[list[float]] = mapped_column(Vector(settings.embedding_dim), nullable=False)
    video: Mapped["Video"] = relationship(back_populates="chunks")