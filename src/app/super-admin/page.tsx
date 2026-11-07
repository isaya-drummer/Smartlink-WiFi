import type { Metadata } from "next"
import { DollarSign, Ticket, Users, TrendingUp, ShieldCheck } from "lucide-react"
import StatsCard from "@/components/admin/StatsCard"
import StatusBadge from "@/components/admin/StatusBadge"
import { formatCurrency, formatDate } from "@/lib/utils"
import RevenueChart from "@/components/admin/RevenueChart"
import DashboardGreeting from "@/components/admin/DashboardGreeting"
import { prisma, withRetry } from "@/lib/prisma"

export const metadata: Metadata = { title: "Dashboard" }

interface AuditLogEntry {
  id: string
  action: string
  details?: string | null
  ipAddress?: string | null
  createdAt: string
  user?: { name: string; email: string } | null
}

interface DashboardData {
  totalVouchers: number
  activeVouchers: number
  totalRevenue: number
  todayRevenue: number
  totalClients: number
  revenueByDay: { date: string; amount: number }[]
  totalAdmins: number
  recentAuditLogs: AuditLogEntry[]
}

async function getDashboardData(): Promise<DashboardData> {
  try {
    const totalVouchers = await prisma.voucher.count()
    const activeVouchers = await prisma.voucher.count({ where: { status: "ACTIVE" } })

    const revenueResult = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "SUCCESS" },
    })
    const totalRevenue = revenueResult._sum.amount ?? 0

    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)
    const todayResult = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "SUCCESS", createdAt: { gte: startOfToday } },
    })
    const todayRevenue = todayResult._sum.amount ?? 0

    const clientGroups = await prisma.voucher.groupBy({ by: ["clientPhone"] })
    const totalClients = clientGroups.length

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
    sevenDaysAgo.setHours(0, 0, 0, 0)

    const successfulPayments = await prisma.payment.findMany({
      where: { status: "SUCCESS", createdAt: { gte: sevenDaysAgo } },
      select: { amount: true, createdAt: true },
    })

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

    const totalAdmins = await prisma.user.count({ where: { role: "ADMIN" } })

    const rawAuditLogs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { user: { select: { name: true, email: true } } },
    })

    const recentAuditLogs = rawAuditLogs.map((log) => ({
      id: log.id,
      action: log.action,
      details: log.details,
      ipAddress: log.ipAddress,
      createdAt: log.createdAt.toISOString(),
      user: log.user,
    }))

    return {
      totalVouchers,
      activeVouchers,
      totalRevenue,
      todayRevenue,
      totalClients,
      revenueByDay,
      totalAdmins,
      recentAuditLogs,
    }
  } catch (err) {
    console.error("Error loading super-admin dashboard data:", err)
    return {
      totalVouchers: 0,
      activeVouchers: 0,
      totalRevenue: 0,
      todayRevenue: 0,
      totalClients: 0,
      revenueByDay: [],
      totalAdmins: 0,
      recentAuditLogs: [],
    }
  }
}

export default async function SuperAdminDashboardPage() {
  const data = await getDashboardData()

  const stats = [
    { title: "Total Revenue", value: formatCurrency(data.totalRevenue), icon: DollarSign },
    { title: "Active Vouchers", value: data.activeVouchers, icon: Ticket },
    { title: "Total Clients", value: data.totalClients, icon: Users },
    { title: "Today's Revenue", value: formatCurrency(data.todayRevenue), icon: TrendingUp },
    { title: "Total Admins", value: data.totalAdmins, icon: ShieldCheck },
  ]

  return (
    <div className="p-4 md:p-6 space-y-5">
      <DashboardGreeting subtitle="Full system overview and control" />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
          Revenue â€” Last 7 Days
        </h2>
        <RevenueChart data={data.revenueByDay} />
      </div>

      {/* Recent Audit Logs */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: "1px solid var(--border-color)" }}
      >
        <div
          className="px-6 py-4 border-b"
          style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-color)" }}
        >
          <h2 className="text-lg font-semibold text-white">Recent Audit Log</h2>
        </div>
        <div className="overflow-x-auto" style={{ backgroundColor: "var(--bg-secondary)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "var(--bg-tertiary)" }}>
                {["User", "Action", "IP Address", "Date"].map((h) => (
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
              {data.recentAuditLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    No audit log entries yet.
                  </td>
                </tr>
              ) : (
                data.recentAuditLogs.map((log, idx) => (
                  <tr
                    key={log.id}
                    style={{
                      backgroundColor: idx % 2 === 0 ? "var(--bg-secondary)" : "var(--bg-tertiary)",
                      borderTop: "1px solid var(--border-color)",
                    }}
                  >
                    <td className="px-4 py-3 text-white">
                      {log.user?.name ?? log.user?.email ?? "System"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={log.action} label={log.action} />
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {log.ipAddress ?? "â€”"}
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
    </div>
  )
}
