"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"

const PROVIDERS = [
  {
    key: "YAS",
    label: "Yas Mixx",
    logo: "/yas.jpg",
    bg: "#FFC107",        // yellow — matches Yas brand
  },
  {
    key: "AIRTEL",
    label: "Airtel",
    logo: "/airtel.jpg",
    bg: "#E53935",        // red — matches Airtel brand
  },
  {
    key: "VODACOM",
    label: "Vodacom M-Pesa",
    logo: "/vodacom.png",
    bg: "#E53935",        // red — matches Vodacom brand
  },
  {
    key: "HALOTEL",
    label: "HaloPesa",
    logo: "/halopesa.png",
    bg: "#ffffff",        // white — matches HaloPesa brand
  },
] as const

export default function PortalPage() {
  const router = useRouter()

  return (
    <div className="flex flex-col gap-6">
      {/* Page heading */}
      <div className="text-center mt-2">
        <h1 className="text-2xl font-bold text-white">Connect to WiFi</h1>
        <p className="mt-1 text-sm" style={{ color: "#00b4ff" }}>
          Select Your Mobile Money Provider
        </p>
      </div>

      {/* 2×2 provider grid */}
      <div className="grid grid-cols-2 gap-4">
        {PROVIDERS.map((p) => (
          <button
            key={p.key}
            onClick={() => router.push(`/portal/bundle?provider=${p.key}`)}
            className="relative overflow-hidden rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-white/30 shadow-lg flex items-center justify-center p-3"
            style={{ height: "140px", backgroundColor: p.bg }}
            aria-label={`Pay with ${p.label}`}
          >
            {/* Logo contained fully — no cropping, brand bg fills the rest */}
            <div className="relative w-full h-full">
              <Image
                src={p.logo}
                alt={p.label}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 50vw, 200px"
              />
            </div>
            {/* Tap feedback overlay */}
            <div className="absolute inset-0 bg-black/0 hover:bg-black/10 active:bg-black/20 transition-colors duration-150 rounded-2xl" />
          </button>
        ))}
      </div>

      <p className="text-center text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
        Tap your mobile money provider to continue
      </p>
    </div>
  )
}
