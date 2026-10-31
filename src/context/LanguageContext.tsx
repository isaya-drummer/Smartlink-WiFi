"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { Language, translations, TranslationSchema } from "@/lib/translations"

interface LanguageContextType {
  lang: Language
  setLang: (lang: Language) => void
  t: TranslationSchema
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  setLang: () => {},
  t: translations.en,
})

const STORAGE_KEY = "smartlink_portal_language"

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("en")

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Language | null
      if (saved === "en" || saved === "sw") {
        setLangState(saved)
      } else {
        const browserLang = navigator.language.toLowerCase()
        if (browserLang.startsWith("sw")) {
          setLangState("sw")
        }
      }
    } catch {
      // Ignore
    }
  }, [])

  const setLang = (newLang: Language) => {
    setLangState(newLang)
    try {
      localStorage.setItem(STORAGE_KEY, newLang)
    } catch {
      // Ignore
    }
  }

  const t = translations[lang]

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
