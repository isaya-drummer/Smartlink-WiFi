"use client"

import { useEffect, useState, useCallback } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"

interface AuditLogEntry {
  id: string
  action: string
  details?: string | null
  ipAddress?: string | null
  createdAt: string
  user?: { name: string; email: string } | null
}

interface AuditResponse {
  logs: AuditLogEntry[]
  total: number
  page: number
  totalPages: number
}

export default function AuditPage() {
  const [data, setData] = useState<AuditResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [actionFilter, setActionFilter] = useState("")

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page) })
    if (actionFilter) params.set("action", actionFilter)

    const res = await fetch(`/api/super-admin/audit?${params}`)
    if (res.ok) {
      setData(await res.json())
    }
    setLoading(false)
  }, [page, actionFilter])

  useEffect(() => {
    document.title = "Smartlink WiFi — Super Admin: Audit Log"
    fetchLogs()
  }, [fetchLogs])

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Audit Log</h1>
        <p className="text-sm text-gray-400 mt-1">
          Track all admin and system actions
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(1) }}
          placeholder="Filter by action…"
          className="px-3 py-2 text-sm rounded-lg outline-none focus:ring-2 w-56"
          style={{
            backgroundColor: "#0a1628",
            border: "1px solid #1e3a5f",
            color: "#fff",
          }}
        />
        <Button
          variant="outline"
          onClick={() => { setActionFilter(""); setPage(1) }}
          style={{ borderColor: "#1e3a5f", color: "#9ca3af" }}
          className="text-sm"
        >
          Clear
        </Button>
      </div>

      {loading ? (
        <div className="text-gray-400 py-8 text-center">Loading...</div>
      ) : (
        <>
          <div
            className="rounded-xl overflow-hidden"
            style={{ border: "1px solid #1e3a5f" }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: "#071020" }}>
                    {["User", "Action", "Details", "IP Address", "Date"].map((h) => (
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
                  {!data || data.logs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                        No audit log entries found.
                      </td>
                    </tr>
                  ) : (
                    data.logs.map((log, idx) => (
                      <tr
                        key={log.id}
                        style={{
                          backgroundColor: idx % 2 === 0 ? "#0d1f3c" : "#0a1a35",
                          borderTop: "1px solid #1e3a5f",
                        }}
                      >
                        <td className="px-4 py-3 text-white">
                          {log.user?.name ?? log.user?.email ?? "System"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="px-2 py-0.5 rounded text-xs font-semibold"
                            style={{
                              backgroundColor: "rgba(0,180,255,0.12)",
                              color: "#00b4ff",
                            }}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td
                          className="px-4 py-3 text-gray-400 text-xs max-w-xs truncate"
                          title={log.details ?? ""}
                        >
                          {log.details
                            ? log.details.length > 60
                              ? log.details.slice(0, 60) + "…"
                              : log.details
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs">
                          {log.ipAddress ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                          {formatDate(log.createdAt)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">
                Page {data.page} of {data.totalPages} ({data.total} entries)
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{ borderColor: "#1e3a5f", color: "#9ca3af" }}
                  className="flex items-center gap-1 text-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                  disabled={page >= data.totalPages}
                  style={{ borderColor: "#1e3a5f", color: "#9ca3af" }}
                  className="flex items-center gap-1 text-sm"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
