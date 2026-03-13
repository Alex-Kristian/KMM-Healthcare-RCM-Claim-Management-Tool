import requests
from jose import jwt
from fastapi import HTTPException

from app.core.config import JWKS_URL, COGNITO_ISSUER, settings


class CognitoAuth:

    def __init__(self):
        self.jwks = requests.get(JWKS_URL).json()

    def verify_token(self, token: str):

        try:
            payload = jwt.decode(
                token,
                self.jwks,
                algorithms=["RS256"],
                audience=settings.COGNITO_CLIENT_ID,
                issuer=COGNITO_ISSUER,
            )

            return payload

        except Exception:
            raise HTTPException(status_code=401, detail="Invalid authentication token")


cognito_auth = CognitoAuth()