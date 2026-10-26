import type { Metadata } from "next"
import SmartLinkLogo from "@/components/SmartLinkLogo"

export const metadata: Metadata = {
  title: {
    template: "SmartLink Digital — %s",
    default: "SmartLink Digital",
  },
  description: "We're here for you, daily",
}

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#0a1628" }}
    >
      {/* Header */}
      <header className="flex flex-col items-center pt-8 pb-4 px-4">
        <SmartLinkLogo size="lg" />
        <p
          className="mt-3 text-base font-medium"
          style={{ color: "#00b4ff" }}
        >
          We&apos;re here for you, daily
        </p>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center px-4 py-4">
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center">
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
          &copy; 2024 SmartLink Digital &mdash; We&apos;re here for you, daily
        </p>
      </footer>
    </div>
  )
}
