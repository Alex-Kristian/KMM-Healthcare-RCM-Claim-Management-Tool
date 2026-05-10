from .era import Base
from sqlalchemy import Column, Integer, String, ForeignKey, Numeric, Date, Boolean
from sqlalchemy.orm import relationship
from datetime import date


class PreSubmissionClaim(Base):
    __tablename__ = "pre_submission_claims"

    id = Column(Integer, primary_key=True)
    claim_identifier = Column(String(255))
    uploadedAt = Column(Date, default=date.today)
    claim_type = Column(String(255))

    # Payer Information
    payer_type = Column(String(255))
    payer = Column(String(255))

    # Provider Information
    provider_specialty = Column(String(255))
    billing_provider = Column(String(255))

    # Claim Details
    service_date = Column(Date)
    claim_amount_usd = Column(Numeric(12, 2))
    cpt_code = Column(String(255))
    modifier = Column(String(255))
    primary_icd10_dx = Column(String(255))
    secondary_dx_count = Column(Integer)

    documentation_completeness = Column(Numeric(3, 2))

    prior_auth_required = Column(Boolean)
    prior_auth_obtained = Column(Boolean)
    prior_auth_number = Column(String(255))

    denial_prediction = Column(Boolean)
    denial_probability = Column(Numeric(3, 2))
    denial_category = Column(String(255))

    pre_submission_services = relationship(
        "PreSubmissionService",
        back_populates="pre_submission_claim",
        cascade="all, delete-orphan"
    )
    


class PreSubmissionService(Base):
    __tablename__ = "pre_submission_services"

    id = Column(Integer, primary_key=True)
    cpt_code = Column(String(255))
    modifier = Column(String(255))

    # Pre Submission Claim 
    pre_submission_claim_id = Column(Integer, ForeignKey("pre_submission_claims.id", ondelete="CASCADE"))
    pre_submission_claim = relationship("PreSubmissionClaim", back_populates="pre_submission_services")
