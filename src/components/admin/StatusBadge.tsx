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
  ACTIVE: { bg: "rgba(26,158,74,0.15)", text: "#1a9e4a" },
  SUCCESS: { bg: "rgba(26,158,74,0.15)", text: "#1a9e4a" },
  PENDING: { bg: "rgba(200,135,10,0.15)", text: "#c8870a" },
  EXPIRED: { bg: "rgba(239,68,68,0.15)", text: "#ef4444" },
  FAILED: { bg: "rgba(239,68,68,0.15)", text: "#ef4444" },
  USED: { bg: "rgba(59,130,246,0.15)", text: "#3b82f6" },
}

const defaultStyle = { bg: "rgba(107,114,128,0.15)", text: "#6b7280" }

/**
 * Colored badge for voucher and payment statuses.
 * ACTIVE/SUCCESS=green, PENDING=gold, EXPIRED/FAILED=red, USED=blue.
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
