import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  CartesianGrid
} from "recharts";
import type { PayerStat } from "../../../types/PayerStat";
import { fmt$ } from "../../../utils/formatters";

export default function RevenueChart({ payerStats }: {payerStats: PayerStat[]}) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={payerStats} margin={{ top: 4, right: 8, left: 0, bottom: 28 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="payer" tick={{ fill: "#6c757d", fontSize: 8 }} angle={-30} textAnchor="end" />
        <YAxis tick={{ fill: "#6c757d", fontSize: 11 }} tickFormatter={(v) => fmt$(v)} />
        <Tooltip/>
        <Bar dataKey="revenue" name="Revenue" radius={[4, 4, 0, 0]}>
          {payerStats.map((_, i) => <Cell key={i} fill={`hsl(${210 + i * 22}, 65%, 52%)`} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}