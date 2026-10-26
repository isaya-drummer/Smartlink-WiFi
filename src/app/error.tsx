"use client"

import SmartLinkLogo from "@/components/SmartLinkLogo"

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
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
          <h1 className="text-4xl font-bold text-white">Something went wrong</h1>
          <p className="text-gray-400 max-w-sm mx-auto">
            {error.message ?? "An unexpected error occurred. Please try again."}
          </p>
          {error.digest && (
            <p className="text-xs text-gray-600">Error ID: {error.digest}</p>
          )}
        </div>

        <button
          onClick={reset}
          className="px-6 py-3 rounded-lg font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(to right, #00b4ff, #0066ff)" }}
        >
          Try Again
        </button>

        <p className="text-xs text-gray-600">
          © 2024 SmartLink Digital — We&apos;re here for you, daily
        </p>
      </div>
    </div>
  )
}
