import { useEffect, useState, useMemo } from "react";
import api from "../api/apiClient";
import ClaimDetailModal from "../components/ClaimDetailModal";
import type { Claim, ClaimDetail } from "../types/Claims";
import { fmtFull, fmtDate } from "../utils/formatters";
import { StatusBadge } from "../utils/claims";
 
type SortKey = keyof Claim;
type SortDir = 1 | -1;

 
function SortIcon({ col, sortKey, sortDir }: { col: string; sortKey: SortKey; sortDir: SortDir }) {
  if (sortKey !== col) return <i className="bi bi-arrow-down-up ms-1 opacity-25" style={{ fontSize: 10 }} />;
  return <i className={`bi bi-arrow-${sortDir === 1 ? "up" : "down"} ms-1`} style={{ fontSize: 10 }} />;
}
 
const COLS: { key: SortKey; label: string; align?: string }[] = [
  { key: "claim_number",        label: "Claim #"                    },
  { key: "patient_name",        label: "Patient"                    },
  { key: "payer",               label: "Payer"                      },
  { key: "statement_from_date", label: "Service Date"               },
  { key: "payment_date",        label: "Payment Date"               },
  { key: "total_charge",        label: "Billed",  align: "text-end" },
  { key: "paid_amount",         label: "Paid",    align: "text-end" },
  { key: "status",              label: "Status"                     },
];
 

