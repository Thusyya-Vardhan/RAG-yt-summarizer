from app.models import Chunk
from google import genai
from app.config import settings

_client = genai.Client(api_key=settings.gemini_api_key)

def summarize_batch(chunks: list[Chunk]) -> str:
    text: str = ""
    for chunk in chunks:
        text += f"{chunk.content}\n"

    prompt = f"summarize the given transcript concisely capturing all the key points . transcript = {text}"

    response = _client.models.generate_content(
        model = settings.generation_model,
        contents = prompt
    )

    return response.text

def summarize_all_chunks(chunks: list[Chunk], batch_size: int =10) -> list[str]:
    batch_summaries = []
    for i in range(0,len(chunks),batch_size):
        batch_summaries.append(summarize_batch(chunks[i: i+batch_size]))
    return batch_summaries

def final_summary_answer(batch_summaries: list[str]) -> str:
    combined = "\n".join(batch_summaries)
    prompt = f"The following are summaries of consecutive sections of video , chunked, summarized independenly , and now have to be merged together to form a well organized summary of entire video . Text = {combined}"

    response = _client.models.generate_content(
        model= settings.generation_model,
        contents= prompt
    )

    return response.text