export const fmt$ = (n: number) =>
  n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(2)}M`
    : n >= 1_000
    ? `$${(n / 1_000).toFixed(1)}K`
    : `$${n.toFixed(0)}`;
 
export const fmtPct = (n: number) => `${n.toFixed(1)}%`;

export const fmtDecimal = (n: number) => `${n.toFixed(1)}`

export const fmtFull = (n?: number) =>
  "$" + (n ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
 
export const fmtDate = (d?: string) => {
  if (!d) return "—";
  const [y, m, dd] = d.split("-");
  return `${m}/${dd}/${y}`;
};

export const formatDatetoString = (d: Date) => d.toISOString().split("T")[0];