from sqlalchemy import Column, Integer, String, ForeignKey, Numeric, Date, Boolean
from datetime import date
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import relationship
from sqlalchemy import func

class Base(DeclarativeBase):
    pass

class EraFile(Base):
    __tablename__ = "era_files"

    id = Column(Integer, primary_key=True)

    payee_name = Column(String(255))
    payee_npi = Column(String(20))

    total_actual_provider_payment = Column(Numeric(12, 2))
    payment_method = Column(String(10))
    payment_date = Column(Date)

    trace_number = Column(String(100))

    created_at = Column(Date, default=date.today)

    claims = relationship(
        "Claim",
        back_populates="era_file",
        cascade="all, delete-orphan"
    )

class Payer(Base):
    __tablename__ = "payers"
    id = Column(Integer, primary_key=True)
    payer_identifier = Column(String(80), unique=True, nullable=False)
    payer_name = Column(String(255), nullable=False)

    claims = relationship("Claim", back_populates="payer")

class Claim(Base):
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True)
    previous_claim_id = Column(Integer)
    created_at = Column(Date, default=date.today)
    
    #Payer/Payee Information
    payer_id = Column(Integer, ForeignKey("payers.id"))
    patient_control_number = Column(String(50), nullable=False)
    payer = relationship("Payer", back_populates="claims")

    #ERA 
    era_file_id = Column(Integer, ForeignKey("era_files.id"))
    era_file = relationship("EraFile", back_populates="claims")

    claim_status_code = Column(String(2))
    is_denied = Column(Boolean, default=False)
    is_current = Column(Boolean, default=True, nullable=False)
    is_first_pass = Column(Boolean, default=False)
    total_charge_amount = Column(Numeric(12, 2))
    paid_amount = Column(Numeric(12, 2))
    patient_responsibility = Column(Numeric(12, 2))

    patient_first_name = Column(String(50))
    patient_last_name = Column(String(50))
    patient_member_id = Column(String(80))

    rendering_provider_npi = Column(String(20))

    statement_from_date = Column(Date)
    statement_to_date = Column(Date)
    final_payment_date = Column(Date)

    service_lines = relationship(
        "ServiceLine",
        back_populates="claim",
        cascade="all, delete-orphan"
    )


class ServiceLine(Base):
    __tablename__ = "service_lines"

    id = Column(Integer, primary_key=True)
    claim_id = Column(Integer, ForeignKey("claims.id"))

    procedure_code = Column(String(10))
    modifier = Column(String(10))

    charge_amount = Column(Numeric(12, 2))
    paid_amount = Column(Numeric(12, 2))

    revenue_code = Column(String(10))
    units = Column(String(10))

    allowed_amount = Column(Numeric(12, 2))
    service_date = Column(Date)

    claim = relationship("Claim", back_populates="service_lines")

    adjustments = relationship(
        "Adjustment",
        back_populates="service_line",
        cascade="all, delete-orphan"
    )


class Adjustment(Base):
    __tablename__ = "adjustments"

    id = Column(Integer, primary_key=True)
    service_line_id = Column(Integer, ForeignKey("service_lines.id"))

    group_code = Column(String(5))
    reason_code = Column(String(10))
    amount = Column(Numeric(12, 2))

    service_line = relationship("ServiceLine", back_populates="adjustments")