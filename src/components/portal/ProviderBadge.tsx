import Image from "next/image"
import { PROVIDER_CONFIG, type Provider } from "@/lib/payment"

interface ProviderBadgeProps {
  provider: Provider
  className?: string
}

/**
 * Provider badge with logo and brand color for use on bundle/pay pages.
 */
export default function ProviderBadge({
  provider,
  className = "",
}: ProviderBadgeProps) {
  const config = PROVIDER_CONFIG[provider]

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${className}`}
      style={{
        backgroundColor: config.color,
        color: config.textColor,
      }}
    >
      <Image
        src={config.logo}
        alt={config.name}
        width={24}
        height={24}
        className="rounded-sm object-contain"
        style={{ background: "white", padding: "1px" }}
      />
      {config.name}
    </span>
  )
}
