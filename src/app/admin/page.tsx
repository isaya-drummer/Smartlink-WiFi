import type { Metadata } from "next"
import { DollarSign, Ticket, Users, TrendingUp, Star } from "lucide-react"
import StatsCard from "@/components/admin/StatsCard"
import StatusBadge from "@/components/admin/StatusBadge"
import { formatCurrency, formatDate, maskPhone } from "@/lib/utils"
import RevenueChart from "@/components/admin/RevenueChart"
import DashboardGreeting from "@/components/admin/DashboardGreeting"
import { prisma, withRetry } from "@/lib/prisma"

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
  try {
    const [
      totalVouchers,
      activeVouchers,
      revenueResult,
      clientGroups,
      successfulPayments,
      recentPayments,
      ratingAgg,
      rawRecentRatings,
    ] = await withRetry(() =>
      Promise.all([
        prisma.voucher.count(),
        prisma.voucher.count({ where: { status: "ACTIVE" } }),
        prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "SUCCESS" } }),
        prisma.voucher.groupBy({ by: ["clientPhone"] }),
        prisma.payment.findMany({
          where: {
            status: "SUCCESS",
            createdAt: { gte: (() => { const d = new Date(); d.setDate(d.getDate() - 6); d.setHours(0,0,0,0); return d })() },
          },
          select: { amount: true, createdAt: true },
        }),
        prisma.payment.findMany({
          orderBy: { createdAt: "desc" },
          take: 10,
          include: { voucher: { select: { clientName: true, clientPhone: true } } },
        }),
        prisma.serviceRating.aggregate({ _avg: { rating: true }, _count: { rating: true } }),
        prisma.serviceRating.findMany({
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            voucher: {
              select: { code: true, clientPhone: true, bundle: { select: { name: true } } },
            },
          },
        }),
      ])
    )

    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)
    const todayResult = await withRetry(() =>
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: "SUCCESS", createdAt: { gte: startOfToday } },
      })
    )

    const totalRevenue = revenueResult._sum.amount ?? 0
    const todayRevenue = todayResult._sum.amount ?? 0
    const totalClients = clientGroups.length

    const dailyMap: Record<string, number> = {}
    for (let i = 0; i < 7; i++) {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      dailyMap[d.toISOString().slice(0, 10)] = 0
    }
    for (const p of successfulPayments) {
      const key = p.createdAt.toISOString().slice(0, 10)
      if (key in dailyMap) dailyMap[key] = (dailyMap[key] ?? 0) + p.amount
    }
    const revenueByDay = Object.entries(dailyMap).map(([date, amount]) => ({ date, amount }))

    const avgRating = Math.round((ratingAgg._avg.rating ?? 0) * 10) / 10
    const totalRatings = ratingAgg._count.rating

    const recentRatings = rawRecentRatings.map((r) => ({
      id: r.id,
      voucherCode: r.voucher.code,
      clientPhone: r.voucher.clientPhone,
      bundleName: r.voucher.bundle?.name ?? null,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt.toISOString(),
    }))

    return {
      totalVouchers,
      activeVouchers,
      totalRevenue,
      todayRevenue,
      totalClients,
      revenueByDay,
      recentPayments: recentPayments.map((p) => ({
        id: p.id,
        reference: p.reference,
        provider: p.provider,
        amount: p.amount,
        status: p.status,
        createdAt: p.createdAt.toISOString(),
        voucher: p.voucher,
      })),
      avgRating,
      totalRatings,
      recentRatings,
    }
  } catch (err) {
    console.error("Error loading admin dashboard data:", err)
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
    <div className="p-4 md:p-6 space-y-5">
      <DashboardGreeting subtitle="Overview of your WiFi hotspot system" />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        {stats.map((s) => (
          <StatsCard key={s.title} title={s.title} value={s.value} icon={s.icon} />
        ))}
      </div>

      {/* Revenue Chart */}
      <div
        className="rounded-xl p-6"
      style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border-color)" }}
      >
        <h2 className="text-lg font-semibold text-white mb-4">
          Revenue — Last 7 Days
        </h2>
        <RevenueChart data={data.revenueByDay} />
      </div>

      {/* Recent Payments */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: "1px solid var(--border-color)" }}
      >
        <div
          className="px-6 py-4 border-b"
          style={{
            backgroundColor: "var(--bg-primary)",
            borderColor: "var(--border-color)",
          }}
        >
          <h2 className="text-lg font-semibold text-white">Recent Payments</h2>
        </div>
        <div className="overflow-x-auto" style={{ backgroundColor: "var(--bg-secondary)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "var(--bg-tertiary)" }}>
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
                      backgroundColor: idx % 2 === 0 ? "var(--bg-secondary)" : "#0a1a35",
                      borderTop: "1px solid var(--border-color)",
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
        style={{ border: "1px solid var(--border-color)" }}
      >
        <div
          className="px-6 py-4 border-b"
          style={{
            backgroundColor: "var(--bg-primary)",
            borderColor: "var(--border-color)",
          }}
        >
          <h2 className="text-lg font-semibold text-white">Recent Ratings</h2>
        </div>
        <div className="overflow-x-auto" style={{ backgroundColor: "var(--bg-secondary)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "var(--bg-tertiary)" }}>
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
                      backgroundColor: idx % 2 === 0 ? "var(--bg-secondary)" : "#0a1a35",
                      borderTop: "1px solid var(--border-color)",
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
