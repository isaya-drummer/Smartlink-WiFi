"use client"
import { createContext, useContext, useEffect, useState } from "react"

export type Theme = "dark" | "light"

export const THEMES: { value: Theme; label: string; preview: string; icon: string }[] = [
  { value: "dark",  label: "Dark Mode",  preview: "#0a1a0f", icon: "🌙" },
  { value: "light", label: "Light Mode", preview: "#f5faf6", icon: "☀️" },
]

interface ThemeContextValue {
  theme: Theme
  setTheme: (t: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  setTheme: () => {},
  toggleTheme: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark")

  useEffect(() => {
    const stored = localStorage.getItem("smartlink-theme") as Theme | null
    if (stored === "dark" || stored === "light") setThemeState(stored)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove("dark", "light")
    root.classList.add(theme)
    localStorage.setItem("smartlink-theme", theme)
  }, [theme])

  function setTheme(t: Theme) { setThemeState(t) }
  function toggleTheme() {
    setThemeState((cur) => cur === "dark" ? "light" : "dark")
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() { return useContext(ThemeContext) }
