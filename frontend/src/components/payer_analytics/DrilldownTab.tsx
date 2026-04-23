import type { PayerStat } from "../../types/PayerStat";
import { riskLabel } from "../../utils/payerAnalytics";
import { fmt$, fmtPct } from "../../utils/formatters";
import {
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Radar
} from "recharts";

const DENIAL_BENCHMARK = 10;
const AR_BENCHMARK = 40;
const REIMB_BENCHMARK = 80;

type RadarPoint = {
    metric: string;
    value: number;
};

function radarData(
    selected: PayerStat | null,
    totalRevenue: number,
    payerCount: number
): RadarPoint[]{
    if (!selected) return [];

    return[
        { metric: "Revenue Share", value: Math.min(100, (selected.revenue / (totalRevenue || 1)) * 100 * payerCount) },
        { metric: "1st Pass Rate", value: selected.firstPassRate },
        { metric: "Reimbursement", value: selected.reimbursement },
        { metric: "Denial Rate", value: 100 - selected.denialRate },
        { metric: "AR Speed", value: Math.max(0, 100 - selected.avgAR) },
    ]

}


type Props = {
  payerStats: PayerStat[];
  selected: any;
  selectedPayer: string | null;
  setSelectedPayer: React.Dispatch<React.SetStateAction<string | null>>;
  totalRevenue: number;
};

