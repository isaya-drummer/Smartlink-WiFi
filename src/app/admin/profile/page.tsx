"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    document.title = "SmartLink Digital — Admin: Profile"
    fetch("/api/admin/profile")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        setName(data.name ?? "")
        setEmail(data.email ?? "")
        setRole(data.role ?? "")
      })
      .catch(() => {
        setName(session?.user?.name ?? "")
        setEmail(session?.user?.email ?? "")
        setRole(session?.user?.role ?? "")
      })
      .finally(() => setLoading(false))
  }, [session?.user?.email, session?.user?.name, session?.user?.role])

  async function handleSave() {
    setSaving(true)
    setMessage("")
    setError("")
    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Could not save profile.")
        return
      }
      await update({ name: data.name })
      setMessage("Profile updated. Dashboard greetings will use this name.")
    } catch {
      setError("Could not save profile.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-xl">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-white">Profile</h1>
        <p className="text-sm text-gray-400 mt-1">
          This name is used for greetings, reports, and your account menu.
        </p>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : (
        <div
          className="rounded-xl p-6 space-y-5"
          style={{ backgroundColor: "#0a1628", border: "1px solid #1e3a5f" }}
        >
          <div className="space-y-1.5">
            <Label className="text-gray-300">Full name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. James Mwamba"
              style={{ backgroundColor: "#0d1f3c", borderColor: "#1e3a5f", color: "#fff" }}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-gray-300">Email</Label>
            <Input
              value={email}
              disabled
              style={{ backgroundColor: "#0d1f3c", borderColor: "#1e3a5f", color: "#9ca3af" }}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-gray-300">Role</Label>
            <Input
              value={role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
              disabled
              style={{ backgroundColor: "#0d1f3c", borderColor: "#1e3a5f", color: "#9ca3af" }}
            />
          </div>
          <div className="flex items-center gap-3 pt-1">
            <Button
              onClick={handleSave}
              disabled={saving || name.trim().length < 2}
              style={{ backgroundColor: "#00b4ff", color: "#0a1628" }}
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving…" : "Save profile"}
            </Button>
            {message && <span className="text-sm text-emerald-400">{message}</span>}
            {error && <span className="text-sm text-red-400">{error}</span>}
          </div>
        </div>
      )}
    </div>
  )
}
