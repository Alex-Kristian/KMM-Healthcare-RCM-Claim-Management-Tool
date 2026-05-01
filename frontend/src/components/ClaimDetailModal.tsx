import type { ClaimDetail } from "../types/Claims";
import { fmtFull, fmtDate } from "../utils/formatters";
import { StatusBadge } from "../utils/claims";
import api from "../api/apiClient"

 
interface Props {
  claim: ClaimDetail | null;
  loading: boolean;
  onClose: () => void;
  onRefresh: () => Promise<void>;
}


export default function ClaimDetailModal({ claim, loading, onClose, onRefresh }: Props) {
  if (!claim && !loading) return null;
 
  const balance = Math.max(
    0,
    (claim?.total_charge ?? 0) - (claim?.paid_amount ?? 0) - (claim?.patient_responsibility ?? 0)
  );

  const handleConfirmDelete = async (claimId: number) => {  
  try {
    await api.delete(`/claims/${claimId}`);
    await onRefresh();
    onClose();
  } catch (err) {
    console.error(err);
  }
};
  return (
    <div
      className="modal fade show"
      style={{ display: "block", backgroundColor: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-xl modal-dialog-scrollable"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content border-0 shadow" style={{ borderRadius: 12 }}>
 
          {/* Header */}
          <div className="modal-header border-0 px-4 pt-4 pb-3">
            <div>
              <p className="text-primary fw-semibold mb-1" style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Claim Details 
              </p>
              <h5 className="fw-bold text-dark mb-0" style={{ fontSize: 20, letterSpacing: "-0.01em" }}>
                <i className="text-primary" />
                {loading ? "Loading…" : `Claim #${claim?.claim_number} `}
                {!loading && <StatusBadge status={claim?.status} />}
              </h5>
            </div>
              <button className="btn-close" onClick={onClose} />
          </div>
 
          {/* Body */}
          <div className="modal-body px-4 pb-4 pt-0">
 
            {loading && (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status" style={{ width: 32, height: 32 }} />
                <p className="text-muted mt-3 mb-0" style={{ fontSize: 13 }}>Loading claim details…</p>
              </div>
            )}
 
            {!loading && claim && (
              <>
                {/* KPI Cards */}
                <div className="row g-3 mb-4">
                  {[
                    { label: "Total Billed",  value: fmtFull(claim.total_charge),          icon: "bi-currency-dollar", color: "text-light-blue"                           },
                    { label: "Paid",          value: fmtFull(claim.paid_amount),            icon: "bi-graph-up-arrow",  color: "text-success"                           },
                    { label: "Patient Resp.", value: fmtFull(claim.patient_responsibility), icon: "bi-person-fill",     color: "text-secondary"                         },
                    { label: "Balance",       value: fmtFull(balance),                      icon: "bi-clock-fill",      color: balance > 0 ? "text-warning" : "text-success" },
                  ].map((kpi) => (
                    <div key={kpi.label} className="col-6 col-md-3">
                      <div className="card border-0 shadow-sm text-center py-3 bg-white" style={{ borderRadius: 10 }}>
                        <i className={`bi ${kpi.icon} ${kpi.color}`} style={{ fontSize: 22 }} />
                        <div className="text-muted mt-1" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 600 }}>{kpi.label}</div>
                        <div className={`fw-bold ${kpi.color}`} style={{ fontSize: 20 }}>{kpi.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
 
                {/* Claim Info */}
                <div className="card border-0 shadow-sm bg-white mb-4" style={{ borderRadius: 10 }}>
                  <div className="card-body px-4 py-3">
                    <h6 className="fw-bold text-dark mb-3">
                      <i className="bi bi-info-circle me-1 text-primary" />Claim Information
                    </h6>
                    <div className="row g-3">
                      <div className="col-6 col-md-3">
                        <p className="text-muted mb-1" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>Patient</p>
                        <p className="fw-semibold text-dark mb-0" style={{ fontSize: 14 }}>{claim.patient_name || "—"}</p>
                      </div>
                      <div className="col-6 col-md-3">
                        <p className="text-muted mb-1" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>Payer</p>
                        <p className="fw-semibold text-dark mb-0" style={{ fontSize: 14 }}>{claim.payer || "—"}</p>
                      </div>
                      <div className="col-6 col-md-3">
                        <p className="text-muted mb-1" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>Service Date</p>
                        <p className="fw-semibold text-dark mb-0" style={{ fontSize: 14 }}>{fmtDate(claim.statement_from_date) || "—"}</p>
                      </div>
                      <div className="col-6 col-md-3">
                        <p className="text-muted mb-1" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>Payment Date</p>
                        <p className="fw-semibold text-dark mb-0" style={{ fontSize: 14 }}>{fmtDate(claim.payment_date) || "—"}</p>
                      </div>
                    </div>
                  </div>
                </div>
 
                {/* Service Lines */}
                <div className="card border-0 shadow-sm bg-white" style={{ borderRadius: 10 }}>
                  <div className="card-body px-4 py-3">
                    <h6 className="fw-bold text-dark mb-1">
                      <i className="bi bi-list-ul me-1 text-primary" />Service Lines
                    </h6>
                    <p className="text-muted mb-3" style={{ fontSize: 12 }}>Procedure-level charges, payments, and adjustments</p>
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                          <tr>
                            {["CPT Code", "Date of Service", "Charge", "Paid", "Adjustments"].map((h) => (
                              <th key={h} style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "#6c757d" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {claim.services?.length > 0 ? (
                            claim.services.map((s) => (
                              <tr key={s.id}>
                                <td className="fw-bold font-monospace" style={{ fontSize: 13 }}>{s.procedure_code}</td>
                                <td className="text-muted" style={{ fontSize: 13 }}>{fmtDate(s.service_date) || "—"}</td>
                                <td style={{ fontSize: 13 }}>{fmtFull(s.charge)}</td>
                                <td className="fw-semibold text-success" style={{ fontSize: 13 }}>{fmtFull(s.paid)}</td>
                                <td style={{ fontSize: 13 }}>
                                  {s.adjustments.length === 0 ? (
                                    <span className="text-muted">—</span>
                                  ) : (
                                    s.adjustments.map((a, i) => (
                                      <div key={i} className="d-flex align-items-center gap-2 mb-1">
                                        <span
                                          className="badge rounded-pill"
                                          style={{ background: "#fff5f5", color: "#dc3545", border: "1px solid #f5c6cb", fontSize: 11, fontWeight: 600 }}
                                        >
                                          <i/>{a.group}-{a.reason}
                                        </span>
                                        <span className="text-danger fw-semibold">−{fmtFull(a.amount)}</span>
                                      </div>
                                    ))
                                  )}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={5} className="text-center text-muted py-4" style={{ fontSize: 13 }}>
                                <i className="bi bi-inbox d-block mb-1" style={{ fontSize: 24 }} />
                                No service lines found
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                  <div className="modal-footer border-0 px-0 pt-4">
                    <button
                      className="btn btn-danger px-2"
                      onClick={() => {
                        if (window.confirm("Are you sure you want to delete this claim?")) {
                               try {
                                handleConfirmDelete(claim.id)
                               } catch (err) {
                                 console.error(err);
                               }   
                        }
                      }}
                    >
                      <i className="bi bi-trash me-1" />
                      Delete Claim
                    </button>
                  </div>
              </>
            )}
          </div>
 
        </div>
      </div>
    </div>
  );
}