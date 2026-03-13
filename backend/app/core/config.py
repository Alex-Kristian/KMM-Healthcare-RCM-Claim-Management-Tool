from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    CORS_ORIGINS: str

    AWS_REGION: str
    COGNITO_USER_POOL_ID: str
    COGNITO_CLIENT_ID: str

    class Config:
        env_file = ".env"


settings = Settings()

COGNITO_ISSUER = f"https://cognito-idp.{settings.AWS_REGION}.amazonaws.com/{settings.COGNITO_USER_POOL_ID}"

JWKS_URL = f"{COGNITO_ISSUER}/.well-known/jwks.json"