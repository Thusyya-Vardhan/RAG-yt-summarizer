from datetime import datetime
from pydantic import BaseModel

class VideoIngestRequest(BaseModel):
    url: str


class VideoStatusResponse(BaseModel):
    video_id: str
    url: str
    title: str | None
    duration_sec: int | None
    status: str
    error_message: str | None
    chunk_count: int

    class Config:
        from_attributes = True