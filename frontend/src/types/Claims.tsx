export interface Adjustment {
  group: string;
  reason: string;
  amount: number;
}

export interface ServiceLine {
  id: number;
  procedure_code: string;
  charge: number;
  paid: number;
  service_date: string;
  adjustments: Adjustment[];
}

export interface Claim {
  id: number;
  patient_name: string;
  payer: string;
  claim_number: string;
  total_charge: number;
  paid_amount: number;
  patient_responsibility: number;
  status: string;
  statement_from_date: string;
  statement_to_date: string;
  provider: string;
  days_in_ar: number;
  is_first_pass: boolean;
  payment_date: string;
}

export interface ClaimDetail extends Claim {
  services: ServiceLine[];
}