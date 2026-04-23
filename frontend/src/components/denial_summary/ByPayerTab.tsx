import { useState, useMemo } from "react";
import type { DenialLine, ByPayerRow } from "../../types/denial_summary";
import { topValue, useSortable } from "../../utils/denial_summary"
import { fmtFull } from "../../utils/formatters"
import { Th } from "./TableHeader";

export function ByPayerTab({ lines }: { lines: DenialLine[] }) {
  const [search, setSearch] = useState("");
 
  const rows = useMemo<ByPayerRow[]>(() => {
    const map = new Map<string, DenialLine[]>();
    lines.forEach((l) => {
      if (!map.has(l.payer)) map.set(l.payer, []);
      map.get(l.payer)!.push(l);
    });
    return [...map.entries()].map(([payer, items]) => ({
      payer,
      occurrence_count: new Set(items.map((i) => i.procedure_code)).size,
      unique_claims:    new Set(items.map((i) => i.claim_number)).size,
      total_denied:     items.reduce((s, i) => s + i.denied_amount, 0),
      top_carc:         topValue(items.map((i) => i.carc_code)),
      top_procedure:    topValue(items.map((i) => i.procedure_code)),
    }));
  }, [lines]);
 
  const filtered = useMemo(() =>
    rows.filter((r) => !search || r.payer.toLowerCase().includes(search.toLowerCase())),
    [rows, search]);
 
  const { sorted, sortKey, sortDir, handleSort } = useSortable(filtered);
 
  return (
    <>
      <div className="row g-2 mb-3">
        <div className="col-12 col-md-4">
          <input className="form-control form-control-sm" placeholder="Search payer…"
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <Th label="Payer"         col="payer"            sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <Th label="Occurrences"   col="occurrence_count" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} align="text-end" />
              <Th label="Unique Claims" col="unique_claims"    sortKey={sortKey} sortDir={sortDir} onSort={handleSort} align="text-end" />
              <Th label="Total Denied"  col="total_denied"     sortKey={sortKey} sortDir={sortDir} onSort={handleSort} align="text-end" />
              <Th label="Top CARC Code" col="top_carc"         sortKey={sortKey} sortDir={sortDir} onSort={handleSort} align="text-end"/>
              <Th label="Top Procedure" col="top_procedure"    sortKey={sortKey} sortDir={sortDir} onSort={handleSort} align="text-end"/>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={r.payer}>
                <td className="fw-semibold text-dark" style={{ fontSize: 13 }}>{r.payer}</td>
                <td className="text-end fw-semibold" style={{ fontSize: 13 }}>{r.occurrence_count}</td>
                <td className="text-end text-muted" style={{ fontSize: 13 }}>{r.unique_claims}</td>
                <td className="text-end fw-semibold text-danger" style={{ fontSize: 13 }}>{fmtFull(r.total_denied)}</td>
                <td className="text-end fw-semibold" style={{ color: "#004394", fontSize: 13 }}>{r.top_carc}</td>
                <td className="text-end text-muted" style={{ fontSize: 13 }}>{r.top_procedure}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}