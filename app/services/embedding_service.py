from google import genai
from google.genai import types

from app.config import settings

_client = genai.Client(api_key=settings.gemini_api_key)


def _chunked(items: list, size: int):
    for i in range(0, len(items), size):
        yield items[i : i + size]


def embed_texts(texts: list[str]) -> list[list[float]]:
    """
    Embeds a list of chunk texts in batches (settings.embedding_batch_size
    per call) rather than one API call per chunk. A 2hr video can produce
    150+ chunks - one-by-one embedding would mean 150+ sequential round
    trips, which is both slow and wasteful given the API accepts a content
    list per call.

    output_dimensionality truncates gemini-embedding-001's native 3072-dim
    output down to settings.embedding_dim (768) via Matryoshka
    representation learning - the model is trained so leading dimensions
    carry the most signal, so truncation is a supported, intentional
    tradeoff (smaller storage/faster HNSW search) rather than just
    dropping data. Must match the Vector() width in models.py exactly or
    inserts fail.

    task_type=RETRIEVAL_DOCUMENT tells the model this text is being
    embedded for storage/retrieval-as-a-target, which measurably improves
    retrieval quality vs leaving task_type unset.
    """
    all_embeddings: list[list[float]] = []

    for batch in _chunked(texts, settings.embedding_batch_size):
        response = _client.models.embed_content(
            model=settings.embedding_model,
            contents=batch,
            config=types.EmbedContentConfig(
                output_dimensionality=settings.embedding_dim,
                task_type="RETRIEVAL_DOCUMENT",
            ),
        )
        all_embeddings.extend([e.values for e in response.embeddings])

    return all_embeddings


def embed_query(text: str) -> list[float]:
    """
    Single-text embedding path for user queries at retrieval time.
    task_type=RETRIEVAL_QUERY (not RETRIEVAL_DOCUMENT) - this asymmetry
    is intentional and part of why task_type improves retrieval quality:
    queries and documents get embedded slightly differently even though
    they land in the same vector space.
    """
    response = _client.models.embed_content(
        model=settings.embedding_model,
        contents=[text],
        config=types.EmbedContentConfig(
            output_dimensionality=settings.embedding_dim,
            task_type="RETRIEVAL_QUERY",
        ),
    )
    return response.embeddings[0].values
