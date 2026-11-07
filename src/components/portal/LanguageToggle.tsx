"use client"

import { useRef, useState, useEffect } from "react"
import { useLanguage } from "@/context/LanguageContext"
import { Globe } from "lucide-react"

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "sw", label: "Kiswahili", flag: "🇹🇿" },
] as const

export default function LanguageToggle() {
  const { lang, setLang } = useLanguage()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0]

  return (
    <div ref={ref} className="relative" role="combobox" aria-expanded={open}>
      {/* Trigger — icon only */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-105 active:scale-95"
        style={{
          backgroundColor: "rgba(200,135,10,0.12)",
          border: "1px solid rgba(200,135,10,0.3)",
          color: "#c8870a",
        }}
        aria-label="Change language"
        title="Change language"
      >
        <Globe className="w-4 h-4" />
        <span>{current.flag}</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 z-50 rounded-xl overflow-hidden shadow-xl min-w-[140px]"
          style={{ backgroundColor: "#0f2318", border: "1px solid rgba(200,135,10,0.25)" }}
        >
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => { setLang(l.code); setOpen(false) }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors hover:bg-white/10"
              style={{
                color: lang === l.code ? "#c8870a" : "#fff",
                fontWeight: lang === l.code ? 600 : 400,
                backgroundColor: lang === l.code ? "rgba(200,135,10,0.10)" : "transparent",
              }}
            >
              <span className="text-base">{l.flag}</span>
              <span>{l.label}</span>
              {lang === l.code && <span className="ml-auto text-[10px]">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
