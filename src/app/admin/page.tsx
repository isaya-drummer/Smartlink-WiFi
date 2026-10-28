import type { Metadata } from "next"
import { DollarSign, Ticket, Users, TrendingUp, Star } from "lucide-react"
import StatsCard from "@/components/admin/StatsCard"
import StatusBadge from "@/components/admin/StatusBadge"
import { formatCurrency, formatDate, maskPhone } from "@/lib/utils"
import RevenueChart from "@/components/admin/RevenueChart"

export const metadata: Metadata = { title: "Dashboard" }

interface DashboardData {
  totalVouchers: number
  activeVouchers: number
  totalRevenue: number
  todayRevenue: number
  totalClients: number
  revenueByDay: { date: string; amount: number }[]
  recentPayments: {
    id: string
    reference: string
    provider: string
    amount: number
    status: string
    createdAt: string
    voucher: { clientName: string; clientPhone: string } | null
  }[]
  avgRating: number
  totalRatings: number
  recentRatings: Array<{
    id: string
    voucherCode: string
    clientPhone: string | null
    bundleName: string | null
    rating: number
    comment: string | null
    createdAt: string
  }>
}

async function getDashboardData(): Promise<DashboardData> {
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000"
  const res = await fetch(`${baseUrl}/api/admin/dashboard`, {
    cache: "no-store",
    headers: { Cookie: "" },
  })
  if (!res.ok) {
    return {
      totalVouchers: 0,
      activeVouchers: 0,
      totalRevenue: 0,
      todayRevenue: 0,
      totalClients: 0,
      revenueByDay: [],
      recentPayments: [],
      avgRating: 0,
      totalRatings: 0,
      recentRatings: [],
    }
  }
  return res.json()
}

export default async function AdminDashboardPage() {
  const data = await getDashboardData()

  const stats = [
    {
      title: "Total Revenue",
      value: formatCurrency(data.totalRevenue),
      icon: DollarSign,
    },
    {
      title: "Active Vouchers",
      value: data.activeVouchers,
      icon: Ticket,
    },
    {
      title: "Total Clients",
      value: data.totalClients,
      icon: Users,
    },
    {
      title: "Today's Revenue",
      value: formatCurrency(data.todayRevenue),
      icon: TrendingUp,
    },
    {
      title: "Avg Rating",
      value: `★ ${data.avgRating || "—"} (${data.totalRatings})`,
      icon: Star,
    },
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">
          Overview of your WiFi hotspot system
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {stats.map((s) => (
          <StatsCard key={s.title} title={s.title} value={s.value} icon={s.icon} />
        ))}
      </div>

      {/* Revenue Chart */}
      <div
        className="rounded-xl p-6"
        style={{ backgroundColor: "#0a1628", border: "1px solid #1e3a5f" }}
      >
        <h2 className="text-lg font-semibold text-white mb-4">
          Revenue — Last 7 Days
        </h2>
        <RevenueChart data={data.revenueByDay} />
      </div>

      {/* Recent Payments */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: "1px solid #1e3a5f" }}
      >
        <div
          className="px-6 py-4 border-b"
          style={{
            backgroundColor: "#0a1628",
            borderColor: "#1e3a5f",
          }}
        >
          <h2 className="text-lg font-semibold text-white">Recent Payments</h2>
        </div>
        <div className="overflow-x-auto" style={{ backgroundColor: "#0d1f3c" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "#071020" }}>
                {["Reference", "Client", "Provider", "Amount", "Status", "Date"].map(
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
              {data.recentPayments.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No payments yet.
                  </td>
                </tr>
              ) : (
                data.recentPayments.map((p, idx) => (
                  <tr
                    key={p.id}
                    style={{
                      backgroundColor: idx % 2 === 0 ? "#0d1f3c" : "#0a1a35",
                      borderTop: "1px solid #1e3a5f",
                    }}
                  >
                    <td className="px-4 py-3 text-white font-mono text-xs">
                      {p.reference.slice(0, 12)}…
                    </td>
                    <td className="px-4 py-3 text-white">
                      {p.voucher?.clientName ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-0.5 rounded text-xs font-semibold"
                        style={{
                          backgroundColor: "rgba(0,180,255,0.15)",
                          color: "#00b4ff",
                        }}
                      >
                        {p.provider}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                      {formatDate(p.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Ratings */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: "1px solid #1e3a5f" }}
      >
        <div
          className="px-6 py-4 border-b"
          style={{
            backgroundColor: "#0a1628",
            borderColor: "#1e3a5f",
          }}
        >
          <h2 className="text-lg font-semibold text-white">Recent Ratings</h2>
        </div>
        <div className="overflow-x-auto" style={{ backgroundColor: "#0d1f3c" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "#071020" }}>
                {["Phone", "Bundle", "Stars", "Comment", "Date"].map((h) => (
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
              {data.recentRatings.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No ratings yet.
                  </td>
                </tr>
              ) : (
                data.recentRatings.map((r, idx) => (
                  <tr
                    key={r.id}
                    style={{
                      backgroundColor: idx % 2 === 0 ? "#0d1f3c" : "#0a1a35",
                      borderTop: "1px solid #1e3a5f",
                    }}
                  >
                    <td className="px-4 py-3 text-white font-mono text-xs">
                      {maskPhone(r.clientPhone ?? "")}
                    </td>
                    <td className="px-4 py-3 text-white">
                      {r.bundleName ?? "—"}
                    </td>
                    <td className="px-4 py-3" style={{ color: "#00b4ff" }}>
                      {"★".repeat(r.rating)}
                      <span className="text-gray-600">{"★".repeat(5 - r.rating)}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {r.comment ? (r.comment.length > 60 ? r.comment.slice(0, 60) + "…" : r.comment) : "—"}
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
    </div>
  )
}
