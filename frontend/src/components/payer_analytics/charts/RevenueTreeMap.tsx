import { Treemap, ResponsiveContainer, Tooltip } from "recharts";
import type { PayerStat } from "../../../types/PayerStat";
import { fmtFull } from "../../../utils/formatters";

const COLORS = [
  "#185FA5", "#0F6E56", "#3B6D11", "#853508",
  "#534AB7", "#993556", "#BA7517", "#0C447C",
  "#3C3489", "#6e2612", "#1D9E75",
];

interface CustomContentProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  name?: string;
  value?: number;
  index?: number;
  root?: { value?: number };
}

function CustomContent(props: CustomContentProps) {
  const { x = 0, y = 0, width = 0, height = 0, name, value = 0, index = 0, root } = props;

  const total = root?.value || 1;
  const percent = ((value / total) * 100).toFixed(1);

  const fill = COLORS[index % COLORS.length];

  // Only show labels if box is big enough
  const showText = width > 80 && height > 50;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill,
          stroke: "#fff",
          strokeWidth: 2,
          rx: 6,
          ry: 6,
        }}
      />
      {showText && (
        <>
          <text
            x={x + 8}
            y={y + 20}
            fill="#fff"
            fontSize={13}
            fontWeight={600}
          >
            {name}
          </text>
          <text
            x={x + 8}
            y={y + 38}
            fill="#fff"
            fontSize={12}
            opacity={0.9}
          >
            {percent}%
          </text>
        </>
      )}
    </g>
  );
}
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
      <div>Revenue: {fmtFull(node.value)}</div>
    </div>
  );
};

export default function RevenueTreemap({ payerStats }: { payerStats: PayerStat[] }) {
  const total = payerStats.reduce((s, d) => s + d.revenue, 0);

  const data = [...payerStats]
    .sort((a, b) => b.revenue - a.revenue)
    .map((d) => ({ name: d.payer, value: d.revenue }));

  return (
    <div style={{ width: "100%" }}>
      <ResponsiveContainer width="100%" height={540}>
        <Treemap
          data={data}
          dataKey="value"
          aspectRatio={4 / 3}
          content={<CustomContent />}
          isAnimationActive={false} 
        >
          <Tooltip content={<CustomTooltip/>}/>
        </Treemap>
      </ResponsiveContainer>

      {/* Legend */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          marginTop: 14,
          fontSize: 12,
          color: "var(--color-text-secondary, #666)",
        }}
      >
        {data.map((d, i) => (
          <span
            key={d.name}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 3,
                background: COLORS[i % COLORS.length],
                flexShrink: 0,
              }}
            />
            {d.name}{" "}
            <span style={{ opacity: 0.7 }}>
              {((d.value / total) * 100).toFixed(1)}%
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}