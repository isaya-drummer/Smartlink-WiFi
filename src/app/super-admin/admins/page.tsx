"use client"

import { useEffect, useState } from "react"
import { Plus, Pencil, UserX } from "lucide-react"
import StatusBadge from "@/components/admin/StatusBadge"
import { formatDate } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Admin {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  createdAt: string
}

const emptyForm = { name: "", email: "", password: "" }

export default function AdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  useEffect(() => {
    document.title = "Smartlink WiFi â€” Super Admin: Admins"
    fetchAdmins()
  }, [])

  async function fetchAdmins() {
    setLoading(true)
    const res = await fetch("/api/super-admin/admins")
    if (res.ok) {
      setAdmins(await res.json())
    }
    setLoading(false)
  }

  function openAdd() {
    setEditingId(null)
    setForm(emptyForm)
    setError("")
    setDialogOpen(true)
  }

  function openEdit(admin: Admin) {
    setEditingId(admin.id)
    setForm({ name: admin.name, email: admin.email, password: "" })
    setError("")
    setDialogOpen(true)
  }

  async function handleSave() {
    setSaving(true)
    setError("")

    const payload: Record<string, unknown> = {
      name: form.name,
      email: form.email,
    }
    if (form.password) payload.password = form.password

    const url = editingId
      ? `/api/super-admin/admins/${editingId}`
      : "/api/super-admin/admins"
    const method = editingId ? "PUT" : "POST"

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      setDialogOpen(false)
      await fetchAdmins()
    } else {
      const data = await res.json()
      setError(data.error ?? "An error occurred")
    }
    setSaving(false)
  }

  function confirmDeactivate(id: string) {
    setConfirmId(id)
    setConfirmOpen(true)
  }

  async function handleDeactivate() {
    if (!confirmId) return
    await fetch(`/api/super-admin/admins/${confirmId}`, { method: "DELETE" })
    setConfirmOpen(false)
    setConfirmId(null)
    await fetchAdmins()
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Admins</h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage admin accounts
          </p>
        </div>
        <Button
          onClick={openAdd}
          className="flex items-center gap-2"
          style={{ backgroundColor: "var(--accent)", color: "var(--bg-primary)" }}
        >
          <Plus className="w-4 h-4" />
          Add Admin
        </Button>
      </div>

      {loading ? (
        <div className="text-gray-400 py-8 text-center">Loading...</div>
      ) : (
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: "1px solid var(--border-color)" }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "var(--bg-tertiary)" }}>
                  {["Name", "Email", "Status", "Created At", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left font-semibold text-gray-400 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {admins.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      No admins found.
                    </td>
                  </tr>
                ) : (
                  admins.map((admin, idx) => (
                    <tr
                      key={admin.id}
                      style={{
                        backgroundColor: idx % 2 === 0 ? "var(--bg-secondary)" : "var(--bg-tertiary)",
                        borderTop: "1px solid var(--border-color)",
                      }}
                    >
                      <td className="px-4 py-3 font-medium text-white">{admin.name}</td>
                      <td className="px-4 py-3 text-gray-300">{admin.email}</td>
                      <td className="px-4 py-3">
                        <StatusBadge
                          status={admin.isActive ? "ACTIVE" : "EXPIRED"}
                          label={admin.isActive ? "Active" : "Inactive"}
                        />
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                        {formatDate(admin.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(admin)}
                            className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          {admin.isActive && (
                            <button
                              onClick={() => confirmDeactivate(admin.id)}
                              className="p-1.5 rounded hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border-color)" }}
          className="text-white max-w-md"
        >
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingId ? "Edit Admin" : "Add Admin"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label className="text-gray-300">Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Full name"
                style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)", color: "#fff" }}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-gray-300">Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="admin@wifi.local"
                style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)", color: "#fff" }}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-gray-300">
                Password {editingId && "(leave blank to keep current)"}
              </Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)", color: "#fff" }}
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              style={{ borderColor: "var(--border-color)", color: "#9ca3af" }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              style={{ backgroundColor: "var(--accent)", color: "var(--bg-primary)" }}
            >
              {saving ? "Savingâ€¦" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deactivate Confirmation */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent
          style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border-color)" }}
          className="text-white max-w-sm"
        >
          <DialogHeader>
            <DialogTitle className="text-white">Deactivate Admin?</DialogTitle>
          </DialogHeader>
          <p className="text-gray-400 text-sm">
            This will prevent the admin from logging in. You can re-enable them
            via the Edit dialog.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              style={{ borderColor: "var(--border-color)", color: "#9ca3af" }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeactivate}
              style={{ backgroundColor: "#ef4444", color: "#fff" }}
            >
              Deactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
