import type { Claim } from "../types/Claims"

export const getBalance = (c: Claim) =>
  Math.max(0, (c.total_charge ?? 0) - (c.paid_amount ?? 0) - (c.patient_responsibility ?? 0));
 
const STATUS_META: Record<string, { label: string; bg: string; color: string; border: string; icon: string }> = {
  "1": { label: "Paid",    bg: "#f0faf4", color: "#198754", border: "#b2dfca", icon: "bi-check-circle-fill" },
  "2": { label: "Pending", bg: "#fff8f0", color: "#fd7e14", border: "#ffd8b0", icon: "bi-hourglass-split"   },
  "4": { label: "Denied",  bg: "#fff5f5", color: "#dc3545", border: "#f5c6cb", icon: "bi-x-circle-fill"     },
};
 
export function StatusBadge({ status }: { status?: string }) {
  const key = (status ?? "").toLowerCase();
  const meta = STATUS_META[key] ?? { label: status ?? "—", bg: "#f8f9fa", color: "#6c757d", border: "#dee2e6", icon: "bi-circle" };
  return (
    <span
      className="badge rounded-pill"
      style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}`, fontSize: 11, fontWeight: 600 }}
    >
      <i className={`bi ${meta.icon} me-1`} />
      {meta.label}
    </span>
  );
}