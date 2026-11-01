"use client"
import { createContext, useContext, useEffect, useState } from "react"

export type Theme = "dark" | "light" | "ocean" | "forest" | "sunset"

export const THEMES: { value: Theme; label: string; preview: string }[] = [
  { value: "dark",   label: "Dark",    preview: "#0a1628" },
  { value: "light",  label: "Slate",   preview: "#1e293b" },
  { value: "ocean",  label: "Ocean",   preview: "#0c1445" },
  { value: "forest", label: "Forest",  preview: "#0a1f0f" },
  { value: "sunset", label: "Sunset",  preview: "#1a0a2e" },
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
    if (stored && THEMES.find((t) => t.value === stored)) setThemeState(stored)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    THEMES.forEach((t) => root.classList.remove(t.value))
    root.classList.add(theme)
    localStorage.setItem("smartlink-theme", theme)
  }, [theme])

  function setTheme(t: Theme) { setThemeState(t) }
  function toggleTheme() {
    setThemeState((cur) => {
      const idx = THEMES.findIndex((t) => t.value === cur)
      return THEMES[(idx + 1) % THEMES.length].value
    })
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() { return useContext(ThemeContext) }
