import type { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  change?: number
  changeLabel?: string
}

/**
 * A stats card for the admin dashboard.
 * Dark background (#0d1f3c), cyan icon, white title and number.
 */
export default function StatsCard({
  title,
  value,
  icon: Icon,
  change,
  changeLabel,
}: StatsCardProps) {
  const isPositive = change !== undefined && change >= 0

  return (
    <div
      className="rounded-xl p-6 flex items-start gap-4"
      style={{ backgroundColor: "#0d1f3c", border: "1px solid #1e3a5f" }}
    >
      <div
        className="p-3 rounded-lg flex-shrink-0"
        style={{ backgroundColor: "rgba(0, 180, 255, 0.15)" }}
      >
        <Icon className="w-6 h-6" style={{ color: "#00b4ff" }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-400 truncate">{title}</p>
        <p className="mt-1 text-2xl font-bold text-white truncate">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
        {change !== undefined && (
          <p
            className="mt-1 text-xs"
            style={{ color: isPositive ? "#22c55e" : "#ef4444" }}
          >
            {isPositive ? "+" : ""}
            {change}% {changeLabel ?? "vs last period"}
          </p>
        )}
      </div>
    </div>
  )
}
