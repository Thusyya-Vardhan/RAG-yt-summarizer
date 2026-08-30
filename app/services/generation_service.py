from app.models import Chunk
from google import genai
from app.config import settings

_client = genai.Client(api_key=settings.gemini_api_key)

def generate_answer(query: str, chunks: list[Chunk]) -> str:
    text : str = ""
    for chunk in chunks:
        minutes = int(chunk.start_sec) // 60
        seconds = int(chunk.start_sec)  % 60
        text += f"[{minutes}:{seconds}] {chunk.content}\n"


    prompt = f"Answer the question using ONLY the transcript excerpts below. If the excerpts don't contain enough information to answer, say so.Transcript excerpts:{text} Question: {query}"

    response = _client.models.generate_content(
        model=settings.generation_model,
        contents=prompt
    )

    return response.text