from datetime import date
from app.models.era import Adjustment, ServiceLine, Claim


def calc_days_in_ar(service_date, payment_date):
    """
    Calculates days in A/R
    Param: service_date: date, Date of service
    Param: payment_date: date, Date of Claim payment
    Return: int, Days in A/R
    """
    if not service_date:
        return None
    end_date = payment_date if payment_date else date.today()
    return (end_date - service_date).days


def assign_missing_claim_total_values(claim:Claim, service_lines:list[ServiceLine], adjustments:list[Adjustment]):
    """
    Calculates patient responsibility, paid amount, and total charge of a Claim from ServiceLines and Adjustments if the values are not given
    """
    if claim.patient_responsibility == 0:
        claim.patient_responsibility = calc_patient_responsibility(adjustments)

    if claim.paid_amount == 0 and not claim.claim_status_code == '4':
        claim.paid_amount = calc_paid_amount(service_lines)
    
    if claim.total_charge_amount == 0:
        claim.total_charge_amount = calc_total_charge(service_lines)


def calc_patient_responsibility(adjustments:list[Adjustment]):
    """
    Caluculates Claim patient responsibility if not given
    """
    if not adjustments:
        return 0
    patient_responsibility = 0
    for adj in adjustments:
        if adj.group_code == "PR" and adj.reason_code == "2":
            patient_responsibility = patient_responsibility + adj.amount

    return patient_responsibility

def calc_paid_amount(service_lines:list[ServiceLine]):
    """
    Caluculates Claim paid amount if not given
    """
    if not service_lines:
        return 0
    total_paid = 0
    for service in service_lines:
        total_paid = total_paid + service.paid_amount
    
    return total_paid


def calc_total_charge(service_lines:list[ServiceLine]):
    """
    Caluculates Claim total charge if not given
    """
    if not service_lines:
        return 0
    total_charge = 0
    for service in service_lines:
        total_charge = total_charge + service.charge_amount
    
    return total_charge