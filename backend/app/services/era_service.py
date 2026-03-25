from app.parsers.era_parser import parse_era
from app.repositories.era_repository import EraRepository


class EraService:
    def __init__(self, db):
        self.repo = EraRepository(db)

    async def process_era(self, raw_text: str, filename: str = "upload.835"):
        era_data = parse_era(raw_text)

        if not era_data:
            raise Exception("Failed to parse ERA")

        return await self.repo.create_full_era(era_data, filename)