from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import get_db
from app.services.era_service import EraService
from app.dependencies.auth import authenticate

router = APIRouter(
    prefix="/era",
    dependencies=[Depends(authenticate)]
)

@router.post("/upload")
async def upload_era(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    """Parses and saves ERA file data"""
    try:
        content_bytes = await file.read()
        raw_text = content_bytes.decode()

        service = EraService(db)

        result = await service.process_era(raw_text=raw_text)

        return {
            "message": "ERA processed successfully",
            "Claims Processed": len(result)
        }

    except UnicodeDecodeError:
        raise HTTPException(
            status_code=400,
            detail="File must be a valid text-based ERA (835) file"
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
