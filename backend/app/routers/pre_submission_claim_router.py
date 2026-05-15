from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import get_db
from app.services.pre_submission_claim_service import PreSubmissionClaimService
from app.schema.pre_submission_claim_schema import PreSubmissionClaimResponse
from app.dependencies.auth import authenticate
from datetime import date


router = APIRouter(
    prefix="/pre_submission_claims",
    dependencies=[Depends(authenticate)]
)


@router.post("/upload")
async def process_pre_submission_claims(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    """
    Parses and saves uploaded EDI data
    """
    try:
        content_bytes = await file.read()
        raw_text = content_bytes.decode()

        service = PreSubmissionClaimService(db)

        result = await service.process_edi_837(raw_text=raw_text)

        return {
            "message": "EDI processed successfully",
            "Pre Submission Claims Processed": len(result)
        }

    except UnicodeDecodeError:
        raise HTTPException(
            status_code=400,
            detail="File must be a valid text-based EDI (837) file"
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@router.get("", response_model=list[PreSubmissionClaimResponse])
async def list_pre_submission_claims(date_from: date|None = None, date_to: date | None = None, db=Depends(get_db)):
    """
    Retrieves a list of pre submission claims from and to processed date
    Return: list[PreSubmissionResponse]
    """
    service = PreSubmissionClaimService(db)
    return await service.list_pre_submission_claims()

@router.delete("/{pre_submission_claim_id}")
async def delete_pre_submission_claim(
    pre_submission_claim_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Deletes a PreSubmissionClaim by its ID
    """
    service = PreSubmissionClaimService(db)

    deleted = await service.delete_pre_submission_claim(pre_submission_claim_id)

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Claim not found"
        )
    return{
        "message": "Claim deleted successfully"
    }