"use client"
import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light"
interface ThemeContextValue { theme: Theme; toggleTheme: () => void }

const ThemeContext = createContext<ThemeContextValue>({ theme: "dark", toggleTheme: () => {} })

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark")
  useEffect(() => {
    const stored = localStorage.getItem("smartlink-theme") as Theme | null
    if (stored === "light" || stored === "dark") setTheme(stored)
  }, [])
  useEffect(() => {
    document.documentElement.classList.remove("dark", "light")
    document.documentElement.classList.add(theme)
    localStorage.setItem("smartlink-theme", theme)
  }, [theme])
  return (
    <ThemeContext.Provider value={{theme, toggleTheme: () => setTheme(t => t === "dark" ? "light" : "dark")}}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() { return useContext(ThemeContext) }
