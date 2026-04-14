import { fmt$, fmtPct,  } from "../../utils/formatters";


const DENIAL_BENCHMARK = 10;
const AR_BENCHMARK = 40;
const REIMB_BENCHMARK = 80;
type Props = { kpis: any };

export default function KPIGrid({ kpis }: Props) {
  return (
    <div className="row g-3 mb-4">
    {[
        { label: "Total Collections", value: fmt$(kpis.totalRevenue), sub: "Paid Claims Revenue", icon: "bi-currency-dollar", colorClass: "text-light-blue", indicatorColor: "#0d6efd" },
        { label: "Claim Volume", value: kpis.totalClaims.toLocaleString(), sub: `${kpis.totalPending} Pending`, icon: "bi-file-medical", colorClass: "text-secondary", indicatorColor: "#6c757d" },
        { label: "Overall Denial Rate", value: fmtPct(kpis.avgDenial), sub: `Benchmark: ${DENIAL_BENCHMARK}%`, icon: "bi-x-circle-fill", colorClass: kpis.avgDenial > DENIAL_BENCHMARK ? "text-danger" : "text-success", indicatorColor: kpis.avgDenial > DENIAL_BENCHMARK ? "#dc3545" : "#198754" },
        { label: "Avg Days in A/R", value: kpis.avgAR.toFixed(1), sub: `Benchmark: ${AR_BENCHMARK} Days`, icon: "bi-calendar-range", colorClass: kpis.avgAR > AR_BENCHMARK ? "text-warning" : "text-success", indicatorColor: kpis.avgAR > AR_BENCHMARK ? "#fd7e14" : "#198754" },
        { label: "Avg Reimbursement", value: fmtPct(kpis.avgReimb), sub: `Target: ${REIMB_BENCHMARK}%`, icon: "bi-graph-up-arrow", colorClass: kpis.avgReimb < REIMB_BENCHMARK ? "text-warning" : "text-success", indicatorColor: kpis.avgReimb < REIMB_BENCHMARK ? "#fd7e14" : "#198754" },
    ].map((kpi) => (
        <div key={kpi.label} className="col-12 col-sm-6 col-xl">
        <div className="card border-0 shadow-sm h-100 bg-white" style={{ borderRadius: 10, overflow: "hidden" }}>
            <div style={{ height: 4, background: kpi.indicatorColor }} />
            <div className="card-body">
            <div className="d-flex justify-content-between align-items-start mb-2">
                <span className="text-muted" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 600 }}>
                {kpi.label}
                </span>
                <i className={`bi ${kpi.icon} ${kpi.colorClass}`} style={{ fontSize: 18 }} />
            </div>
            <div className={`fw-bold ${kpi.colorClass}`} style={{ fontSize: 26, letterSpacing: "-0.02em" }}>
                {kpi.value}
            </div>
            <div className="text-muted mt-1" style={{ fontSize: 11 }}>{kpi.sub}</div>
            </div>
        </div>
        </div>
    ))}
    </div>
  );
}