import type { PayerStat } from "../../../types/PayerStat";
import { fmtDecimal } from "../../../utils/formatters";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  ReferenceLine,
} from "recharts";

const AR_BENCHMARK = 40;

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;

  const node = payload[0].payload;

  return (
    <div
      style={{
        background: "#fff",
        padding: "10px 12px",
        borderRadius: 8,
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        fontSize: 13,
      }}
    >
      <strong>{node.name}</strong>
      <div>Reimbursement %: {fmtDecimal(node.value)}</div>
    </div>
  );
};

export default function AvgARChart({ payerStats }: {payerStats: PayerStat[]}) {
  return (
    <ResponsiveContainer width="100%" height={240}>
        <BarChart data={payerStats} margin={{ top: 4, right: 8, left: 0, bottom: 28 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="payer" tick={{ fill: "#6c757d", fontSize: 8 }} angle={-30} textAnchor="end" />
        <YAxis tick={{ fill: "#6c757d", fontSize: 11 }} />
        <Tooltip content = {CustomTooltip}/>
        <ReferenceLine y={AR_BENCHMARK} stroke="#fd7e14" strokeDasharray="5 5" label={{ fill: "#fd7e14", fontSize: 11 }} />
        <Bar dataKey="avgAR" name="Avg AR Days" radius={[4, 4, 0, 0]}>
            {payerStats.map((p, i) => <Cell key={i} fill={p.avgAR > AR_BENCHMARK ? "#fd7e14" : "#0d6efd"} />)}
        </Bar>
        </BarChart>
    </ResponsiveContainer>
  );
}