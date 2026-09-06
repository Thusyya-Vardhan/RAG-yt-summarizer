from google import genai
from google.genai import types
from app.config import settings


_client = genai.Client(api_key=settings.gemini_api_key)

answer_question_fn = types.FunctionDeclaration(
    name="answer_question",
    description="Use this when the user asks a specific, targeted question about the video's content — something that could be answered by looking at one or a few relevant excerpts.",
)

summarize_video_fn = types.FunctionDeclaration(
    name="summarize_video",
    description="Use this when the user wants an overview, summary, or complete list of everything covered in the video — something that requires the entire transcript, not just a few excerpts.",
)

tool = types.Tool(function_declarations=[answer_question_fn, summarize_video_fn])

def route_query(query: str) -> str:
    response = _client.models.generate_content(
        model = settings.generation_model,
        contents = query,
        config = types.GenerateContentConfig(tools=[tool])
    )

    if response.candidates:
        parts = response.candidates[0].content.parts

        for part in parts:
            if part.function_call:
                return part.function_call.name

    return "answer_question"

