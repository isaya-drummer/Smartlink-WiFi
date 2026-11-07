"use client"

import { useEffect, useState, useCallback } from "react"
import { maskPhone, formatDate } from "@/lib/utils"

interface RatingEntry {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  voucher: {
    code: string
    clientPhone: string
    clientName: string
    paymentProvider: string
    bundle: { name: string } | null
  }
}

interface Stats {
  total: number
  average: number
  distribution: Record<number, number>
}

interface RatingsData {
  ratings: RatingEntry[]
  stats: Stats
}

interface Filters {
  rating: string
  dateFrom: string
  dateTo: string
}

export default function RatingsPage() {
  const [data, setData] = useState<RatingsData>({
    ratings: [],
    stats: { total: 0, average: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
  })
  const [filters, setFilters] = useState<Filters>({ rating: "", dateFrom: "", dateTo: "" })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = "Smartlink WiFi â€” Super Admin: Ratings"
  }, [])

  const fetchRatings = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filters.rating) params.set("rating", filters.rating)
    if (filters.dateFrom) params.set("dateFrom", filters.dateFrom)
    if (filters.dateTo) params.set("dateTo", filters.dateTo)
    const qs = params.toString()
    const res = await fetch(`/api/super-admin/ratings${qs ? `?${qs}` : ""}`)
    if (res.ok) {
      setData(await res.json())
    }
    setLoading(false)
  }, [filters])

  useEffect(() => {
    fetchRatings()
  }, [fetchRatings])

  const maxDistCount = Math.max(1, ...Object.values(data.stats.distribution))

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Service Ratings</h1>
        <p className="text-sm text-gray-400 mt-1">Customer feedback on WiFi sessions</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total */}
        <div
          className="rounded-xl p-5"
          style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border-color)" }}
        >
          <p className="text-sm text-gray-400">Total Ratings</p>
          <p className="text-3xl font-bold text-white mt-1">{data.stats.total}</p>
        </div>

        {/* Average */}
        <div
          className="rounded-xl p-5"
          style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border-color)" }}
        >
          <p className="text-sm text-gray-400">Average Rating</p>
          <p className="text-3xl font-bold mt-1" style={{ color: "var(--accent)" }}>
            {data.stats.average > 0 ? `${data.stats.average} â˜…` : "â€”"}
          </p>
        </div>

        {/* Distribution */}
        <div
          className="rounded-xl p-5"
          style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border-color)" }}
        >
          <p className="text-sm text-gray-400 mb-3">Distribution</p>
          <div className="space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = data.stats.distribution[star] ?? 0
              const pct = maxDistCount > 0 ? (count / maxDistCount) * 100 : 0
              return (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="w-4 text-right text-gray-400">{star}</span>
                  <span style={{ color: "var(--accent)" }}>â˜…</span>
                  <div
                    className="flex-1 rounded-full h-2"
                    style={{ backgroundColor: "var(--border-color)" }}
                  >
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{ backgroundColor: "var(--accent)", width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-6 text-right text-gray-400">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div
        className="rounded-xl p-4 flex flex-wrap items-center gap-3"
        style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border-color)" }}
      >
        <select
          value={filters.rating}
          onChange={(e) => setFilters((f) => ({ ...f, rating: e.target.value }))}
          className="px-3 py-2 rounded-lg text-sm outline-none"
          style={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-color)",
            color: "#fff",
          }}
        >
          <option value="">All Stars</option>
          {[5, 4, 3, 2, 1].map((s) => (
            <option key={s} value={String(s)}>
              {s} Star{s > 1 ? "s" : ""}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))}
          className="px-3 py-2 rounded-lg text-sm outline-none"
          style={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-color)",
            color: "#fff",
            colorScheme: "dark",
          }}
        />
        <span className="text-gray-400 text-sm">to</span>
        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))}
          className="px-3 py-2 rounded-lg text-sm outline-none"
          style={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-color)",
            color: "#fff",
            colorScheme: "dark",
          }}
        />

        {(filters.rating || filters.dateFrom || filters.dateTo) && (
          <button
            onClick={() => setFilters({ rating: "", dateFrom: "", dateTo: "" })}
            className="px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white transition-colors"
            style={{ border: "1px solid var(--border-color)" }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-gray-400 py-8 text-center">Loadingâ€¦</div>
      ) : (
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: "1px solid var(--border-color)" }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "var(--bg-tertiary)" }}>
                  {["Voucher Code", "Client Phone", "Bundle", "Provider", "Stars", "Comment", "Date"].map(
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
                {data.ratings.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      No ratings found.
                    </td>
                  </tr>
                ) : (
                  data.ratings.map((r, idx) => (
                    <tr
                      key={r.id}
                      style={{
                        backgroundColor: idx % 2 === 0 ? "var(--bg-secondary)" : "var(--bg-tertiary)",
                        borderTop: "1px solid var(--border-color)",
                      }}
                    >
                      <td className="px-4 py-3 text-white font-mono text-xs">
                        {r.voucher.code}
                      </td>
                      <td className="px-4 py-3 text-white font-mono text-xs">
                        {maskPhone(r.voucher.clientPhone)}
                      </td>
                      <td className="px-4 py-3 text-white">
                        {r.voucher.bundle?.name ?? "â€”"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="px-2 py-0.5 rounded text-xs font-semibold"
                          style={{
                            backgroundColor: "var(--accent-dim)",
                            color: "var(--accent)",
                          }}
                        >
                          {r.voucher.paymentProvider}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span style={{ color: "var(--accent)" }}>
                          {"â˜…".repeat(r.rating)}
                        </span>
                        <span className="text-gray-600">
                          {"â˜…".repeat(5 - r.rating)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-300">
                        {r.comment
                          ? r.comment.length > 60
                            ? r.comment.slice(0, 60) + "â€¦"
                            : r.comment
                          : "â€”"}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                        {formatDate(r.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
