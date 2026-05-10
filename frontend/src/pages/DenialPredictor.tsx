import { useEffect, useState } from "react";
import api from "../api/apiClient";
import { ClaimDenialPredictionTable } from "../components/denial_predictor/ClaimPredictionTable";


import type { PreSubmissionClaim } from "../types/PreSubmissionClaim"; 

 
 
export default function DenialPredictor() {
    const [preSubmissionClaims, setPreSubmissionClaims] = useState<PreSubmissionClaim[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


 
    useEffect(() => {
        setLoading(true);
        api.get("/pre_submission_claims")
        .then((res) => setPreSubmissionClaims(res.data))
        .catch((err) => { console.error(err); setError("Failed to load claim prediction data."); })
        .finally(() => setLoading(false));
    }, []);
 
    const handleDeleteClaim =
        async (claimId: number) => {

        const confirmed =
            window.confirm(
            "Delete this claim?"
            );

        if (!confirmed) return;

        try {
            await api.delete(`/pre_submission_claims/${claimId}`);
            setPreSubmissionClaims((prev) => prev.filter((c) => c.id !== claimId));
        } catch (err) {
            console.error(err);
            alert("Failed to delete claim.");
        }
        };


    if (loading) {
        return (
        <div className="d-flex align-items-center justify-content-center min-vh-100 bg-white">
            <div className="text-center">
            <div className="spinner-border text-primary" role="status" style={{ width: 40, height: 40 }} />
            <p className="text-muted mt-3 mb-0" style={{ fontSize: 14 }}>Loading claim denial predcition data…</p>
            </div>
        </div>
        );
    }
 
    return (
        <div className="bg-light min-vh-100 py-4 px-4">
    
            {/* Page Header */}
            <div className="card border-0 shadow-sm bg-white mb-4" style={{ borderRadius: 10 }}>
                <div className="card-body px-4 py-3">
                <p className="text-primary fw-semibold mb-1" style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    Revenue Cycle Management
                </p>
                <h1 className="fw-bold text-dark mb-1" style={{ fontSize: 24, letterSpacing: "-0.02em" }}>
                    <i className="bi bi-shield-fill-exclamation me-2 text-primary" />
                    Claim Denial Predictor
                </h1>
                </div>
            </div>
        
            {error && <div className="alert alert-danger mb-4">{error}</div>}
            
            {/* Table */}
            <div className="card border-0 shadow-sm bg-white" style={{ borderRadius: 10 }}>
                <div className="card-body px-4 py-3">
                    <ClaimDenialPredictionTable 
                        claims={preSubmissionClaims}
                        onDelete={handleDeleteClaim} />
                </div>
            </div>
        </div>
    );
}