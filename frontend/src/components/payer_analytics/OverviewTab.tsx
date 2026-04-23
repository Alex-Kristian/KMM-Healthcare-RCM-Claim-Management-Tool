import type { PayerStat } from "../../types/PayerStat";
import AvgARChart from "./charts/AvgARChart";
import ReimbursementChart from "./charts/ReimbursementChart";
import { fmt$, fmtPct } from "../../utils/formatters";
import { riskLabel } from "../../utils/payerAnalytics";
import RevenueTreemap from "./charts/RevenueTreeMap";

const DENIAL_BENCHMARK = 10;
const AR_BENCHMARK = 40;
const REIMB_BENCHMARK = 80;

type Props = {
  payerStats: PayerStat[];
  selectedPayer: string | null;
  setSelectedPayer: React.Dispatch<React.SetStateAction<string | null>>;
  setActiveTab: React.Dispatch<React.SetStateAction<"overview" | "drilldown" | "insights">>;
};

export default function OverviewTab({ payerStats, selectedPayer, setSelectedPayer, setActiveTab }: Props) {
  return (
          <div className="row g-3 mb-4">
            {/* Revenue by Payer */}
            <div className="col-12">
              <div className="card border-0 shadow-sm h-100 bg-white" style={{ borderRadius: 10 }}>
                <div className="card-body">
                  <h6 className="fw-bold text-dark mb-0">
                    <i className="text-primary" />Revenue by Payer
                  </h6>
                  <p className="text-muted mb-3" style={{ fontSize: 12 }}>Collected Payments Per Payer</p>
                    <RevenueTreemap payerStats={payerStats}></RevenueTreemap>
                </div>
              </div>
            </div>
 
            {/* Avg AR */}
            <div className="col-12 col-xl-6">
              <div className="card border-0 shadow-sm h-100 bg-white" style={{ borderRadius: 10 }}>
                <div className="card-body">
                  <h6 className="fw-bold text-dark mb-0">
                    <i className="text-primary" />Avg Days in A/R
                  </h6>
                  <p className="text-muted mb-3" style={{ fontSize: 12 }}>Target: Under {AR_BENCHMARK} Days</p>
                    <AvgARChart payerStats={payerStats}></AvgARChart>
                </div>
              </div>
            </div>
 
            {/* Reimbursement */}
            <div className="col-12 col-xl-6">
              <div className="card border-0 shadow-sm h-100 bg-white" style={{ borderRadius: 10 }}>
                <div className="card-body">
                  <h6 className="fw-bold text-dark mb-0">
                    <i className="text-primary" />Reimbursement Rate
                  </h6>
                  <p className="text-muted mb-3" style={{ fontSize: 12 }}>Paid / Charged — Target: {REIMB_BENCHMARK}%+</p>
                    <ReimbursementChart payerStats={payerStats}></ReimbursementChart>
                </div>
              </div>
            </div>


          {/* Risk Scorecard Table */}
          <div className="card border-0 shadow-sm bg-white" style={{ borderRadius: 10 }}>
            <div className="card-body">
              <h6 className="fw-bold text-dark mb-0">
                <i className="bi bi-shield-check me-1 text-primary" />Payer Risk Scorecard
              </h6>
              <p className="text-muted mb-3" style={{ fontSize: 12 }}>Sorted by Risk Value — Click a Row to Drill Down</p>
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
            </div>
          </div>
        </div>
  );
}