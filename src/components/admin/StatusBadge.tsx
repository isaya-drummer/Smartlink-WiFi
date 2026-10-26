type StatusBadgeVariant =
  | "ACTIVE"
  | "SUCCESS"
  | "PENDING"
  | "EXPIRED"
  | "FAILED"
  | "USED"
  | string

interface StatusBadgeProps {
  status: StatusBadgeVariant
  label?: string
}

const statusStyles: Record<string, { bg: string; text: string }> = {
  ACTIVE: { bg: "rgba(34,197,94,0.15)", text: "#22c55e" },
  SUCCESS: { bg: "rgba(34,197,94,0.15)", text: "#22c55e" },
  PENDING: { bg: "rgba(234,179,8,0.15)", text: "#eab308" },
  EXPIRED: { bg: "rgba(239,68,68,0.15)", text: "#ef4444" },
  FAILED: { bg: "rgba(239,68,68,0.15)", text: "#ef4444" },
  USED: { bg: "rgba(59,130,246,0.15)", text: "#3b82f6" },
}

const defaultStyle = { bg: "rgba(107,114,128,0.15)", text: "#6b7280" }

/**
 * Colored badge for voucher and payment statuses.
 * ACTIVE/SUCCESS=green, PENDING=yellow, EXPIRED/FAILED=red, USED=blue.
 */
export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const style = statusStyles[status] ?? defaultStyle

  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {label ?? status}
    </span>
  )
}
