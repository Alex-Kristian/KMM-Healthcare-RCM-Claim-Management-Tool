from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.security.cognito_auth import cognito_auth

security = HTTPBearer()


def authenticate(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):

    token = credentials.credentials
    return cognito_auth.verify_token(token)