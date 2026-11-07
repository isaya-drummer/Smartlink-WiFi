"use client"

import SmartLinkLogo from "@/components/SmartLinkLogo"
import LanguageToggle from "@/components/portal/LanguageToggle"
import { useLanguage } from "@/context/LanguageContext"

export default function PortalHeader() {
  const { t } = useLanguage()

  return (
    <header className="flex flex-col items-center pt-6 pb-4 px-4 relative w-full max-w-md mx-auto">
      {/* Language toggle — icon only, top right */}
      <div className="w-full flex justify-end items-center mb-4">
        <LanguageToggle />
      </div>

      <SmartLinkLogo size="lg" />

      <p
        className="mt-3 text-base font-medium text-center transition-opacity duration-200"
        style={{ color: "#c8870a" }}
      >
        {t.common.tagline}
      </p>
    </header>
  )
}
