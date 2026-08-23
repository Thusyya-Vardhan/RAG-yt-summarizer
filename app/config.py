from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):

    database_url: str

    gemini_api_key: str
    generation_model:str  = "gemini-2.5-flash"
    embedding_model:str  = "gemini-embedding-001"
    embedding_dim: int = 768

    #chunking
    chunk_target_chars: int = 800
    chunk_overlap_chars: int = 100

    #embedding batch
    embedding_batch_size: int = 20

    #summarization map reduce
    summary_batch_size: int = 20

    model_config = SettingsConfigDict(env_file=".env")



settings = Settings()
