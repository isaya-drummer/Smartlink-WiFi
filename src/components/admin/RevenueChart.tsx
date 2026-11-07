"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface RevenueChartProps {
  data: { date: string; amount: number }[]
}

function formatDay(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00")
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export default function RevenueChart({ data }: RevenueChartProps) {
  const chartData = data.map((d) => ({ ...d, day: formatDay(d.date) }))

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart
        data={chartData}
        margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#1a3d22" />
        <XAxis
          dataKey="day"
          tick={{ fill: "#9ca3af", fontSize: 12 }}
          axisLine={{ stroke: "#1a3d22" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#9ca3af", fontSize: 12 }}
          axisLine={{ stroke: "#1a3d22" }}
          tickLine={false}
          tickFormatter={(v: number) =>
            v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
          }
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#0a1a0f",
            border: "1px solid #1a3d22",
            borderRadius: "8px",
            color: "#fff",
          }}
          labelStyle={{ color: "#c8870a", fontWeight: 600 }}
          formatter={(value) => [
            `TZS ${Number(value).toLocaleString()}`,
            "Revenue",
          ]}
        />
        <Bar dataKey="amount" fill="#c8870a" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
