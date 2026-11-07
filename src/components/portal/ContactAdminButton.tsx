"use client"

import { useEffect, useState } from "react"
import { LifeBuoy, MessageCircle, Phone } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useLanguage } from "@/context/LanguageContext"

interface ContactSettings {
  admin_phone: string
  admin_whatsapp: string
}

export default function ContactAdminButton() {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const [contact, setContact] = useState<ContactSettings>({
    admin_phone: "+255 618 128 427",
    admin_whatsapp: "255618128427",
  })

  useEffect(() => {
    if (!open) return
    fetch("/api/portal/settings")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load settings")
        return res.json()
      })
      .then((data) => {
        if (data.admin_phone || data.admin_whatsapp) {
          setContact({
            admin_phone: data.admin_phone || "+255 618 128 427",
            admin_whatsapp: (data.admin_whatsapp || "255618128427").replace(/\D/g, ""),
          })
        }
      })
      .catch(() => {
        // keep fallback numbers
      })
  }, [open])

  const sanitizedTel = contact.admin_phone.replace(/\s+/g, "")
  const whatsappUrl = `https://wa.me/${contact.admin_whatsapp}?text=${encodeURIComponent(
    t.portal.contact.defaultMessage
  )}`

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="relative p-4 rounded-2xl transition-all hover:scale-105 active:scale-95"
          style={{
            backgroundColor: "rgba(200, 135, 10, 0.15)",
            color: "#c8870a",
            border: "2px solid rgba(200, 135, 10, 0.5)",
          }}
          aria-label={t.portal.contact.iconLabel}
          title={t.portal.contact.iconLabel}
        >
          <MessageCircle className="w-8 h-8" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#0a1a0f]" />
        </button>
      </DialogTrigger>
      <DialogContent
        className="max-w-sm border text-white"
        style={{ backgroundColor: "#0f2318", borderColor: "rgba(200, 135, 10, 0.28)" }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <span
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(200, 135, 10, 0.15)", color: "#c8870a" }}
            >
            <LifeBuoy className="w-4 h-4" />
            </span>
            {t.portal.contact.title}
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            {t.portal.contact.subtitle}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-mono text-gray-400">{contact.admin_phone}</span>
          <span
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold"
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

        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <a
            href={`tel:${sanitizedTel}`}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #0d7b3e 0%, #0a6332 100%)" }}
          >
            <Phone className="w-3.5 h-3.5" />
            {t.portal.contact.callButton}
          </a>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold text-white"
            style={{ backgroundColor: "#25D366" }}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            {t.portal.contact.whatsappButton}
          </a>
        </div>
      </DialogContent>
    </Dialog>
  )
}
