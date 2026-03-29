import type { PayerStat } from "../../types/PayerStat";
import { fmtPct } from "../../utils/formatters";
import { riskLabel } from "../../utils/payerAnalytics";


const DENIAL_BENCHMARK = 10;
const AR_BENCHMARK = 40;
const REIMB_BENCHMARK = 80;

type Props = {
  payerStats: PayerStat[];
  kpis: any;
};

export default function InsightsTab({ payerStats, kpis}: Props){
    return(
        <>
        <div className="row g-3 mb-4">
        <div className="col-12 col-md-6">
            <div className="card border-0 shadow-sm h-100 bg-white" style={{ borderRadius: 10 }}>
            <div className="card-body">
                <h6 className="fw-bold text-dark mb-3">
                <i className="bi bi-shield-exclamation me-1 text-danger" />Highest Risk Payers
                </h6>
                {payerStats.slice(0, 5).map((p, i) => {
                const risk = riskLabel(p.riskScore);
                return (
                    <div key={p.payer} className="d-flex align-items-center gap-2 py-2 border-bottom">
                    <span className="text-muted fw-bold" style={{ width: 22, fontSize: 12 }}>#{i + 1}</span>
                    <span className="flex-fill text-dark" style={{ fontSize: 13 }}>{p.payer}</span>
                    <span className="badge rounded-pill" style={{ background: risk.bg, color: risk.color, border: `1px solid ${risk.border}`, fontSize: 11 }}>
                        <i className="bi bi-speedometer2 me-1" />{p.riskScore.toFixed(0)}
                    </span>
                    </div>
                );
                })}
            </div>
            </div>
        </div>

        <div className="col-12 col-md-6">
            <div className="card border-0 shadow-sm h-100 bg-white" style={{ borderRadius: 10 }}>
            <div className="card-body">
                <h6 className="fw-bold text-dark mb-3">
                <i className="bi bi-trophy-fill me-1 text-success" />Top Reimbursement Performers
                </h6>
                {[...payerStats].sort((a, b) => a.riskScore - b.riskScore).slice(0, 5).map((p, i) => (
                <div key={p.payer} className="d-flex align-items-center gap-2 py-2 border-bottom">
                    <span className="text-muted fw-bold" style={{ width: 22, fontSize: 12 }}>#{i + 1}</span>
                    <span className="flex-fill text-dark" style={{ fontSize: 13 }}>{p.payer}</span>
                    <span className="fw-semibold text-success" style={{ fontSize: 13 }}>
                    <i className="me-1" />{fmtPct(p.reimbursement)}
                    </span>
                </div>
                ))}
            </div>
            </div>
        </div>
        </div>

        <div className="card border-0 shadow-sm bg-white" style={{ borderRadius: 10 }}>
        <div className="card-body">
            <h6 className="fw-bold text-dark mb-0">
            <i className="bi bi-rulers me-1 text-primary" />Benchmark Comparison
            </h6>
            <p className="text-muted mb-3" style={{ fontSize: 12 }}>Your Averages vs. Industry Standards</p>
            <div className="table-responsive">
            <table className="table table-bordered align-middle mb-0">
                <thead className="table-light">
                <tr>
                    <th style={{ fontSize: 12 }}>Metric</th>
                    <th style={{ fontSize: 12 }}>Your Average</th>
                    <th style={{ fontSize: 12 }}>Industry Benchmark</th>
                    <th style={{ fontSize: 12 }}>Status</th>
                </tr>
                </thead>
                <tbody>
                {[
                    { metric: "Denial Rate", yours: fmtPct(kpis.avgDenial), benchmark: `${DENIAL_BENCHMARK}%`, good: kpis.avgDenial <= DENIAL_BENCHMARK },
                    { metric: "Avg Days in A/R", yours: `${kpis.avgAR.toFixed(1)} days`, benchmark: `${AR_BENCHMARK} days`, good: kpis.avgAR <= AR_BENCHMARK },
                    { metric: "Reimbursement Rate", yours: fmtPct(kpis.avgReimb), benchmark: `${REIMB_BENCHMARK}%`, good: kpis.avgReimb >= REIMB_BENCHMARK },
                ].map((row) => (
                    <tr key={row.metric}>
                    <td className="fw-semibold" style={{ fontSize: 13 }}>
                        <i className={`text-secondary`} />{row.metric}
                    </td>
                    <td className={`fw-bold ${row.good ? "text-success" : "text-danger"}`} style={{ fontSize: 13 }}>{row.yours}</td>
                    <td className="text-muted" style={{ fontSize: 13 }}>{row.benchmark}</td>
                    <td>
                        <span className={`badge ${row.good ? "text-bg-success" : "text-bg-danger"}`} style={{ fontSize: 11 }}>
                        <i className={`bi ${row.good ? "bi-check-lg" : "bi-x-lg"} me-1`} />
                        {row.good ? "On Target" : "Below Target"}
                        </span>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        </div>
        </div>
        </>
    );
}