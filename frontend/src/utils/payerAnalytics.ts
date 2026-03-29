import type { PayerStat } from "../types/PayerStat";
import { fmtPct } from "../utils/formatters";

const DENIAL_BENCHMARK = 10;
const AR_BENCHMARK = 40;
const REIMB_BENCHMARK = 80;
 

export const calculateRisk = (denialRate: number, avgAR: number, reimbursement: number) =>{

  return (Math.min(
      100,
      (denialRate / 30) * 40 +
        (Math.max(0, avgAR - AR_BENCHMARK) / 30) * 30 +
        (Math.max(0, REIMB_BENCHMARK - reimbursement) / REIMB_BENCHMARK) * 30)
      );
}

export const riskLabel = (score: number) => {
  if (score >= 70) return { label: "High Risk", color: "#dc3545", bg: "#fff5f5", border: "#f5c6cb" };
  if (score >= 40) return { label: "Med Risk", color: "#fd7e14", bg: "#fff8f0", border: "#ffd8b0" };
  return { label: "Low Risk", color: "#198754", bg: "#f0faf4", border: "#b2dfca" };
};


export const generateInsights = (stats: PayerStat[]) => {
  const items: { icon: string; text: string; variant: string }[] = [];
  const worstDenial = stats[0];
  const highAR = stats.filter((p) => p.avgAR > AR_BENCHMARK);
  const bestReimb = [...stats].sort((a, b) => b.reimbursement - a.reimbursement)[0];
  const highRisk = stats.filter((p) => p.riskScore >= 70);
 
  if (worstDenial?.denialRate > DENIAL_BENCHMARK)
    items.push({ icon: "bi-exclamation-triangle-fill", variant: "danger", text: `${worstDenial.payer} has a ${fmtPct(worstDenial.denialRate)} denial rate — ${(worstDenial.denialRate - DENIAL_BENCHMARK).toFixed(1)}pts above industry benchmark. Prioritize appeal review.` });
  if (highAR.length > 0)
    items.push({ icon: "bi-clock-fill", variant: "warning", text: `${highAR.length} payer(s) exceed the ${AR_BENCHMARK}-day A/R threshold: ${highAR.map((p) => p.payer).join(", ")}.` });
  if (bestReimb?.reimbursement < REIMB_BENCHMARK)
    items.push({ icon: "bi-graph-down-arrow", variant: "warning", text: `Best reimbursement is ${fmtPct(bestReimb.reimbursement)} from ${bestReimb.payer} — below the ${REIMB_BENCHMARK}% target. Review contract terms.` });
  if (highRisk.length)
    items.push({ icon: "bi-shield-exclamation", variant: "danger", text: `${highRisk.length} high-risk payer(s) require immediate intervention: ${highRisk.map((p) => p.payer).join(", ")}.` });
 
  return items;
};

