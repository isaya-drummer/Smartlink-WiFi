"use client"

import { useRef, useState, useEffect } from "react"
import { Palette } from "lucide-react"
import { useTheme, THEMES } from "@/context/ThemeContext"

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="rounded-lg p-2 transition-colors hover:bg-white/10"
        style={{ color: open ? "var(--accent)" : "#9ca3af" }}
        aria-label="Change theme"
        title="Change theme"
      >
        <Palette className="w-5 h-5" />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 z-50 rounded-2xl shadow-2xl p-3 min-w-[180px]"
          style={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-color)",
          }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-widest mb-3 px-1"
            style={{ color: "var(--text-secondary)" }}>
            Choose Theme
          </p>
          <div className="space-y-1">
            {THEMES.map((t) => (
              <button
                key={t.value}
                onClick={() => { setTheme(t.value); setOpen(false) }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors hover:bg-white/10 text-left"
                style={{
                  backgroundColor: theme === t.value ? "rgba(255,255,255,0.08)" : "transparent",
                }}
              >
                {/* Color swatch */}
                <span
                  className="w-5 h-5 rounded-full flex-shrink-0 border-2"
                  style={{
                    backgroundColor: t.preview,
                    borderColor: theme === t.value ? "var(--accent)" : "transparent",
                    boxShadow: theme === t.value ? `0 0 0 2px var(--accent)` : "none",
                  }}
                />
                <span
                  className="text-sm font-medium"
                  style={{ color: theme === t.value ? "var(--accent)" : "var(--text-primary)" }}
                >
                  {t.label}
                </span>
                {theme === t.value && (
                  <span className="ml-auto text-xs" style={{ color: "var(--accent)" }}>✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
