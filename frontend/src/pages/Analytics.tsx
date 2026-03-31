import { useEffect, useMemo, useState } from "react";
import api from "../api/apiClient";
import type { Claim } from "../types/Claims";
import type { PayerStat } from "../types/PayerStat";
import { calculateRisk, generateInsights } from "../utils/payerAnalytics";
import KPIGrid from "../components/payer_analytics/KPIGrid";
import InsightsAlert from "../components/payer_analytics/InsightsAlert";
import TabsNav from "../components/payer_analytics/TabsNav";
import OverviewTab from "../components/payer_analytics/OverviewTab";
import DrilldownTab from "../components/payer_analytics/DrilldownTab";
import InsightsTab from "../components/payer_analytics/InsightsTab";
 
 
export default function PayerAnalytics() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [selectedPayer, setSelectedPayer] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "drilldown" | "insights">("overview");
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    setLoading(true);
    api.get("/claims/").then((res) => {
      setClaims(res.data);
      setLoading(false);
    });
  }, []);
 

  const payerStats: PayerStat[] = useMemo(() => {
    const map: Record<string, any> = {};
 
    for (const c of claims) {
      const payer = c.payer || "Unknown";
      if (!map[payer]) {
        map[payer] = { payer, paid: 0, charged: 0, denied: 0, pending: 0, paidCount: 0, total: 0, arDays: 0, firstPass: 0 };
      }
      map[payer].paid += (c.paid_amount || 0);
      map[payer].charged += (c.total_charge || 0);
      map[payer].total += 1;
      map[payer].arDays += (c.days_in_ar || 0);
 
      if (c.status === "DENIED" || c.status === "4") map[payer].denied++;
      else if (c.status === "PENDING" || c.status === "2")  map[payer].pending++;
      else if (c.status === "PAID" || c.status === "1"
      ) {
        map[payer].paidCount++;
        if (!c.was_resubmitted) map[payer].firstPass++;
      }
    }
 
    return Object.values(map)
      .map((p: any) => {
        const denialRate = p.total ? (p.denied / p.total) * 100 : 0;
        const avgAR = p.total ? p.arDays / p.total : 0;
        const reimbursement = p.charged ? (p.paid / p.charged) * 100 : 0;
        const firstPassRate = p.paidCount ? (p.firstPass / p.paidCount) * 100 : 0;
        const riskScore = calculateRisk(denialRate, avgAR, reimbursement)
        return { payer: p.payer, revenue: p.paid, denialRate, reimbursement, avgAR, totalClaims: p.total, firstPassRate, deniedCount: p.denied, pendingCount: p.pending, paidCount: p.paidCount, riskScore };
      })
      .sort((a, b) => b.riskScore - a.riskScore);
  }, [claims]);
 
  /* KPIs */
  const kpis = useMemo(() => {
    const totalRevenue = payerStats.reduce((s, p) => s + p.revenue, 0);
    const totalClaims = payerStats.reduce((s, p) => s + p.totalClaims, 0);
    const totalDenied = payerStats.reduce((s, p) => s + p.deniedCount, 0);
    const avgDenial = totalClaims ? (totalDenied / totalClaims) * 100 : 0;
    const avgAR = payerStats.reduce((s, p) => s + p.avgAR, 0) / (payerStats.length || 1);
    const avgReimb = payerStats.reduce((s, p) => s + p.reimbursement, 0) / (payerStats.length || 1);
    const totalPending = payerStats.reduce((s, p) => s + p.pendingCount, 0);
    return { totalRevenue, totalClaims, avgDenial, avgAR, avgReimb, totalPending };
  }, [payerStats]);
 
  const selected = payerStats.find((p) => p.payer === selectedPayer);
  const insights = useMemo(() => generateInsights(payerStats), [payerStats]);
 
  /* Loading screen */
  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100 bg-white">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" style={{ width: 40, height: 40 }} />
          <p className="text-muted mt-3 mb-0" style={{ fontSize: 14 }}>Loading payer data…</p>
        </div>
      </div>
    );
  }
 
  return (
    <div className="bg-light min-vh-100 py-4 px-4">
 
      {/* Page Header */}
      <div className="card border-0 shadow-sm bg-white mb-4" style={{ borderRadius: 10 }}>
        <div className="card-body px-4 py-3">
          <p className="text-primary fw-semibold mb-1" style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Revenue Cycle Management
          </p>
          <h1 className="fw-bold text-dark mb-1" style={{ fontSize: 24, letterSpacing: "-0.02em" }}>
            <i className="bi bi-bar-chart-line me-2 text-primary" />
            Payer Performance Analytics
          </h1>
        </div>
      </div>
 
      {/* KPI Cards */}
      <KPIGrid kpis={kpis}></KPIGrid>
 
      {/* Action Alerts */}
      {insights.length > 0 && (
        <InsightsAlert insights={insights}></InsightsAlert>
      )}
 
      {/* Tab Navigation */}
      <TabsNav activeTab={activeTab} setActiveTab = {setActiveTab}></TabsNav>
 
      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <>
            <OverviewTab 
                payerStats={payerStats}
                selectedPayer={selectedPayer}
                setSelectedPayer={setSelectedPayer}
                setActiveTab={setActiveTab}>
            </OverviewTab>
        </>
      )}
 
      {/* DRILLDOWN TAB */}
      {activeTab === "drilldown" && (
        <>
            <DrilldownTab
                payerStats={payerStats}
                selected={selected}
                selectedPayer={selectedPayer}
                setSelectedPayer={setSelectedPayer}
                totalRevenue={kpis.totalRevenue}>
            </DrilldownTab>
        </>
      )}
 
      {/* INSIGHTS TAB */}
      {activeTab === "insights" && (
        <>
            <InsightsTab payerStats={payerStats} kpis={kpis}></InsightsTab>
        </>
      )}
    </div>
  );
}