"use client"

import { useEffect, useRef, useState } from "react"
import { useSession } from "next-auth/react"
import { Save, Camera } from "lucide-react"
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
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const photoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    document.title = "SmartLink Digital — Admin: Profile"
    fetch("/api/admin/profile")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        setName(data.name ?? "")
        setEmail(data.email ?? "")
        setRole(data.role ?? "")
        setAvatarUrl(data.avatarUrl ?? null)
      })
      .catch(() => {
        setName(session?.user?.name ?? "")
        setEmail(session?.user?.email ?? "")
        setRole(session?.user?.role ?? "")
      })
      .finally(() => setLoading(false))
  }, [session?.user?.email, session?.user?.name, session?.user?.role])

  async function handlePhotoUpload(file: File) {
    setUploadingPhoto(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/uploadthing", { method: "POST", body: fd })
      if (!res.ok) return
      const d = await res.json()
      const url: string = d.data.url
      await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: url }),
      })
      setAvatarUrl(url)
    } finally {
      setUploadingPhoto(false)
    }
  }

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
          style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border-color)" }}
        >
          {/* Avatar section */}
          <div className="flex flex-col items-center gap-3 pb-2">
            <div className="relative">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  className="w-20 h-20 rounded-full object-cover"
                  alt="Profile photo"
                />
              ) : (
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-xl font-bold"
                  style={{ backgroundColor: "rgba(0,180,255,0.2)", color: "#00b4ff" }}
                >
                  {name.trim().slice(0, 2).toUpperCase() || "AD"}
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              ref={photoInputRef}
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) handlePhotoUpload(f)
              }}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => photoInputRef.current?.click()}
              disabled={uploadingPhoto}
              className="flex items-center gap-2 text-xs"
              style={{ borderColor: "var(--border-color)", color: "#9ca3af" }}
            >
              <Camera className="w-3.5 h-3.5" />
              {uploadingPhoto ? "Uploading…" : "Upload photo"}
            </Button>
          </div>

          <div className="space-y-1.5">
            <Label className="text-gray-300">Full name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. James Mwamba"
              style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)", color: "#fff" }}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-gray-300">Email</Label>
            <Input
              value={email}
              disabled
              style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)", color: "#9ca3af" }}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-gray-300">Role</Label>
            <Input
              value={role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
              disabled
              style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)", color: "#9ca3af" }}
            />
          </div>
          <div className="flex items-center gap-3 pt-1">
            <Button
              onClick={handleSave}
              disabled={saving || name.trim().length < 2}
              style={{ backgroundColor: "#00b4ff", color: "var(--bg-primary)" }}
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
