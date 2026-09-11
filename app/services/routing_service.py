from google import genai
from google.genai import types
from app.config import settings


_client = genai.Client(api_key=settings.gemini_api_key)

answer_question_fn = types.FunctionDeclaration(
    name="answer_question",
    description=(
        "Use this when the user wants anything specific from the video "
        "and the query can be answered with few excerpts."
    ),
)

summarize_video_fn = types.FunctionDeclaration(
    name="summarize_video",
    description=(
        "Use this when the user wants an overview, summary, or complete list "
        "of everything covered in the video — something that requires the "
        "entire transcript, not just a few excerpts. This includes questions "
        "phrased as direct questions (e.g. 'what are the n things mentioned', 'Tell Me about this video') "
        "if fully answering them requires enumerating multiple items scattered "
        "throughout the video, not just one specific fact."
    ),
)

tool = types.Tool(function_declarations=[answer_question_fn, summarize_video_fn])

async def route_query(query: str) -> str:
    response = await _client.aio.models.generate_content(
        model = settings.generation_model,
        contents = query,
        config = types.GenerateContentConfig(tools=[tool],temperature=0)
    )

    if response.candidates:
        parts = response.candidates[0].content.parts

        for part in parts:
            if part.function_call:
                return part.function_call.name

    return "answer_question"

