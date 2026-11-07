import type { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  change?: number
  changeLabel?: string
}

export default function StatsCard({ title, value, icon: Icon, change, changeLabel }: StatsCardProps) {
  const isPositive = change !== undefined && change >= 0

  return (
    <div
      className="rounded-xl p-4 flex items-center gap-3"
      style={{
        backgroundColor: "var(--bg-secondary)",
        border: "1px solid var(--border-color)",
      }}
    >
      {/* Icon */}
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: "var(--accent-dim)" }}
      >
        <Icon className="w-5 h-5" style={{ color: "var(--accent)" }} />
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p
          className="text-xs font-medium truncate"
          style={{ color: "var(--text-secondary)" }}
        >
          {title}
        </p>
        <p
          className="mt-0.5 text-lg font-bold leading-tight truncate"
          style={{ color: "var(--text-primary)" }}
        >
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
        {change !== undefined && (
          <p className="mt-0.5 text-xs" style={{ color: isPositive ? "#22c55e" : "#ef4444" }}>
            {isPositive ? "+" : ""}{change}% {changeLabel ?? "vs last period"}
          </p>
        )}
      </div>
    </div>
  )
}
