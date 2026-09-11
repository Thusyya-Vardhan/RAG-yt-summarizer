from app.models import Chunk
from google import genai
from app.config import settings

_client = genai.Client(api_key=settings.gemini_api_key)

async def generate_answer(query: str, chunks: list[Chunk]) -> str:
    text : str = ""
    for chunk in chunks:
        minutes = int(chunk.start_sec) // 60
        seconds = int(chunk.start_sec)  % 60
        text += f"[{minutes}:{seconds}] {chunk.content}\n"


    prompt = f"Interpret the users question naturally if the wording doesn't exactly match the transcript excerpts. You must not state the facts that aren't supported by transcript excerpts. Transcript excerpts:{text} and User Question: {query}"

    response = await _client.aio.models.generate_content(
        model=settings.generation_model,
        contents=prompt
    )

    return response.text