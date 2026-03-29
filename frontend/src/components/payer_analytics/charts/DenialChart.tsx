import type { PayerStat } from "../../../types/PayerStat";
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

const DENIAL_BENCHMARK = 10;

export default function DenialChart({ payerStats }: { payerStats: PayerStat[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
        <BarChart data={payerStats} margin={{ top: 4, right: 8, left: 0, bottom: 28 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="payer" tick={{ fill: "#6c757d", fontSize: 8 }} angle={-30} textAnchor="end" />
        <YAxis tick={{ fill: "#6c757d", fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
        <Tooltip/>
        <ReferenceLine y={DENIAL_BENCHMARK} stroke="#fd7e14" strokeDasharray="5 5" label={{ fill: "#fd7e14" }} />
        <Bar dataKey="denialRate" name="Denial %" radius={[4, 4, 0, 0]}>
            {payerStats.map((p, i) => <Cell key={i} fill={p.denialRate > DENIAL_BENCHMARK ? "#dc3545" : "#198754"} />)}
        </Bar>
        </BarChart>
    </ResponsiveContainer>
  );
}