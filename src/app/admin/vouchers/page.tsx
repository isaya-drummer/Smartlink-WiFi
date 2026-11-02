"use client"

import { useEffect, useState } from "react"
import { Search, RefreshCw } from "lucide-react"
import StatusBadge from "@/components/admin/StatusBadge"
import { formatDate } from "@/lib/utils"

interface Voucher {
  id: string
  code: string
  clientName: string
  clientPhone: string
  paymentProvider: string
  status: string
  expiresAt: string | null
  bundle: { name: string }
}

const STATUS_OPTIONS = ["", "PENDING", "ACTIVE", "EXPIRED", "USED"]
const PROVIDER_OPTIONS = ["", "YAS", "AIRTEL", "VODACOM", "HALOTEL"]

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("")
  const [providerFilter, setProviderFilter] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    document.title = "Smartlink WiFi — Admin: Vouchers"
  }, [])

  useEffect(() => {
    fetchVouchers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, providerFilter, page])

  async function fetchVouchers() {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: "20" })
    if (statusFilter) params.set("status", statusFilter)
    if (providerFilter) params.set("provider", providerFilter)

    const res = await fetch(`/api/admin/vouchers?${params}`)
    if (res.ok) {
      const data = await res.json()
      setVouchers(data.vouchers)
      setTotalPages(data.pagination.pages)
    }
    setLoading(false)
  }

  function handleFilterChange(
    setter: (v: string) => void,
    value: string
  ) {
    setter(value)
    setPage(1)
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Vouchers</h1>
        <p className="text-sm text-gray-400 mt-1">
          Manage and monitor all WiFi vouchers
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => handleFilterChange(setStatusFilter, e.target.value)}
            className="text-sm rounded-lg px-3 py-2 outline-none"
            style={{
              backgroundColor: "#0a1628",
              border: "1px solid #1e3a5f",
              color: "#fff",
            }}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s || "All Statuses"}
              </option>
            ))}
          </select>
        </div>
        <select
          value={providerFilter}
          onChange={(e) =>
            handleFilterChange(setProviderFilter, e.target.value)
          }
          className="text-sm rounded-lg px-3 py-2 outline-none"
          style={{
            backgroundColor: "#0a1628",
            border: "1px solid #1e3a5f",
            color: "#fff",
          }}
        >
          {PROVIDER_OPTIONS.map((p) => (
            <option key={p} value={p}>
              {p || "All Providers"}
            </option>
          ))}
        </select>
        <button
          onClick={() => fetchVouchers()}
          className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
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
                    {[
                      "Code",
                      "Client",
                      "Phone",
                      "Bundle",
                      "Provider",
                      "Status",
                      "Expires At",
                    ].map((h) => (
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
                  {vouchers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        No vouchers found.
                      </td>
                    </tr>
                  ) : (
                    vouchers.map((v, idx) => (
                      <tr
                        key={v.id}
                        style={{
                          backgroundColor:
                            idx % 2 === 0 ? "#0d1f3c" : "#0a1a35",
                          borderTop: "1px solid #1e3a5f",
                        }}
                      >
                        <td className="px-4 py-3 font-mono text-xs text-white">
                          {v.code}
                        </td>
                        <td className="px-4 py-3 text-white">{v.clientName}</td>
                        <td className="px-4 py-3 text-gray-300">
                          {v.clientPhone}
                        </td>
                        <td className="px-4 py-3 text-white">
                          {v.bundle?.name}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="px-2 py-0.5 rounded text-xs font-semibold"
                            style={{
                              backgroundColor: "rgba(0,180,255,0.15)",
                              color: "#00b4ff",
                            }}
                          >
                            {v.paymentProvider}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={v.status} />
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                          {v.expiresAt ? formatDate(v.expiresAt) : "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm rounded-lg text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-40 transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-gray-400">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 text-sm rounded-lg text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
