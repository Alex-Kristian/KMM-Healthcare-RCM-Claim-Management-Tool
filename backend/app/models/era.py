from sqlalchemy import Column, Integer, String, ForeignKey, Numeric, Date, DateTime, Boolean
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

class Base(DeclarativeBase):
    pass


class EraFile(Base):
    __tablename__ = "era_files"

    id = Column(Integer, primary_key=True)

    filename = Column(String(255))

    payer_name = Column(String(255))
    payer_id = Column(String(80))
    payee_name = Column(String(255))
    payee_npi = Column(String(20))

    total_actual_provider_payment = Column(Numeric(12, 2))
    payment_method = Column(String(10))
    payment_date = Column(Date)

    trace_number = Column(String(100))

    created_at = Column(DateTime, server_default=func.now())

    claims = relationship(
        "Claim",
        back_populates="era_file",
        cascade="all, delete-orphan"
    )


class Claim(Base):
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True)
    era_file_id = Column(Integer, ForeignKey("era_files.id"))

    patient_control_number = Column(String(50))
    claim_status_code = Column(String(2))
    is_denied = Column(Boolean)

    total_charge_amount = Column(Numeric(12, 2))
    paid_amount = Column(Numeric(12, 2))
    patient_responsibility = Column(Numeric(12, 2))

    patient_first_name = Column(String(50))
    patient_last_name = Column(String(50))
    patient_member_id = Column(String(80))

    rendering_provider_npi = Column(String(20))

    statement_from_date = Column(Date)
    statement_to_date = Column(Date)

    era_file = relationship("EraFile", back_populates="claims")

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