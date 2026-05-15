from fastapi import APIRouter, Depends
from app.db import get_db
from app.dependencies.auth import authenticate
from app.services.claims_service import ClaimsService
from app.schema.denial_line_schema import DenialLineSchema
from datetime import date


router = APIRouter(
    prefix="/claims",
    dependencies=[Depends(authenticate)]
)


@router.get("")
async def get_claims(date_from: date|None = None, date_to: date | None = None, db=Depends(get_db)):
    """
    Gets a list of Claims processed to and from dates
    """
    service = ClaimsService(db)
    return await service.list_claims(date_from, date_to)


@router.get("/denials", response_model=list[DenialLineSchema])
async def get_claim_denial_lines(db=Depends(get_db)):
    """
    Gets a list of denial lines for the Denial Summary
    Return: list[DenialLineSchema]
    """
    claims_service = ClaimsService(db)
    return await claims_service.get_denial_lines()


@router.get("/{claim_id:int}")
async def get_claim_detail(claim_id: int, db=Depends(get_db)):
    """
    Gets extended Claim details of Claim by ID
    """
    service = ClaimsService(db)
    claim = await service.get_claim_details(claim_id)

    if not claim:
        return {"error": "Claim not found"}

    return claim


@router.delete("/{claim_id:int}")
async def delete_claim(claim_id: int, db=Depends(get_db)):
    """
    Deletes a Claim by ID
    """
    service = ClaimsService(db) 
    claim = await service.delete_claim(claim_id)

    if claim:
        return {"message": "Claim deleted"}
    else:
        return {"error": "Claim not found"}