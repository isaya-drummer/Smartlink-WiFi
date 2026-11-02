"use client"

import { Suspense, useState } from "react"
import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import SmartLinkLogo from "@/components/SmartLinkLogo"

function LoginForm() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") ?? "/"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError("Invalid email or password. Please try again.")
    } else {
      window.location.href = callbackUrl
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-300">
          Email
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@wifi.local"
          className="w-full px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-2 transition"
          style={{
            backgroundColor: "#0a1628",
            border: "1px solid #1e3a5f",
            color: "#fff",
          }}
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-300">
          Password
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-2 transition"
          style={{
            backgroundColor: "#0a1628",
            border: "1px solid #1e3a5f",
            color: "#fff",
          }}
        />
      </div>

      {error && (
        <p className="text-sm text-red-400 text-center">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 rounded-lg font-semibold text-white text-sm transition-opacity disabled:opacity-60"
        style={{
          background: "linear-gradient(to right, #00b4ff, #0066ff)",
        }}
      >
        {loading ? "Signing in…" : "Sign In"}
      </button>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "#0a1628" }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-8 space-y-6"
        style={{
          backgroundColor: "#0d1f3c",
          border: "1px solid #00b4ff",
        }}
      >
        {/* Logo */}
        <div className="flex justify-center">
          <SmartLinkLogo size="lg" />
        </div>

        {/* Title */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-white">Smartlink WiFi</h1>
          <p className="text-sm" style={{ color: "#00b4ff" }}>
            We&apos;re here for you, daily
          </p>
        </div>

        {/* Form wrapped in Suspense for useSearchParams */}
        <Suspense
          fallback={
            <div className="py-4 text-center text-gray-400 text-sm">
              Loading…
            </div>
          }
        >
          <LoginForm />
        </Suspense>

        <p className="text-center text-xs text-gray-500">
          © 2024 Smartlink WiFi
        </p>
      </div>
    </div>
  )
}
