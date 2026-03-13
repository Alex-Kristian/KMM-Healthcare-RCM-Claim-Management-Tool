from fastapi import APIRouter, Depends
from app.dependencies.auth import authenticate

router = APIRouter(
    prefix="/test",
    dependencies=[Depends(authenticate)]
)

@router.get("/")
def get_patients():
    return {"Test work"}