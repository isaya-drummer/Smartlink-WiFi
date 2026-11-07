"use client"

import { Sun, Moon } from "lucide-react"
import { useTheme } from "@/context/ThemeContext"

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === "dark"

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-all hover:scale-105 active:scale-95"
      style={{
        backgroundColor: isDark
          ? "rgba(200,135,10,0.12)"
          : "rgba(13,123,62,0.12)",
        border: isDark
          ? "1px solid rgba(200,135,10,0.3)"
          : "1px solid rgba(13,123,62,0.3)",
        color: isDark ? "#c8870a" : "#0d7b3e",
      }}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {isDark ? (
        <>
          <Sun className="w-4 h-4" />
          <span className="hidden sm:inline text-xs">Light</span>
        </>
      ) : (
        <>
          <Moon className="w-4 h-4" />
          <span className="hidden sm:inline text-xs">Dark</span>
        </>
      )}
    </button>
  )
}
