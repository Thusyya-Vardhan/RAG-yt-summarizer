from app.database import AsyncSessionLocal
from app.services.retrieval_service import retrieve_relevant_chunks
from app.services.generation_service import generate_answer
import asyncio

videoid : str = "W6ttX6a_Xng"
query :str = "what are the 8 brain glitches?"

async def main():
    async with AsyncSessionLocal() as db:
        chunks = await retrieve_relevant_chunks(db, video_id=videoid, query= query )
        print(chunks)
        answer= generate_answer(query=query,  chunks=chunks)
        print(answer)

asyncio.run(main())