from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

class Settings(BaseSettings):
    PROJECT_NAME: str = "Planificador Inteligente de Ruta de Estudio"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Supabase config
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

@lru_cache
def get_settings() -> Settings:
    return Settings()
