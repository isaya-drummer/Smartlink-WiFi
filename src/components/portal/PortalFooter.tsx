"use client"

import { useLanguage } from "@/context/LanguageContext"

export default function PortalFooter() {
  const { t } = useLanguage()

  return (
    <footer className="py-4 text-center px-4">
      <p className="text-xs transition-opacity duration-200" style={{ color: "rgba(255,255,255,0.4)" }}>
        {t.common.copyright}
      </p>
    </footer>
  )
}

