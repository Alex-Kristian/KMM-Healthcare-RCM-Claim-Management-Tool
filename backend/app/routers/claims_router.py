from fastapi import APIRouter, Depends
from app.db import get_db
from app.dependencies.auth import authenticate
from app.services.claims_service import ClaimsService
from app.schema.denial_line_schema import DenialLineSchema


router = APIRouter(
    prefix="/claims",
    dependencies=[Depends(authenticate)]
)


@router.get("")
async def get_claims(db=Depends(get_db)):
    service = ClaimsService(db)
    return await service.list_claims()

@router.get("/denials", response_model=list[DenialLineSchema])
async def get_claim_denial_lines(db=Depends(get_db)):
    claims_service = ClaimsService(db)
    return await claims_service.get_denial_lines()

@router.get("/{claim_id:int}")
async def get_claim_detail(claim_id: int, db=Depends(get_db)):
    service = ClaimsService(db)
    claim = await service.get_claim_details(claim_id)

    if not claim:
        return {"error": "Claim not found"}

    return claim
