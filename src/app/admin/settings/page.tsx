"use client"

import { useEffect, useState } from "react"
import { Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface SystemSetting {
  id: string
  key: string
  value: string
}

const SETTING_FIELDS = [
  {
    key: "hotspot_name",
    label: "Hotspot Name",
    type: "text",
    placeholder: "SmartLink WiFi",
  },
  {
    key: "admin_phone",
    label: "Admin / Support Phone Number",
    type: "text",
    placeholder: "+255 744 000 000",
  },
  {
    key: "admin_whatsapp",
    label: "WhatsApp Number (without + or spaces, e.g. 255744000000)",
    type: "text",
    placeholder: "255744000000",
  },
  {
    key: "max_sessions",
    label: "Max Sessions",
    type: "number",
    placeholder: "100",
  },
  {
    key: "session_timeout_hours",
    label: "Session Timeout (hours)",
    type: "number",
    placeholder: "24",
  },
  {
    key: "welcome_message",
    label: "Welcome Message",
    type: "textarea",
    placeholder: "Welcome to SmartLink WiFi!",
  },
]

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [original, setOriginal] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    document.title = "Smartlink WiFi — Admin: Settings"
    fetchSettings()
  }, [])

  async function fetchSettings() {
    setLoading(true)
    const res = await fetch("/api/admin/settings")
    if (res.ok) {
      const data: SystemSetting[] = await res.json()
      const map: Record<string, string> = {}
      data.forEach((s) => { map[s.key] = s.value })
      setSettings(map)
      setOriginal(map)
    }
    setLoading(false)
  }

  async function handleSave() {
    setSaving(true)
    const changedKeys = SETTING_FIELDS
      .map((f) => f.key)
      .filter((k) => settings[k] !== undefined && settings[k] !== original[k])

    for (const key of changedKeys) {
      await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value: settings[key] }),
      })
    }

    // Also save any that exist in form but not in original (new keys)
    for (const f of SETTING_FIELDS) {
      if (!(f.key in original) && settings[f.key]) {
        await fetch("/api/admin/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: f.key, value: settings[f.key] }),
        })
      }
    }

    await fetchSettings()
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleChange(key: string, value: string) {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-gray-400 mt-1">
          Configure your WiFi hotspot system settings
        </p>
      </div>

      {loading ? (
        <div className="text-gray-400 py-8 text-center">Loading...</div>
      ) : (
        <div
          className="rounded-xl p-6 space-y-5"
          style={{ backgroundColor: "#0a1628", border: "1px solid #1e3a5f" }}
        >
          {SETTING_FIELDS.map((field) => (
            <div key={field.key} className="space-y-1.5">
              <Label className="text-gray-300">{field.label}</Label>
              {field.type === "textarea" ? (
                <textarea
                  value={settings[field.key] ?? ""}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  rows={3}
                  className="w-full px-3 py-2 text-sm rounded-lg resize-none outline-none focus:ring-2"
                  style={{
                    backgroundColor: "#0d1f3c",
                    border: "1px solid #1e3a5f",
                    color: "#fff",
                  } as React.CSSProperties}
                />
              ) : (
                <Input
                  type={field.type}
                  value={settings[field.key] ?? ""}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  style={{
                    backgroundColor: "#0d1f3c",
                    borderColor: "#1e3a5f",
                    color: "#fff",
                  }}
                />
              )}
            </div>
          ))}

          <div className="pt-2 flex items-center gap-3">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2"
              style={{ backgroundColor: "#00b4ff", color: "#000" }}
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving…" : "Save Settings"}
            </Button>
            {saved && (
              <span className="text-sm" style={{ color: "#22c55e" }}>
                Settings saved!
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