export default function DrilldownTab( {payerStats, selected, selectedPayer, setSelectedPayer, totalRevenue }: Props) {
  return (
    <div>
        <div className="d-flex flex-wrap gap-2 mb-4">
        {payerStats.map((p) => {
            const risk = riskLabel(p.riskScore);
            const isActive = selectedPayer === p.payer;
            return (
            <button key={p.payer} className={`btn btn-sm ${isActive ? "btn-primary" : "btn-outline-secondary"}`} style={{ borderRadius: 20, fontSize: 12, fontWeight: 500 }} onClick={() => setSelectedPayer(p.payer)}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: isActive ? "#fff" : risk.color, display: "inline-block", marginRight: 6 }} />
                {p.payer}
            </button>
            );
        })}
        </div>

        {selected ? (
        <>
            {/* Payer Header */}
            <div className="mb-4">
            <h4 className="fw-bold text-dark mb-1">{selected.payer}</h4>
            <span className="badge rounded-pill" style={{ background: riskLabel(selected.riskScore).bg, color: riskLabel(selected.riskScore).color, border: `1px solid ${riskLabel(selected.riskScore).border}`, fontSize: 12 }}>
                <i className="bi bi-speedometer2 me-1" />
                {riskLabel(selected.riskScore).label} · Score: {selected.riskScore.toFixed(0)}/100
            </span>
            </div>

            {/* Mini KPI Grid */}
            <div className="row g-2 mb-4">
            {[
                { l: "Revenue", v: fmt$(selected.revenue), icon: "bi-currency-dollar", color: "primary" },
                { l: "Total Claims", v: selected.totalClaims, icon: "bi-file-medical", color: "secondary" },
                { l: "Paid", v: selected.paidCount, icon: "bi-check-circle-fill", color: "success" },
                { l: "Denied", v: selected.deniedCount, icon: "bi-x-circle-fill", color: "danger" },
                { l: "Pending", v: selected.pendingCount, icon: "bi-hourglass-split", color: "warning" },
                { l: "First Pass %", v: fmtPct(selected.firstPassRate), icon: "bi-patch-check-fill", color: selected.firstPassRate > 70 ? "success" : "warning" },
                { l: "Avg Days A/R", v: `${selected.avgAR.toFixed(1)}d`, icon: "bi-calendar-range", color: selected.avgAR > AR_BENCHMARK ? "warning" : "success" },
                { l: "Reimbursement", v: fmtPct(selected.reimbursement), icon: "bi-graph-up", color: selected.reimbursement < REIMB_BENCHMARK ? "warning" : "success" },
            ].map((item) => (
                <div key={item.l} className="col-6 col-md-3">
                <div className="card border-0 shadow-sm text-center py-3 bg-white" style={{ borderRadius: 10 }}>
                    <i className={`bi ${item.icon} text-${item.color}`} style={{ fontSize: 22 }} />
                    <div className="text-muted mt-1" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 600 }}>{item.l}</div>
                    <div className={`fw-bold text-${item.color}`} style={{ fontSize: 20 }}>{String(item.v)}</div>
                </div>
                </div>
            ))}
            </div>

            {/* Radar + Recommendations */}
            <div className="row g-3">
            <div className="col-12 col-lg-6">
                <div className="card border-0 shadow-sm h-100 bg-white" style={{ borderRadius: 10 }}>
                <div className="card-body">
                    <h6 className="fw-bold text-dark mb-0">
                    <i className="text-primary" />Performance Radar
                    </h6>
                    <p className="text-muted mb-2" style={{ fontSize: 12 }}>Higher = Better Across All Dimensions</p>
                    <ResponsiveContainer width="100%" height={280}>
                    <RadarChart data={radarData(selected, totalRevenue, payerStats.length)}>
                        <PolarGrid stroke="#dee2e6" />
                        <PolarAngleAxis dataKey="metric" tick={{ fill: "#6c757d", fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#adb5bd", fontSize: 10 }} />
                        <Radar name={selected.payer} dataKey="value" stroke="#0d6efd" fill="#0d6efd" fillOpacity={0.2} />
                    </RadarChart>
                    </ResponsiveContainer>
                </div>
                </div>
            </div>

            <div className="col-12 col-lg-6">
                <div className="card border-0 shadow-sm h-100 bg-white" style={{ borderRadius: 10 }}>
                <div className="card-body">
                    <h6 className="fw-bold text-dark mb-3">
                    <i className="text-primary" />Recommendations
                    </h6>
                    <ul className="list-unstyled mb-0">
                    {selected.denialRate > DENIAL_BENCHMARK && (
                        <li className="d-flex gap-2 mb-3">
                        <i className="bi bi-exclamation-triangle-fill text-danger mt-1 flex-shrink-0" />
                        <span style={{ fontSize: 13, color: "#495057" }}>Denial rate of <strong>{fmtPct(selected.denialRate)}</strong> exceeds benchmark. Conduct analysis on top denial code.</span>
                        </li>
                    )}
                    {selected.avgAR > AR_BENCHMARK && (
                        <li className="d-flex gap-2 mb-3">
                        <i className="bi bi-clock-fill text-warning mt-1 flex-shrink-0" />
                        <span style={{ fontSize: 13, color: "#495057" }}>Average A/R of <strong>{selected.avgAR.toFixed(1)} days</strong> exceeds target. Flag outstanding claims.</span>
                        </li>
                    )}
                    {selected.reimbursement < REIMB_BENCHMARK && (
                        <li className="d-flex gap-2 mb-3">
                        <i className="bi bi-graph-down-arrow text-warning mt-1 flex-shrink-0" />
                        <span style={{ fontSize: 13, color: "#495057" }}>Reimbursement of <strong>{fmtPct(selected.reimbursement)}</strong> is below target. Review contract fee schedules and underpayment patterns.</span>
                        </li>
                    )}
                    {selected.firstPassRate < 70 && (
                        <li className="d-flex gap-2 mb-3">
                        <i className="bi bi-patch-exclamation text-warning mt-1 flex-shrink-0" />
                        <span style={{ fontSize: 13, color: "#495057" }}>First-pass rate of <strong>{fmtPct(selected.firstPassRate)}</strong> suggests coding or auth issues. Audit pre-auth workflows and coder accuracy.</span>
                        </li>
                    )}
                    {selected.riskScore < 40 && (
                        <li className="d-flex gap-2">
                        <i className="bi bi-check-circle-fill text-success mt-1 flex-shrink-0" />
                        <span style={{ fontSize: 13, color: "#495057" }}>This payer is overall performing well.</span>
                        </li>
                    )}
                    </ul>
                </div>
                </div>
            </div>
            </div>
        </>
        ) : (
        <div className="text-center text-muted py-5">
            <i className="bi bi-search d-block mb-2" style={{ fontSize: 36 }} />
            <p className="mb-0" style={{ fontSize: 14 }}>Select a payer above to view detailed performance metrics</p>
        </div>
        )}

    </div>
    );
}