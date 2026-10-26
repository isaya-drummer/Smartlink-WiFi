import { PROVIDER_CONFIG, type Provider } from "@/lib/payment"

interface ProviderBadgeProps {
  provider: Provider
  className?: string
}

/**
 * Colored pill badge for a payment provider using brand colors.
 */
export default function ProviderBadge({
  provider,
  className = "",
}: ProviderBadgeProps) {
  const config = PROVIDER_CONFIG[provider]

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${className}`}
      style={{
        backgroundColor: config.color,
        color: config.textColor,
      }}
    >
      {config.name}
    </span>
  )
}
