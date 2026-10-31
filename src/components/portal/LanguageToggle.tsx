"use client"

import { useLanguage } from "@/context/LanguageContext"
import { Globe } from "lucide-react"

export default function LanguageToggle() {
  const { lang, setLang } = useLanguage()

  return (
    <div
      className="inline-flex items-center gap-1 p-1 rounded-full text-xs font-medium shadow-sm transition-all"
      style={{
        backgroundColor: "#0d1f3c",
        border: "1px solid rgba(0, 180, 255, 0.3)",
      }}
      role="group"
      aria-label="Language Selector"
    >
      <div className="flex items-center pl-2 pr-1 text-gray-400">
        <Globe className="w-3.5 h-3.5 text-[#00b4ff]" />
      </div>

      <button
        type="button"
        onClick={() => setLang("en")}
        className={`px-2.5 py-1 rounded-full transition-all flex items-center gap-1 ${
          lang === "en"
            ? "font-semibold text-white shadow"
            : "text-gray-400 hover:text-white"
        }`}
        style={{
          backgroundColor: lang === "en" ? "#00b4ff" : "transparent",
          color: lang === "en" ? "#0a1628" : undefined,
        }}
        aria-pressed={lang === "en"}
      >
        <span>🇬🇧</span>
        <span>English</span>
      </button>

      <button
        type="button"
        onClick={() => setLang("sw")}
        className={`px-2.5 py-1 rounded-full transition-all flex items-center gap-1 ${
          lang === "sw"
            ? "font-semibold text-white shadow"
            : "text-gray-400 hover:text-white"
        }`}
        style={{
          backgroundColor: lang === "sw" ? "#00b4ff" : "transparent",
          color: lang === "sw" ? "#0a1628" : undefined,
        }}
        aria-pressed={lang === "sw"}
      >
        <span>🇹🇿</span>
        <span>Kiswahili</span>
      </button>
    </div>
  )
}

