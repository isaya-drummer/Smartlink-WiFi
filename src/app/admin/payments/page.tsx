"use client"

import { useEffect, useState } from "react"
import { RefreshCw } from "lucide-react"
import StatusBadge from "@/components/admin/StatusBadge"
import { formatCurrency, formatDate } from "@/lib/utils"

interface Payment {
  id: string
  reference: string
  provider: string
  phoneNumber: string
  amount: number
  currency: string
  status: string
  createdAt: string
  voucher: { code: string; clientName: string; clientPhone: string } | null
}

const PROVIDER_OPTIONS = ["", "YAS", "AIRTEL", "VODACOM", "HALOTEL"]
const STATUS_OPTIONS = ["", "PENDING", "SUCCESS", "FAILED"]

const PROVIDER_COLORS: Record<string, { bg: string; text: string }> = {
  YAS: { bg: "rgba(255,193,7,0.15)", text: "#ffc107" },
  AIRTEL: { bg: "rgba(229,57,53,0.15)", text: "#e53935" },
  VODACOM: { bg: "rgba(67,160,71,0.15)", text: "#43a047" },
  HALOTEL: { bg: "rgba(30,136,229,0.15)", text: "#1e88e5" },
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [providerFilter, setProviderFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    document.title = "Smartlink WiFi — Admin: Payments"
  }, [])

  useEffect(() => {
    fetchPayments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providerFilter, statusFilter, page])

  async function fetchPayments() {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: "20" })
    if (providerFilter) params.set("provider", providerFilter)
    if (statusFilter) params.set("status", statusFilter)

    const res = await fetch(`/api/admin/payments?${params}`)
    if (res.ok) {
      const data = await res.json()
      setPayments(data.payments)
      setTotalPages(data.pagination.pages)
    }
    setLoading(false)
  }

  function handleFilter(setter: (v: string) => void, value: string) {
    setter(value)
    setPage(1)
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Payments</h1>
        <p className="text-sm text-gray-400 mt-1">
          Track all payment transactions
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={providerFilter}
          onChange={(e) => handleFilter(setProviderFilter, e.target.value)}
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
        <select
          value={statusFilter}
          onChange={(e) => handleFilter(setStatusFilter, e.target.value)}
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
        <button
          onClick={fetchPayments}
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
                      "Reference",
                      "Provider",
                      "Phone",
                      "Amount",
                      "Status",
                      "Date",
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
                  {payments.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        No payments found.
                      </td>
                    </tr>
                  ) : (
                    payments.map((p, idx) => {
                      const providerStyle = PROVIDER_COLORS[p.provider] ?? {
                        bg: "rgba(107,114,128,0.15)",
                        text: "#6b7280",
                      }
                      return (
                        <tr
                          key={p.id}
                          style={{
                            backgroundColor:
                              idx % 2 === 0 ? "#0d1f3c" : "#0a1a35",
                            borderTop: "1px solid #1e3a5f",
                          }}
                        >
                          <td className="px-4 py-3 font-mono text-xs text-white">
                            {p.reference.slice(0, 16)}…
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className="px-2 py-0.5 rounded text-xs font-semibold"
                              style={{
                                backgroundColor: providerStyle.bg,
                                color: providerStyle.text,
                              }}
                            >
                              {p.provider}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-300">
                            {p.phoneNumber}
                          </td>
                          <td className="px-4 py-3 text-white">
                            {formatCurrency(p.amount, p.currency)}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={p.status} />
                          </td>
                          <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                            {formatDate(p.createdAt)}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

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
