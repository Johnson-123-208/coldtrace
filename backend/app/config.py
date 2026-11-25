from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="COLDTRACE_", env_file=".env", extra="ignore")

    database_url: str = "sqlite:///./coldtrace.db"
    cors_origins: str = "http://localhost:5180"
    host: str = "0.0.0.0"
    port: int = 8008

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()