import { useEffect, useState, useMemo } from "react";
import api from "../api/apiClient";
import { fmtFull } from "../utils/formatters"
import type { DenialLine } from "../types/denial_summary"; 
import { ByPayerTab } from "../components/denial_summary/ByPayerTab";
import { ByCodeTab } from "../components/denial_summary/ByCodeTab"
import { ByCPTTab } from "../components/denial_summary/ByCPTTab"; 

 
type TabId = "code" | "payer" | "cpt";
 
const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "code",   label: "By Denial Code", icon: "bi-tag-fill"         },
  { id: "payer",  label: "By Payer",        icon: "bi-building"         },
  { id: "cpt",    label: "By CPT Code",     icon: "bi-clipboard2-pulse" },
];
 
export default function DenialSummary() {
  const [lines, setLines]         = useState<DenialLine[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("code");
 

 
  useEffect(() => {
    setLoading(true);
    api.get("/claims/denials")
      .then((res) => setLines(res.data))
      .catch((err) => { console.error(err); setError("Failed to load denial data."); })
      .finally(() => setLoading(false));
  }, []);
 
  // KPI summary
  const kpis = useMemo(() => ({
    totalOccurrences: lines.length,
    uniqueClaims:     new Set(lines.map((l) => l.claim_number)).size,
    totalDenied:      lines.reduce((s, l) => s + l.denied_amount, 0),
    uniqueCodes:      new Set(lines.map((l) => l.carc_code)).size,
  }), [lines]);
 
  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100 bg-white">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" style={{ width: 40, height: 40 }} />
          <p className="text-muted mt-3 mb-0" style={{ fontSize: 14 }}>Loading denial data…</p>
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
            <i className="bi bi-x-circle-fill me-2 text-primary" />
            Denial Summary
          </h1>
        </div>
      </div>
 
      {error && <div className="alert alert-danger mb-4">{error}</div>}
 
      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        {[
          { label: "Denial Codes Count",  value: kpis.totalOccurrences.toLocaleString(), icon: "bi-list-ul",         color: "#004394" },
          { label: "Unique Claims",        value: kpis.uniqueClaims.toLocaleString(),     icon: "bi-file-medical",    color: "#1A5BB0" },
          { label: "Total Denied Amount",  value: fmtFull(kpis.totalDenied),                 icon: "bi-currency-dollar", color: "#dc3545" },
          { label: "Unique CARC Codes",    value: kpis.uniqueCodes.toLocaleString(),       icon: "bi-tag-fill",        color: "#E0A926" },
        ].map((kpi) => (
          <div key={kpi.label} className="col-12 col-sm-6 col-xl">
            <div className="card border-0 shadow-sm h-100 bg-white" style={{ borderRadius: 10, overflow: "hidden" }}>
              <div style={{ height: 4, background: kpi.color }} />
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <span className="text-muted" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 600 }}>
                    {kpi.label}
                  </span>
                  <i className={`bi ${kpi.icon}`} style={{ fontSize: 18, color: kpi.color }} />
                </div>
                <div className="fw-bold" style={{ fontSize: 26, letterSpacing: "-0.02em", color: kpi.color }}>
                  {kpi.value}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
 
      {/* Tabs + Tables */}

      <ul className="nav nav-tabs mb-4">
        {TABS.map((tab) => (
          <li key={tab.id} className="nav-item">
          <button
              className={`nav-link fw-semibold ${activeTab === tab.id ? "active" : "text-muted"}`}
              style={{ fontSize: 13 }}
              onClick={() => setActiveTab(tab.id)}
          >
              <i className="bi me-1" />
              {tab.label}
          </button>
          </li>
        ))}
      </ul>
      <div className="card border-0 shadow-sm bg-white" style={{ borderRadius: 10 }}>
        <div className="card-body px-4 py-3">

          {/* Tab Content */}
          {lines.length === 0 ? (
            <div className="text-center text-muted py-5">
              <i className="bi bi-search d-block mb-2" style={{ fontSize: 36 }} />
              <p className="mb-0" style={{ fontSize: 14 }}>No denial data found.</p>
            </div>
          ) : (
            <>
              {activeTab === "code"   && <ByCodeTab   lines={lines} />}
              {activeTab === "payer"  && <ByPayerTab  lines={lines} />}
              {activeTab === "cpt"    && <ByCPTTab    lines={lines} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}