from dataclasses import dataclass

from app.services.youtube_service import Segment
from app.config import settings

@dataclass
class TimestampedChunk:
    chunk_index: int
    content: str
    start_sec: float
    end_sec: float

def chunk_transcript(segments: list[Segment]) -> list[TimestampedChunk]:
    if not segments:
        return []

    chunks: list[TimestampedChunk] = []
    current: list[Segment] = []
    current_len = 0
    chunk_index = 0

    def flush() -> list[Segment]:
        nonlocal chunks , chunk_index
        text = " ".join(s.text for s in current).strip()
        start_sec = current[0].start
        last = current[-1]
        end_sec = last.start + last.duration
        chunks.append(
            TimestampedChunk(chunk_index=chunk_index, content=text, start_sec=start_sec, end_sec=end_sec)
        )
        chunk_index += 1

        carry: list[Segment] = []
        carry_len = 0
        for seg in reversed(current):
            carry.insert(0,seg)
            carry_len += len(seg.text) + 1
            if carry_len >= settings.chunk_overlap_chars:
                break
        return carry

    for seg in segments:
        current.append(seg)
        current_len += len(seg.text) + 1
        if current_len >= settings.chunk_target_chars:
            carry = flush()
            current = carry
            current_len = sum(len(s.text) + 1 for s in current)

    if current:
        flush()

    return chunks