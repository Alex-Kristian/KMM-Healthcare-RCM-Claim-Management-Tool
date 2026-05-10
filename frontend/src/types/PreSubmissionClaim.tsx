export interface PreSubmissionService {
    id: number;
    cpt_code: string | null;
    modifier: string | null;
    pre_submission_claim_id: number;
}

export interface PreSubmissionClaim {
    id: number;
    claim_identifier: String | null
    uploadedAt: string;
    claim_type: string | null;

    // Payer Information
    payer_type: string | null;
    payer: string | null;

    // Provider Information
    provider_specialty: string | null;
    billing_provider: string | null;

    // Claim Details
    service_date: string | null;
    claim_amount_usd: number | null;
    cpt_code: string | null;
    modifier: string | null;
    primary_icd10_dx: string | null;
    secondary_dx_count: number | null;
    documentation_completeness: number | null;

    //Prediction Values
    denial_prediction: boolean | null;
    denial_probability: number | null;
    denial_category: string | null;

    pre_submission_services:
    PreSubmissionService[];
}