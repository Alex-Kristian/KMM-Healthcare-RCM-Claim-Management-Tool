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
import type { PayerStat } from "../../../types/PayerStat";


const REIMB_BENCHMARK = 80;

export default function ReimbursementChart({ payerStats }: { payerStats: PayerStat[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
    <BarChart data={payerStats} margin={{ top: 4, right: 8, left: 0, bottom: 28 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="payer" tick={{ fill: "#6c757d", fontSize: 8 }} angle={-30} textAnchor="end" />
        <YAxis tick={{ fill: "#6c757d", fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
        <Tooltip/>
        <ReferenceLine y={REIMB_BENCHMARK} stroke="#198754" strokeDasharray="5 5" label={{fill: "#198754"}} />
        <Bar dataKey="reimbursement" name="Reimbursement %" radius={[4, 4, 0, 0]}>
        {payerStats.map((p, i) => <Cell key={i} fill={p.reimbursement >= REIMB_BENCHMARK ? "#198754" : "#6f42c1"} />)}
        </Bar>
    </BarChart>
    </ResponsiveContainer>
  );
}