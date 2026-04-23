export interface DenialLine {
  service_line_id: number;
  claim_id: number;
  claim_number: string;
  patient_name: string;
  payer: string;
  service_date: string;
  procedure_code: string;       
  carc_code: string;             
  carc_group: string;           
  carc_description: string;      
  denied_amount: number;         
}
 
export interface ByCodeRow {
  carc_code: string;
  carc_group: string;
  carc_description: string;
  occurrence_count: number;
  unique_claims: number;
  total_denied: number;
  payers_affected: number;
  procedures_affected: number;
}
 
export interface ByPayerRow {
  payer: string;
  occurrence_count: number;
  unique_claims: number;
  total_denied: number;
  top_carc: string;
  top_procedure: string;
}
 
export interface ByCPTRow {
  procedure_code: string;
  occurrence_count: number;
  unique_claims: number;
  total_denied: number;
  top_carc: string;
  payers_affected: number;
}
 
export interface ByClientRow {
  patient_name: string;
  occurrence_count: number;
  unique_claims: number;
  total_denied: number;
  top_carc: string;
  top_payer: string;
}

export type SortDir = 1 | -1