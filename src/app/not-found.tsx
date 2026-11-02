import Link from "next/link"
import SmartLinkLogo from "@/components/SmartLinkLogo"

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "#0a1628" }}
    >
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <SmartLinkLogo size="lg" />
        </div>

        <div className="space-y-2">
          <h1 className="text-6xl font-bold" style={{ color: "#00b4ff" }}>
            404
          </h1>
          <h2 className="text-2xl font-semibold text-white">Page Not Found</h2>
          <p className="text-gray-400 max-w-sm mx-auto">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        <Link
          href="/portal"
          className="inline-block px-6 py-3 rounded-lg font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(to right, #00b4ff, #0066ff)" }}
        >
          Go Home
        </Link>

        <p className="text-xs text-gray-600">
          © 2024 Smartlink WiFi — We&apos;re here for you, daily
        </p>
      </div>
    </div>
  )
}
