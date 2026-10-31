"use client"

import { formatCurrency, formatDataLimit, formatDuration } from "@/lib/utils"
import { useLanguage } from "@/context/LanguageContext"

interface Bundle {
  id: string
  name: string
  description?: string | null
  price: number
  currency: string
  durationHours: number
  dataLimitMB: number
}

interface BundleCardProps {
  bundle: Bundle
  onClick: (bundleId: string) => void
}

/**
 * Dark card for displaying a WiFi bundle with cyan accents.
 * Shows bundle name, description, duration, data limit, and price.
 */
export default function BundleCard({ bundle, onClick }: BundleCardProps) {
  const { t } = useLanguage()

  return (
    <button
      onClick={() => onClick(bundle.id)}
      className="w-full text-left rounded-xl p-4 transition-all duration-200 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-[#00b4ff]"
      style={{ backgroundColor: "#0d1f3c", border: "1px solid #1e3a5f" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#00b4ff"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#1e3a5f"
      }}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-white font-semibold text-base">{bundle.name}</h3>
        <span
          className="text-lg font-bold"
          style={{ color: "#00b4ff" }}
        >
          {formatCurrency(bundle.price, bundle.currency)}
        </span>
      </div>

      {bundle.description && (
        <p className="text-white/70 text-sm mb-3">{bundle.description}</p>
      )}

      <div className="flex flex-wrap gap-3 mt-2">
        <div className="flex flex-col">
          <span className="text-white/50 text-xs uppercase tracking-wide">{t.bundle.duration}</span>
          <span className="text-sm font-medium" style={{ color: "#00b4ff" }}>
            {formatDuration(bundle.durationHours)}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-white/50 text-xs uppercase tracking-wide">{t.bundle.dataLimit}</span>
          <span className="text-sm font-medium" style={{ color: "#00b4ff" }}>
            {formatDataLimit(bundle.dataLimitMB)}
          </span>
        </div>
      </div>
    </button>
  )
}
