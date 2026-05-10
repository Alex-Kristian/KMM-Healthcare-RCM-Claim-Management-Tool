export const fmt$ = (n: number) =>
  n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(2)}M`
    : n >= 1_000
    ? `$${(n / 1_000).toFixed(1)}K`
    : `$${n.toFixed(0)}`;
 
export const fmtPct = (n: number) => {
  return`${Number(n ?? 0).toFixed(1)}%`;
}
export const fmtDecimal = (n?: number) => {
  return `${Number(n ?? 0).toFixed(1)}`
}
export const fmtFull = (n?: number) =>
  "$" + (n ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
 
export const fmtDate = (d?: string) => {
  if (!d) return "—";
  const [y, m, dd] = d.split("-");
  return `${m}/${dd}/${y}`;
};

export const formatDatetoString = (d: Date) => d.toISOString().split("T")[0];

export function formatDenialCategory(category?: string) {
  if (!category) return "-";

  const labels: Record<string, string> = {
    auth_missing: "Missing Authorization",
    eligibility: "Not Eligible",
    medical_necessity: "Medical Necessity",
    coding_error: "Coding Error",
    duplicate: "Duplicate Claim"
  };

  return labels[category] ?? category
}