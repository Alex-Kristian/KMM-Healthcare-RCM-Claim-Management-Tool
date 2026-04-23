import type { SortDir } from "../../types/denial_summary";

export function Th({ label, col, sortKey, sortDir, onSort, align }: {
  label: string; col: string; sortKey: string | null; sortDir: SortDir;
  onSort: (k: any) => void; align?: string;
}) {
  return (
    <th
      onClick={() => onSort(col)}
      className={`${align ?? ""} ${sortKey === col ? "table-active" : ""}`}
      style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "#6c757d", cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" }}
    >
      {label}
      <SortIcon col={col} sortKey={sortKey} sortDir={sortDir} />
    </th>
  );
}

function SortIcon({ col, sortKey, sortDir }: { col: string; sortKey: string | null; sortDir: SortDir }) {
  if (sortKey !== col) return <i className="bi bi-arrow-down-up ms-1 opacity-25" style={{ fontSize: 10 }} />;
  return <i className={`bi bi-arrow-${sortDir === 1 ? "up" : "down"} ms-1`} style={{ fontSize: 10 }} />;
}