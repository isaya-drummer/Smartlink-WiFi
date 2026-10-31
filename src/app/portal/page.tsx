"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Phone, MessageCircle, Headphones } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"

const PROVIDERS = [
  {
    key: "YAS",
    label: "Yas Mixx",
    logo: "/yas.jpg",
    bg: "#FFC107", // yellow — matches Yas brand
  },
  {
    key: "AIRTEL",
    label: "Airtel",
    logo: "/airtel.jpg",
    bg: "#E53935", // red — matches Airtel brand
  },
  {
    key: "VODACOM",
    label: "Vodacom M-Pesa",
    logo: "/vodacom.png",
    bg: "#E53935", // red — matches Vodacom brand
  },
  {
    key: "HALOTEL",
    label: "HaloPesa",
    logo: "/halopesa.png",
    bg: "#ffffff", // white — matches HaloPesa brand
  },
] as const

interface ContactSettings {
  admin_phone: string
  admin_whatsapp: string
}

export default function PortalPage() {
  const router = useRouter()
  const { t } = useLanguage()

  const [contact, setContact] = useState<ContactSettings>({
    admin_phone: "+255 744 000 000",
    admin_whatsapp: "255744000000",
  })

  useEffect(() => {
    fetch("/api/portal/settings")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load settings")
        return res.json()
      })
      .then((data) => {
        if (data.admin_phone || data.admin_whatsapp) {
          setContact({
            admin_phone: data.admin_phone || "+255 744 000 000",
            admin_whatsapp:
              data.admin_whatsapp?.replace(/\D/g, "") || "255744000000",
          })
        }
      })
      .catch(() => {
        // Safe fallback already in state
      })
  }, [])

  const sanitizedTel = contact.admin_phone.replace(/\s+/g, "")
  const whatsappUrl = `https://wa.me/${contact.admin_whatsapp}?text=${encodeURIComponent(
    t.portal.contact.defaultMessage
  )}`

  return (
    <div className="flex flex-col gap-6 pb-6">
      {/* Page heading */}
      <div className="text-center mt-1">
        <h1 className="text-2xl font-bold text-white transition-opacity duration-200">
          {t.portal.title}
        </h1>
        <p className="mt-1 text-sm font-medium" style={{ color: "#00b4ff" }}>
          {t.portal.subtitle}
        </p>
      </div>

      {/* 2×2 provider grid */}
      <div className="grid grid-cols-2 gap-4">
        {PROVIDERS.map((p) => (
          <button
            key={p.key}
            onClick={() => router.push(`/portal/bundle?provider=${p.key}`)}
            className="relative overflow-hidden rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-white/30 shadow-lg flex items-center justify-center p-3"
            style={{ height: "135px", backgroundColor: p.bg }}
            aria-label={`Pay with ${p.label}`}
          >
            {/* Logo contained fully — brand bg fills rest */}
            <div className="relative w-full h-full">
              <Image
                src={p.logo}
                alt={p.label}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 50vw, 200px"
                priority
              />
            </div>
            {/* Tap feedback overlay */}
            <div className="absolute inset-0 bg-black/0 hover:bg-black/10 active:bg-black/20 transition-colors duration-150 rounded-2xl" />
          </button>
        ))}
      </div>

      <p
        className="text-center text-xs"
        style={{ color: "rgba(255,255,255,0.45)" }}
      >
        {t.portal.instruction}
      </p>

      {/* ── Direct Admin Contact Card ── */}
      <div
        className="rounded-2xl p-4 sm:p-5 transition-all shadow-xl mt-1"
        style={{
          backgroundColor: "#0d1f3c",
          border: "1px solid rgba(0, 180, 255, 0.28)",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 0 15px -3px rgba(0, 180, 255, 0.1)",
        }}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor: "rgba(0, 180, 255, 0.15)",
                color: "#00b4ff",
              }}
            >
              <Headphones className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white leading-tight">
                {t.portal.contact.title}
              </h2>
              <span className="text-[11px] font-mono text-gray-400">
                {contact.admin_phone}
              </span>
            </div>
          </div>

          <span
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0"
            style={{
              backgroundColor: "rgba(16, 185, 129, 0.15)",
              color: "#10b981",
              border: "1px solid rgba(16, 185, 129, 0.3)",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {t.portal.contact.badge}
          </span>
        </div>

        <p
          className="text-xs mb-4 leading-relaxed"
          style={{ color: "rgba(255, 255, 255, 0.7)" }}
        >
          {t.portal.contact.subtitle}
        </p>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Direct Phone Call Button */}
          <a
            href={`tel:${sanitizedTel}`}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold text-white transition-all transform active:scale-95 shadow"
            style={{
              background: "linear-gradient(135deg, #00b4ff 0%, #0066ff 100%)",
            }}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>{t.portal.contact.callButton}</span>
          </a>

          {/* WhatsApp Direct Chat Button */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold text-white transition-all transform active:scale-95 shadow"
            style={{
              backgroundColor: "#25D366",
            }}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>{t.portal.contact.whatsappButton}</span>
          </a>
        </div>
      </div>
    </div>
  )
}
