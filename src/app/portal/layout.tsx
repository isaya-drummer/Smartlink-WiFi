import type { Metadata } from "next"
import { LanguageProvider } from "@/context/LanguageContext"
import PortalHeader from "@/components/portal/PortalHeader"
import PortalFooter from "@/components/portal/PortalFooter"

export const metadata: Metadata = {
  title: {
    template: "Smartlink WiFi — %s",
    default: "Smartlink WiFi",
  },
  description: "We're here for you, daily",
}

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <LanguageProvider>
      <div
        className="min-h-screen flex flex-col"
        style={{ backgroundColor: "#0a1628" }}
      >
        <PortalHeader />

        {/* Main content */}
        <main className="flex-1 flex flex-col items-center px-4 py-2">
          <div className="w-full max-w-md">{children}</div>
        </main>

        <PortalFooter />
      </div>
    </LanguageProvider>
  )
}
