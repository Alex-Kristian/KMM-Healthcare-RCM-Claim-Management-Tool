import { useState, useMemo } from "react";
import { useSortable } from "../../utils/denial_summary"
import { fmtFull, fmtDate, formatDenialCategory } from "../../utils/formatters"
import { Th } from "../denial_summary/TableHeader";
import type { PreSubmissionClaim } from "../../types/PreSubmissionClaim";

export function ClaimDenialPredictionTable({ claims, onDelete }: { claims: PreSubmissionClaim[], onDelete:(claimId: number) => void }) {
 
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
 
  const { sorted, sortKey, sortDir, handleSort } = useSortable(claims, "denial_probability", -1);

  const totalPages = Math.ceil(sorted.length / pageSize);

  const paginated = useMemo(() =>
  sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize),
  [sorted, currentPage]
  );

  return (
    <>
      {claims.length === 0 ? (
        <div className="text-center text-muted py-5">
          <i className="bi bi-search d-block mb-2" style={{ fontSize: 36 }} />
            <p className="mb-0" style={{ fontSize: 14 }}>No claim data found.</p>
        </div>
        ) : (
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
        {/*Table Headers*/}
          <thead className="table-light">
            <tr>
              <Th label="Claim ID"                  col="id"                    sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <Th label="CPT Code"                  col="cpt_code"              sortKey={sortKey} sortDir={sortDir} onSort={handleSort} align="text-center" />
              <Th label="Modifier"                  col="modifier"              sortKey={sortKey} sortDir={sortDir} onSort={handleSort} align="text-center" />
              <Th label="Primary Diagnosis"         col="primary_icd10_dx"      sortKey={sortKey} sortDir={sortDir} onSort={handleSort} align="text-center" />
              <Th label="Payer"                     col="payer"                 sortKey={sortKey} sortDir={sortDir} onSort={handleSort} align="text-center"/>
              <Th label="Amount"                    col="claim_amount_usd"      sortKey={sortKey} sortDir={sortDir} onSort={handleSort} align="text-center"/>
              <Th label="Processed"                 col="uploadedAt"            sortKey={sortKey} sortDir={sortDir} onSort={handleSort} align="text-center"/>
              <Th label="Predicted Denial Type"     col="denial_category"       sortKey={sortKey} sortDir={sortDir} onSort={handleSort} align="text-center"/>
              <Th label="Denial Risk Score"         col="denial_probability"    sortKey={sortKey} sortDir={sortDir} onSort={handleSort} align="text-center"/>
              <th></th>  
            </tr>
          </thead>
          <tbody>
            {/*Table Rows*/}
            {paginated.map((c) => (
              <tr key={c.id}>
                <td className="fw-semibold fw-semibold" style={{ fontSize: 13 }}>{c.claim_identifier}</td>
                <td className="text-center fw-semibold" style={{ fontSize: 13 }}>{c.pre_submission_services[0].cpt_code ?? "-"}</td>
                <td className="text-center fw-semibold" style={{ fontSize: 13 }}>{c.pre_submission_services[0].modifier ?? "-"}</td>
                <td className="text-center fw-semibold" style={{ fontSize: 13 }}>{c.primary_icd10_dx}</td>
                <td className="text-center fw-semibold" style={{ fontSize: 13 }}>{c.payer}</td>
                <td className="text-end fw-semibold "   style={{ fontSize: 13 }}>{fmtFull(c.claim_amount_usd ?? undefined)}</td>
                <td className="text-center fw-semibold" style={{ fontSize: 13 }}>{fmtDate(c.uploadedAt)}</td>
                <td className="text-center fw-semibold" style={{ fontSize: 13 }}>{formatDenialCategory(c.denial_category ?? undefined)}</td>
                <td className="text-center"             style={{ fontSize: 16 }}>
                {c.denial_probability != null ? (
                    c.denial_probability >= 0.7 ? (
                    <span className="badge bg-danger px-3 py-2">
                        <div>High Risk</div>
                        <div>{(c.denial_probability * 100).toFixed(0)}</div>
                    </span>
                    ) : c.denial_probability >= 0.4 ? (
                    <span className="badge bg-warning text-dark px-3 py-2">
                        <div>Med Risk</div>
                        <div>{(c.denial_probability * 100).toFixed(0)}</div>
                    </span>
                    ) : (
                    <span className="badge bg-success px-3 py-2">
                        <div>Low Risk</div>
                        <div>{(c.denial_probability * 100).toFixed(0)}</div>
                    </span>
                    )
                    ) : (
                    <span className="badge bg-secondary">
                        Unknown
                    </span>
                )}
                </td>
                <td className="text-end"><button className="btn btn-sm btn-outline-danger"
                    onClick={() =>
                        onDelete(c.id)
                    }>
                    <i className="bi bi-trash" />
                    </button>
                </td>    
              </tr>
            ))}
          </tbody>
        </table>
        {/* Pagination */}
            {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-3 pt-2">
                <small className="text-muted" style={{ fontSize: 12 }}>
                Showing {Math.min((currentPage - 1) * pageSize + 1, sorted.length)}–
                {Math.min(currentPage * pageSize, sorted.length)} of {sorted.length}
                </small>
                <nav>
                <ul className="pagination pagination-sm mb-0">
                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                    <button className="page-link" onClick={() => setCurrentPage((p) => p - 1)}>&laquo;</button>
                    </li>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                    .reduce<(number | "…")[]>((acc, p, i, arr) => {
                        if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push("…");
                        acc.push(p);
                        return acc;
                    }, [])
                    .map((p, i) =>
                        p === "…" ? (
                        <li key={`ell-${i}`} className="page-item disabled"><span className="page-link">…</span></li>
                        ) : (
                        <li key={p} className={`page-item ${currentPage === p ? "active" : ""}`}>
                            <button className="page-link" onClick={() => setCurrentPage(p as number)}>{p}</button>
                        </li>
                        )
                    )}
                    <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                    <button className="page-link" onClick={() => setCurrentPage((p) => p + 1)}>&raquo;</button>
                    </li>
                </ul>
                </nav>
            </div>
            
            )
            }
      </div>
    )}
    
    </>
  );
}