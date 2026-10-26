"use client"

import { useEffect, useState } from "react"
import type { Metadata } from "next"
import { Plus, Pencil, Trash2 } from "lucide-react"
import StatusBadge from "@/components/admin/StatusBadge"
import { formatCurrency, formatDuration, formatDataLimit } from "@/lib/utils"
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

// Note: metadata must be exported from a server component.
// Since this is a client page, the title is set via document.title below.

interface Bundle {
  id: string
  name: string
  description?: string
  price: number
  currency: string
  durationHours: number
  dataLimitMB: number
  isActive: boolean
  _count?: { vouchers: number }
}

const emptyForm = {
  name: "",
  description: "",
  price: "",
  currency: "TZS",
  durationHours: "",
  dataLimitMB: "",
  isActive: true,
}

export default function BundlesPage() {
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  useEffect(() => {
    document.title = "SmartLink Digital — Admin: Bundles"
    fetchBundles()
  }, [])

  async function fetchBundles() {
    setLoading(true)
    const res = await fetch("/api/admin/bundles")
    if (res.ok) {
      const data = await res.json()
      setBundles(data)
    }
    setLoading(false)
  }

  function openAdd() {
    setEditingId(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  function openEdit(bundle: Bundle) {
    setEditingId(bundle.id)
    setForm({
      name: bundle.name,
      description: bundle.description ?? "",
      price: String(bundle.price),
      currency: bundle.currency,
      durationHours: String(bundle.durationHours),
      dataLimitMB: String(bundle.dataLimitMB),
      isActive: bundle.isActive,
    })
    setDialogOpen(true)
  }

  async function handleSave() {
    setSaving(true)
    const payload = {
      name: form.name,
      description: form.description || undefined,
      price: parseFloat(form.price),
      currency: form.currency,
      durationHours: parseInt(form.durationHours),
      dataLimitMB: parseInt(form.dataLimitMB),
      isActive: form.isActive,
    }

    const url = editingId
      ? `/api/admin/bundles/${editingId}`
      : "/api/admin/bundles"
    const method = editingId ? "PUT" : "POST"

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      setDialogOpen(false)
      await fetchBundles()
    }
    setSaving(false)
  }

  function confirmDelete(id: string) {
    setDeleteId(id)
    setConfirmOpen(true)
  }

  async function handleDelete() {
    if (!deleteId) return
    await fetch(`/api/admin/bundles/${deleteId}`, { method: "DELETE" })
    setConfirmOpen(false)
    setDeleteId(null)
    await fetchBundles()
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Bundles</h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage your WiFi bundle packages
          </p>
        </div>
        <Button
          onClick={openAdd}
          className="flex items-center gap-2"
          style={{ backgroundColor: "#00b4ff", color: "#000" }}
        >
          <Plus className="w-4 h-4" />
          Add Bundle
        </Button>
      </div>

      {loading ? (
        <div className="text-gray-400 py-8 text-center">Loading...</div>
      ) : (
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: "1px solid #1e3a5f" }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "#071020" }}>
                  {["Name", "Price", "Duration", "Data", "Vouchers", "Status", "Actions"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left font-semibold text-gray-400 whitespace-nowrap"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {bundles.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      No bundles found.
                    </td>
                  </tr>
                ) : (
                  bundles.map((b, idx) => (
                    <tr
                      key={b.id}
                      style={{
                        backgroundColor:
                          idx % 2 === 0 ? "#0d1f3c" : "#0a1a35",
                        borderTop: "1px solid #1e3a5f",
                      }}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-white">{b.name}</div>
                        {b.description && (
                          <div className="text-xs text-gray-400">
                            {b.description}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-white">
                        {formatCurrency(b.price, b.currency)}
                      </td>
                      <td className="px-4 py-3 text-white">
                        {formatDuration(b.durationHours)}
                      </td>
                      <td className="px-4 py-3 text-white">
                        {formatDataLimit(b.dataLimitMB)}
                      </td>
                      <td className="px-4 py-3 text-white">
                        {b._count?.vouchers ?? 0}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge
                          status={b.isActive ? "ACTIVE" : "EXPIRED"}
                          label={b.isActive ? "Active" : "Inactive"}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(b)}
                            className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => confirmDelete(b.id)}
                            className="p-1.5 rounded hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
          style={{ backgroundColor: "#0a1628", border: "1px solid #1e3a5f" }}
          className="text-white max-w-md"
        >
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingId ? "Edit Bundle" : "Add Bundle"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label className="text-gray-300">Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Hourly"
                style={{ backgroundColor: "#0d1f3c", borderColor: "#1e3a5f", color: "#fff" }}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-gray-300">Description</Label>
              <Input
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Optional description"
                style={{ backgroundColor: "#0d1f3c", borderColor: "#1e3a5f", color: "#fff" }}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-gray-300">Price</Label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) =>
                    setForm({ ...form, price: e.target.value })
                  }
                  placeholder="500"
                  style={{ backgroundColor: "#0d1f3c", borderColor: "#1e3a5f", color: "#fff" }}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-gray-300">Currency</Label>
                <Input
                  value={form.currency}
                  onChange={(e) =>
                    setForm({ ...form, currency: e.target.value })
                  }
                  placeholder="TZS"
                  style={{ backgroundColor: "#0d1f3c", borderColor: "#1e3a5f", color: "#fff" }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-gray-300">Duration (hours)</Label>
                <Input
                  type="number"
                  value={form.durationHours}
                  onChange={(e) =>
                    setForm({ ...form, durationHours: e.target.value })
                  }
                  placeholder="1"
                  style={{ backgroundColor: "#0d1f3c", borderColor: "#1e3a5f", color: "#fff" }}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-gray-300">Data (MB)</Label>
                <Input
                  type="number"
                  value={form.dataLimitMB}
                  onChange={(e) =>
                    setForm({ ...form, dataLimitMB: e.target.value })
                  }
                  placeholder="500"
                  style={{ backgroundColor: "#0d1f3c", borderColor: "#1e3a5f", color: "#fff" }}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={form.isActive}
                onChange={(e) =>
                  setForm({ ...form, isActive: e.target.checked })
                }
                className="w-4 h-4"
              />
              <Label htmlFor="isActive" className="text-gray-300">
                Active
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              style={{ borderColor: "#1e3a5f", color: "#9ca3af" }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              style={{ backgroundColor: "#00b4ff", color: "#000" }}
            >
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent
          style={{ backgroundColor: "#0a1628", border: "1px solid #1e3a5f" }}
          className="text-white max-w-sm"
        >
          <DialogHeader>
            <DialogTitle className="text-white">Deactivate Bundle?</DialogTitle>
          </DialogHeader>
          <p className="text-gray-400 text-sm">
            This will set the bundle as inactive. Existing vouchers won&apos;t be
            affected.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              style={{ borderColor: "#1e3a5f", color: "#9ca3af" }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
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
