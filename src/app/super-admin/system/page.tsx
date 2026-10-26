"use client"

import { useEffect, useState, useCallback } from "react"
import { Save, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

interface SystemSetting {
  id: string
  key: string
  value: string
}

interface DbInfo {
  users: number
  bundles: number
  vouchers: number
  payments: number
  auditLogs: number
  sessions: number
}

export default function SystemPage() {
  const [settings, setSettings] = useState<SystemSetting[]>([])
  const [editValues, setEditValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const [dbInfo, setDbInfo] = useState<DbInfo | null>(null)
  const [dangerOpen, setDangerOpen] = useState(false)
  const [dangerLoading, setDangerLoading] = useState(false)
  const [dangerDone, setDangerDone] = useState(false)

  const fetchSettings = useCallback(async () => {
    setLoading(true)
    const res = await fetch("/api/super-admin/settings")
    if (res.ok) {
      const data: SystemSetting[] = await res.json()
      setSettings(data)
      const map: Record<string, string> = {}
      data.forEach((s) => { map[s.key] = s.value })
      setEditValues(map)
    }
    setLoading(false)
  }, [])

  const fetchDbInfo = useCallback(async () => {
    const res = await fetch("/api/super-admin/db-info")
    if (res.ok) {
      setDbInfo(await res.json())
    }
  }, [])

  useEffect(() => {
    document.title = "SmartLink Digital — Super Admin: System"
    fetchSettings()
    fetchDbInfo()
  }, [fetchSettings, fetchDbInfo])

  async function handleSave(key: string) {
    setSaving(key)
    const res = await fetch("/api/super-admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value: editValues[key] ?? "" }),
    })
    if (res.ok) {
      setSaved(key)
      setTimeout(() => setSaved(null), 2000)
      await fetchSettings()
    }
    setSaving(null)
  }

  async function handleExpirePending() {
    setDangerLoading(true)
    await fetch("/api/super-admin/expire-vouchers", { method: "POST" })
    setDangerLoading(false)
    setDangerOpen(false)
    setDangerDone(true)
    setTimeout(() => setDangerDone(false), 3000)
  }

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">System</h1>
        <p className="text-sm text-gray-400 mt-1">
          Manage system settings and perform maintenance operations
        </p>
      </div>

      {/* Settings Table */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">System Settings</h2>
        {loading ? (
          <div className="text-gray-400 py-8 text-center">Loading...</div>
        ) : (
          <div
            className="rounded-xl overflow-hidden"
            style={{ border: "1px solid #1e3a5f" }}
          >
            {settings.length === 0 ? (
              <p className="px-6 py-8 text-center text-gray-500">
                No settings configured yet.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: "#071020" }}>
                    {["Key", "Value", "Actions"].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left font-semibold text-gray-400"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {settings.map((s, idx) => (
                    <tr
                      key={s.id}
                      style={{
                        backgroundColor: idx % 2 === 0 ? "#0d1f3c" : "#0a1a35",
                        borderTop: "1px solid #1e3a5f",
                      }}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-gray-300 whitespace-nowrap">
                        {s.key}
                      </td>
                      <td className="px-4 py-3 w-80">
                        <Input
                          value={editValues[s.key] ?? s.value}
                          onChange={(e) =>
                            setEditValues((prev) => ({ ...prev, [s.key]: e.target.value }))
                          }
                          style={{
                            backgroundColor: "#0a1628",
                            borderColor: "#1e3a5f",
                            color: "#fff",
                            height: "32px",
                            fontSize: "13px",
                          }}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => handleSave(s.key)}
                            disabled={saving === s.key}
                            className="flex items-center gap-1 h-8 px-3 text-xs"
                            style={{ backgroundColor: "#00b4ff", color: "#000" }}
                          >
                            <Save className="w-3 h-3" />
                            {saving === s.key ? "Saving…" : "Save"}
                          </Button>
                          {saved === s.key && (
                            <span className="text-xs" style={{ color: "#22c55e" }}>
                              Saved!
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </section>

      {/* Database Info */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">Database Info</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {dbInfo ? (
            Object.entries(dbInfo).map(([model, count]) => (
              <div
                key={model}
                className="rounded-xl p-4 flex flex-col gap-1"
                style={{ backgroundColor: "#0a1628", border: "1px solid #1e3a5f" }}
              >
                <span className="text-xs text-gray-400 capitalize">{model}</span>
                <span className="text-2xl font-bold text-white">
                  {(count as number).toLocaleString()}
                </span>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-gray-400 text-sm">
              Database info unavailable.
            </div>
          )}
        </div>
      </section>

      {/* Danger Zone */}
      <section>
        <h2 className="text-lg font-semibold mb-4" style={{ color: "#ef4444" }}>
          Danger Zone
        </h2>
        <div
          className="rounded-xl p-6 space-y-4"
          style={{ border: "1px solid #ef4444" }}
        >
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#ef4444" }} />
            <div className="flex-1 space-y-1">
              <p className="font-medium text-white">Expire All Pending Vouchers</p>
              <p className="text-sm text-gray-400">
                Marks all vouchers with PENDING status as EXPIRED. This cannot be
                undone.
              </p>
            </div>
            <Button
              onClick={() => setDangerOpen(true)}
              style={{ backgroundColor: "#ef4444", color: "#fff" }}
              className="flex-shrink-0"
            >
              Run
            </Button>
          </div>
          {dangerDone && (
            <p className="text-sm" style={{ color: "#22c55e" }}>
              All pending vouchers have been expired.
            </p>
          )}
        </div>
      </section>

      {/* Danger Confirmation Dialog */}
      <Dialog open={dangerOpen} onOpenChange={setDangerOpen}>
        <DialogContent
          style={{ backgroundColor: "#0a1628", border: "1px solid #ef4444" }}
          className="text-white max-w-sm"
        >
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" style={{ color: "#ef4444" }} />
              Confirm Danger Action
            </DialogTitle>
          </DialogHeader>
          <p className="text-gray-400 text-sm">
            Are you sure you want to expire all pending vouchers? This action
            cannot be reversed.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDangerOpen(false)}
              style={{ borderColor: "#1e3a5f", color: "#9ca3af" }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleExpirePending}
              disabled={dangerLoading}
              style={{ backgroundColor: "#ef4444", color: "#fff" }}
            >
              {dangerLoading ? "Processing…" : "Expire All Pending"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
