"use client"

import type { Metadata } from "next"
import { useRouter } from "next/navigation"
import { Wifi } from "lucide-react"

// Note: metadata can't be exported from client components; set in layout or a server wrapper.
// The layout handles the title template; this page's title is provided via a <title> tag approach.

const PROVIDERS = [
  { key: "YAS", label: "YAS", bg: "#FFC107", text: "#1a1a1a" },
  { key: "AIRTEL", label: "Airtel", bg: "#E53935", text: "#ffffff" },
  { key: "VODACOM", label: "Vodacom", bg: "#43A047", text: "#ffffff" },
  { key: "HALOTEL", label: "Halotel", bg: "#1E88E5", text: "#ffffff" },
] as const

export default function PortalPage() {
  const router = useRouter()

  const handleProviderSelect = (provider: string) => {
    router.push(`/portal/bundle?provider=${provider}`)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page heading */}
      <div className="text-center mt-2">
        <h1 className="text-2xl font-bold text-white">Connect to WiFi</h1>
        <p className="mt-1 text-sm" style={{ color: "#00b4ff" }}>
          Select Your Network Provider
        </p>
      </div>

      {/* 2×2 provider grid */}
      <div className="grid grid-cols-2 gap-4">
        {PROVIDERS.map((p) => (
          <button
            key={p.key}
            onClick={() => handleProviderSelect(p.key)}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl py-8 px-4 font-bold text-lg transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-white/30"
            style={{ backgroundColor: p.bg, color: p.text }}
            aria-label={`Connect with ${p.label}`}
          >
            <Wifi size={32} />
            {p.label}
          </button>
        ))}
      </div>

      <p className="text-center text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
        Tap your mobile money provider to continue
      </p>
    </div>
  )
}
