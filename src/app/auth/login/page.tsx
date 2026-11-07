"use client"
import { Suspense, useState } from "react"
import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import SmartLinkLogo from "@/components/SmartLinkLogo"

function LoginForm() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") ?? "/"
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    const result = await signIn("credentials", { email, password, redirect: false })
    setLoading(false)
    if (result?.error) {
      setError("Invalid email or password. Please try again.")
    } else {
      window.location.href = callbackUrl
    }
  }

  const inputStyle = { backgroundColor: "#071510", border: "1px solid #1a3d22", color: "#fff" }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="block text-sm font-medium" style={{ color: "#8aab92" }}>Email</label>
        <input type="email" required value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@smartlinkwifi.com"
          className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition"
          style={inputStyle} />
      </div>
      <div className="space-y-1.5">
        <label className="block text-sm font-medium" style={{ color: "#8aab92" }}>Password</label>
        <div className="relative">
          <input
            type={showPw ? "text" : "password"} required value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-2.5 pr-11 rounded-lg text-sm outline-none transition"
            style={inputStyle} />
          <button type="button" onClick={() => setShowPw((v) => !v)} tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-colors"
            style={{ color: "#8aab92" }}
            aria-label={showPw ? "Hide password" : "Show password"}>
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
      {error && <p className="text-sm text-red-400 text-center">{error}</p>}
      <button type="submit" disabled={loading}
        className="w-full py-2.5 rounded-lg font-semibold text-white text-sm transition-opacity disabled:opacity-60"
        style={{ background: "linear-gradient(to right, #c8870a, #a06208)" }}>
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#0a1a0f" }}>
      <div className="w-full max-w-md rounded-2xl p-8 space-y-6"
        style={{ backgroundColor: "#0f2318", border: "1px solid #c8870a" }}>
        <div className="flex justify-center"><SmartLinkLogo size="lg" /></div>
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-white">Smartlink <span style={{ color: "#c8870a" }}>WiFi</span></h1>
          <p className="text-sm" style={{ color: "#c8870a" }}>We&apos;re here for you, daily</p>
        </div>
        <Suspense fallback={<div className="py-4 text-center text-sm" style={{ color: "#8aab92" }}>Loading...</div>}>
          <LoginForm />
        </Suspense>
        <p className="text-center text-xs" style={{ color: "#4a7055" }}>© 2026 Smartlink WiFi</p>
      </div>
    </div>
  )
}