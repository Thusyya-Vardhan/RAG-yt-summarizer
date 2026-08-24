import re
from dataclasses import dataclass

import httpx
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import TranscriptsDisabled, NoTranscriptFound

class TranscriptUnavailableError(Exception):
    pass

@dataclass
class Segment:
    text:str
    start: float
    duration: float

_ID_PATTERNS = [
    r"(?:v=|/)([0-9A-Za-z_-]{11}).*",  # watch?v=... or /embed/...
    r"youtu\.be/([0-9A-Za-z_-]{11})",
]

def extract_video_id(url: str) -> str:
    for pattern in _ID_PATTERNS:
        match = re.search(pattern, url)
        if match:
            return match.group(1)

    if re.fullmatch(r"[0-9A-Za-z_-]{11}", url):
        return url
    raise ValueError(f"Could not extract a Youtube video id from : {url}")

def fetch_transcript(video_id: str)-> list[Segment]:
    try:
        fetched = YouTubeTranscriptApi().fetch(video_id)
        raw = fetched.to_raw_data()
    except (TranscriptsDisabled, NoTranscriptFound) as exc:
        raise TranscriptUnavailableError(str(exc)) from exc

    return [Segment(text=s["text"], start=s["start"], duration=s["duration"]) for s in raw]

def fetch_title(video_id: str) -> str | None:
    try:
        resp = httpx.get(
            "https://www.youtube.com/oembed",
            params={"url": f"https://www.youtube.com/watch?v={video_id}", "format": "json"},
            timeout=10,
        )
        resp.raise_for_status()
        return resp.json().get("title")
    except Exception:
        return None