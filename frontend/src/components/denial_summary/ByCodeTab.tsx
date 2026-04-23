import { useState, useMemo } from "react";
import type { DenialLine, ByCodeRow } from "../../types/denial_summary";
import {  useSortable } from "../../utils/denial_summary"
import { fmtFull } from "../../utils/formatters"
import { Th } from "./TableHeader";

export function ByCodeTab({ lines }: { lines: DenialLine[] }) {
  const [search, setSearch] = useState("");
 
  const rows = useMemo<ByCodeRow[]>(() => {
    const map = new Map<string, DenialLine[]>();
    lines.forEach((l) => {
      const key = l.carc_code;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(l);
    });
    return [...map.entries()].map(([code, items]) => ({
      carc_code:           code,
      carc_group:          items[0].carc_group,
      carc_description:    items[0].carc_description,
      occurrence_count:    items.length,
      unique_claims:       new Set(items.map((i) => i.claim_number)).size,
      total_denied:        items.reduce((s, i) => s + i.denied_amount, 0),
      payers_affected:     new Set(items.map((i) => i.payer)).size,
      procedures_affected: new Set(items.map((i) => i.procedure_code)).size,
    }));
  }, [lines]);
 
  const filtered = useMemo(() =>
    rows.filter((r) =>
      !search || `${r.carc_code} ${r.carc_description}`.toLowerCase().includes(search.toLowerCase())
    ), [rows, search]);
 
  const { sorted, sortKey, sortDir, handleSort } = useSortable(filtered);
 
  return (
    <>
      <div className="row g-2 mb-3">
        <div className="col-12 col-md-4">
          <input className="form-control form-control-sm" placeholder="Search code or description…"
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <Th label="CARC Group"    col="carc_group"           sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <Th label="CARC Code"     col="carc_code"            sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <Th label="Description"   col="carc_description"     sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <Th label="Occurrence Count"   col="occurrence_count"     sortKey={sortKey} sortDir={sortDir} onSort={handleSort} align="text-end" />
              <Th label="Unique Claims" col="unique_claims"        sortKey={sortKey} sortDir={sortDir} onSort={handleSort} align="text-end" />
              <Th label="Total Denied"  col="total_denied"         sortKey={sortKey} sortDir={sortDir} onSort={handleSort} align="text-end" />
              <Th label="Payers"        col="payers_affected"      sortKey={sortKey} sortDir={sortDir} onSort={handleSort} align="text-end" />
              <Th label="Procedures"    col="procedures_affected"  sortKey={sortKey} sortDir={sortDir} onSort={handleSort} align="text-end" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={r.carc_code}>
                <td><span className="fw-bold font-monospace" style={{ color: "#004394", fontSize: 13 }}>{r.carc_group}</span></td>
                <td><span className="fw-bold font-monospace" style={{ color: "#004394", fontSize: 13 }}>{r.carc_code}</span></td>
                <td className="text-muted" style={{ fontSize: 13 }}>{r.carc_description}</td>
                <td className="text-end fw-semibold" style={{ fontSize: 13 }}>{r.occurrence_count}</td>
                <td className="text-end text-muted" style={{ fontSize: 13 }}>{r.unique_claims}</td>
                <td className="text-end fw-semibold text-danger" style={{ fontSize: 13 }}>{fmtFull(r.total_denied)}</td>
                <td className="text-end text-muted" style={{ fontSize: 13 }}>{r.payers_affected}</td>
                <td className="text-end text-muted" style={{ fontSize: 13 }}>{r.procedures_affected}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}