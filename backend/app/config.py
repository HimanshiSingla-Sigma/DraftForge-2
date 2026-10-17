from functools import lru_cache
from typing import List, Union
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Application Info
    APP_NAME: str = "Legal Drafting AI Platform"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    ENVIRONMENT: str = "production"
    ALLOWED_ORIGINS: Union[str, List[str]] = Field(
        default_factory=lambda: [
            "http://localhost:5173",
            "http://localhost:3000",
            "http://localhost:8000",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:8000",
            "https://draftforge-2-1.onrender.com",
            "https://draftforge-2-d9mc.onrender.com",
        ]
    )

    # Supabase Configuration
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    SUPABASE_SERVICE_ROLE_KEY: str
    SUPABASE_JWT_SECRET: str

    # Supabase Storage Buckets
    SUPABASE_REFERENCE_BUCKET: str = "reference-documents"
    SUPABASE_DRAFT_BUCKET: str = "student-drafts"
    SUPABASE_SUBMISSION_BUCKET: str = "assignment-submissions"

    # Neo4j Aura Cloud
    NEO4J_URI: str
    NEO4J_USERNAME: str
    NEO4J_PASSWORD: str
    NEO4J_DATABASE: str = "neo4j"

    # Qdrant Managed Cloud
    QDRANT_URL: str
    QDRANT_API_KEY: str
    QDRANT_COLLECTION_NAME: str = "legal_reference_corpus"

    # LLM Providers
    LLM_PROVIDER: str = "groq"
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "mistral:latest"

    # Embeddings Configuration
    EMBEDDING_PROVIDER: str = "fastembed"
    EMBEDDING_MODEL: str = "BAAI/bge-small-en-v1.5"

    # Access Control & University Onboarding Configuration
    ALLOWED_COLLEGE_EMAIL_DOMAINS: str = "ncuindia.edu"
    INITIAL_ADMIN_EMAIL: str = "singlahimanshi2@gmail.com"
    INVITATION_EXPIRY_HOURS: int = 72
    APP_BASE_URL: str = "http://localhost:5173"
    STUDENT_EMAIL_POLICY: str = "ANY_VERIFIED"  # "ANY_VERIFIED" or "COLLEGE_DOMAIN_ONLY"

    # Email Notifications Configuration
    EMAIL_PROVIDER: str = "console"  # "console", "resend", "brevo", "sendgrid", "smtp"
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = "noreply@draftforge.ai"
    SMTP_FROM_NAME: str = "DraftForge Legal AI"
    SMTP_USE_TLS: bool = True
    RESEND_API_KEY: str = ""
    RESEND_FROM_EMAIL: str = ""
    BREVO_API_KEY: str = ""
    BREVO_FROM_EMAIL: str = ""
    SENDGRID_API_KEY: str = ""
    SENDGRID_FROM_EMAIL: str = ""

    def get_allowed_college_domains_list(self) -> List[str]:
        return [
            d.strip().lower().lstrip("@")
            for d in self.ALLOWED_COLLEGE_EMAIL_DOMAINS.split(",")
            if d.strip()
        ]

    def normalize_email(self, email: str) -> str:
        return email.strip().lower() if email else ""

    def is_allowed_college_email(self, email: str) -> bool:
        norm = self.normalize_email(email)
        if "@" not in norm:
            return False
        domain = norm.split("@")[-1]
        allowed = self.get_allowed_college_domains_list()
        return domain in allowed

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_allowed_origins(cls, value: Union[str, List[str]]) -> List[str]:
        default_origins = [
            "http://localhost:5173",
            "http://localhost:3000",
            "http://localhost:8000",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:8000",
            "https://draftforge-2-1.onrender.com",
            "https://draftforge-2-d9mc.onrender.com",
        ]
        if not value:
            return default_origins

        if isinstance(value, str):
            parsed = [origin.strip().rstrip("/") for origin in value.split(",") if origin.strip()]
        elif isinstance(value, list):
            parsed = [origin.strip().rstrip("/") if isinstance(origin, str) else origin for origin in value]
        else:
            parsed = []

        seen = set()
        combined = []
        for origin in parsed + default_origins:
            if origin and origin not in seen:
                seen.add(origin)
                combined.append(origin)
        return combined

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


@lru_cache()
def get_settings() -> Settings:
    return Settings()