export default function Claims() {
  const [claims, setClaims]   = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
 
  // Filters
  const [search, setSearch]             = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPayer, setFilterPayer]   = useState("");
  const [dateFrom, setDateFrom]         = useState("");
  const [dateTo, setDateTo]             = useState("");
 
  // Sorting
  const [sortKey, setSortKey] = useState<SortKey>("statement_from_date");
  const [sortDir, setSortDir] = useState<SortDir>(-1);
 
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
 
  // Modal
  const [selectedClaim, setSelectedClaim] = useState<ClaimDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [isModalOpen, setIsModalOpen]     = useState(false);
 
  useEffect(() => {
    setLoading(true);
    api.get("/claims")
      .then((res) => setClaims(res.data))
      .catch((err) => { console.error(err); setError("Failed to load claims."); })
      .finally(() => setLoading(false));
  }, []);
 
  const payers = useMemo(
    () => [...new Set(claims.map((c) => c.payer).filter(Boolean))].sort(),
    [claims]
  );
 
  const filteredClaims = useMemo(() => {
    return claims.filter((c) => {
      if (search && !`${c.claim_number} ${c.patient_name} ${c.payer}`.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterStatus && (c.status ?? "").toLowerCase() !== filterStatus) return false;
      if (filterPayer && c.payer !== filterPayer) return false;
      if (dateFrom && (c.statement_from_date ?? "") < dateFrom) return false;
      if (dateTo && (c.statement_to_date ?? "") > dateTo) return false;
      return true;
    });
  }, [claims, search, filterStatus, filterPayer, dateFrom, dateTo]);
 
  const sortedClaims = useMemo(() => {
    return [...filteredClaims].sort((a, b) => {
      const aValue: any = a[sortKey as keyof Claim];
      const bValue: any = b[sortKey as keyof Claim];
 
      // Sort numeric columns
      if (typeof aValue === "number" || typeof bValue === "number") {
        return ((aValue ?? 0) - (bValue ?? 0)) * sortDir;
      }
 
      // Sort string / date columns — makes both strings so comparison never throws 
      // date strings (YYYY-MM-DD) sort correctly with plain string comparison.
      const aString = (aValue ?? "") as string;
      const bString = (bValue ?? "") as string;
 
      if (aString=== "" && bString !== "") return 1;
      if (bString === "" && aString !== "") return -1;
 
      return aString.localeCompare(bString) * sortDir;
    });
  }, [filteredClaims, sortKey, sortDir]);
 
  const totalPages = Math.max(1, Math.ceil(sortedClaims.length / pageSize));
  const paginatedClaims = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedClaims.slice(start, start + pageSize);
  }, [sortedClaims, currentPage]);
 
  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 1 ? -1 : 1));
    else { setSortKey(key); setSortDir(1); }
    setCurrentPage(1);
  }
 
  function clearFilters() {
    setSearch(""); setFilterStatus(""); setFilterPayer("");
    setDateFrom(""); setDateTo(""); setCurrentPage(1);
  }
 
  async function handleRowClick(c: Claim) {
    setIsModalOpen(true);
    setLoadingDetail(true);
    try {
      const res = await api.get(`/claims/${c.id}`);
      setSelectedClaim(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetail(false);
    }
  }
 
  const isFiltered = search || filterStatus || filterPayer || dateFrom || dateTo;
 
  /* Loading */
  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100 bg-white">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" style={{ width: 40, height: 40 }} />
          <p className="text-muted mt-3 mb-0" style={{ fontSize: 14 }}>Loading claims…</p>
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
            <i className="bi bi-file-medical me-2 text-primary" />
            Healthcare Claims
          </h1>
        </div>
      </div>
 
      {error && <div className="alert alert-danger mb-4">{error}</div>}
 
      {/* Filters + Table */}
      <div className="card border-0 shadow-sm bg-white" style={{ borderRadius: 10 }}>
        <div className="card-body px-4 py-3">
 
          {/* Card header row */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            {isFiltered && (
              <button
                className="btn btn-sm btn-outline-secondary"
                style={{ borderRadius: 20, fontSize: 12 }}
                onClick={clearFilters}
              >
                <i className="bi bi-x-circle me-1" />Clear filters
              </button>
            )}
          </div>
 
          {/* Filters */}
          <div className="row g-2 mb-3">
            <div className="col-12 col-md-4">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search claim #, patient, payer…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <div className="col-6 col-md-2">
              <select className="form-select form-select-sm" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}>
                <option value="">All statuses</option>
                <option value="1">Paid</option>
                <option value="2">Partially Paid</option>
                <option value="4">Denied</option>
              </select>
            </div>
            <div className="col-6 col-md-2">
              <select className="form-select form-select-sm" value={filterPayer} onChange={(e) => { setFilterPayer(e.target.value); setCurrentPage(1); }}>
                <option value="">All payers</option>
                {payers.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="col-6 col-md-2">
              <input type="date" className="form-control form-control-sm" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }} />
            </div>
            <div className="col-6 col-md-2">
              <input type="date" className="form-control form-control-sm" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }} />
            </div>
          </div>
 
          {/* Table */}
          {sortedClaims.length === 0 ? (
            <div className="text-center text-muted py-5">
              <i className="bi bi-search d-block mb-2" style={{ fontSize: 36 }} />
              <p className="mb-0" style={{ fontSize: 14 }}>No claims match your filters.</p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      {COLS.map(({ key, label, align }) => (
                        <th
                          key={key}
                          onClick={() => handleSort(key)}
                          className={`${align ?? ""} ${sortKey === key ? "table-active" : ""}`}
                          style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "#6c757d", cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" }}
                        >
                          {label}
                          <SortIcon col={key} sortKey={sortKey} sortDir={sortDir} />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedClaims.map((c) => {
                      return (
                        <tr key={c.id} style={{ cursor: "pointer" }} onClick={() => handleRowClick(c)}>
                          <td className="fw-semibold font-monospace" style={{ fontSize: 13 }}>{c.claim_number}</td>
                          <td className="fw-semibold text-dark" style={{ fontSize: 13 }}>{c.patient_name || "—"}</td>
                          <td className="text-muted" style={{ fontSize: 13 }}>{c.payer || "—"}</td>
                          <td className="text-muted" style={{ fontSize: 13 }}>{fmtDate(c.statement_from_date)}</td>
                          <td className="text-muted" style={{ fontSize: 13 }}>{fmtDate(c.payment_date) || "—"}</td>
                          <td className="text-end" style={{ fontSize: 13 }}>{fmtFull(c.total_charge)}</td>
                          <td className="text-end fw-semibold text-success" style={{ fontSize: 13 }}>{fmtFull(c.paid_amount)}</td>
                          <td><StatusBadge status={c.status} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
 
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                  <small className="text-muted" style={{ fontSize: 12 }}>
                    Showing {Math.min((currentPage - 1) * pageSize + 1, sortedClaims.length)}–
                    {Math.min(currentPage * pageSize, sortedClaims.length)} of {sortedClaims.length}
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
              )}
            </>
          )}
        </div>
      </div>
 
      {/* Modal */}
      {isModalOpen && (
        <ClaimDetailModal
          claim={selectedClaim}
          loading={loadingDetail}
          onClose={() => { setIsModalOpen(false); setSelectedClaim(null); }}
        />
      )}
    </div>
  );
}