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
      className="rounded-xl p-4 md:p-5 flex items-start gap-3"
      style={{ backgroundColor: "#0d1f3c", border: "1px solid #1e3a5f" }}
    >
      <div
        className="p-2.5 rounded-lg flex-shrink-0"
        style={{ backgroundColor: "rgba(0, 180, 255, 0.15)" }}
      >
        <Icon className="w-5 h-5" style={{ color: "#00b4ff" }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs md:text-sm font-medium text-gray-400 truncate">{title}</p>
        <p className="mt-0.5 text-lg md:text-2xl font-bold text-white truncate">
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
