import { riskLabel } from "../../utils/payerAnalytics";
import type { PayerStat } from "../../types/PayerStat";
import { fmt$, fmtPct } from "../../utils/formatters";


const DENIAL_BENCHMARK = 10;
const AR_BENCHMARK = 40;
const REIMB_BENCHMARK = 80;

type Props = {
  payerStats: PayerStat[];
  selectedPayer: string | null;
  setSelectedPayer: React.Dispatch<React.SetStateAction<string | null>>;
  setActiveTab: React.Dispatch<React.SetStateAction<"overview" | "drilldown" | "insights">>;
};
export default function PriorityTable({ payerStats, selectedPayer, setSelectedPayer, setActiveTab }: Props){


    return(
        <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                <tr>
                    {["Payer", "Risk", "Claims", "Revenue", "Denial %", "1st Pass %", "Avg A/R", "Reimbursement"].map((h) => (
                    <th key={h} style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "#6c757d" }}>{h}</th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {payerStats.map((p) => {
                    const risk = riskLabel(p.riskScore);
                    return (
                    <tr key={p.payer} onClick={() => { setSelectedPayer(p.payer); setActiveTab("drilldown"); }} style={{ cursor: "pointer" }} className={selectedPayer === p.payer ? "table-primary" : ""}>
                        <td className="fw-semibold text-dark" style={{ fontSize: 13 }}>{p.payer}</td>
                        <td>
                        <span className="badge rounded-pill" style={{ background: risk.bg, color: risk.color, border: `1px solid ${risk.border}`, fontSize: 11, fontWeight: 600 }}>
                            <i className={`bi ${p.riskScore >= 70 ? "bi-exclamation-circle-fill" : p.riskScore >= 40 ? "bi-dash-circle" : "bi-check-circle-fill"} me-1`} />
                            {risk.label}
                        </span>
                        </td>
                        <td style={{ fontSize: 13 }}>{p.totalClaims}</td>
                        <td style={{ fontSize: 13 }}>{fmt$(p.revenue)}</td>
                        <td><span className={`fw-semibold ${p.denialRate > DENIAL_BENCHMARK ? "text-danger" : "text-success"}`} style={{ fontSize: 13 }}>{fmtPct(p.denialRate)}</span></td>
                        <td style={{ fontSize: 13 }}>{fmtPct(p.firstPassRate)}</td>
                        <td><span className={p.avgAR > AR_BENCHMARK ? "text-warning fw-semibold" : "text-muted"} style={{ fontSize: 13 }}>{p.avgAR.toFixed(1)}d</span></td>
                        <td><span className={`fw-semibold ${p.reimbursement < REIMB_BENCHMARK ? "text-warning" : "text-success"}`} style={{ fontSize: 13 }}>{fmtPct(p.reimbursement)}</span></td>
                    </tr>
                    );
                })}
                </tbody>
            </table>
            </div>



    );
}