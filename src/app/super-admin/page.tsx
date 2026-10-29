import type { Metadata } from "next"
import { DollarSign, Ticket, Users, TrendingUp, ShieldCheck } from "lucide-react"
import StatsCard from "@/components/admin/StatsCard"
import StatusBadge from "@/components/admin/StatusBadge"
import { formatCurrency, formatDate } from "@/lib/utils"
import RevenueChart from "@/components/admin/RevenueChart"

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
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000"
  const res = await fetch(`${baseUrl}/api/super-admin/dashboard`, {
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
      totalAdmins: 0,
      recentAuditLogs: [],
    }
  }
  return res.json()
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
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-white">Super Admin Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">Full system overview and control</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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

      {/* Recent Audit Logs */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: "1px solid #1e3a5f" }}
      >
        <div
          className="px-6 py-4 border-b"
          style={{ backgroundColor: "#0a1628", borderColor: "#1e3a5f" }}
        >
          <h2 className="text-lg font-semibold text-white">Recent Audit Log</h2>
        </div>
        <div className="overflow-x-auto" style={{ backgroundColor: "#0d1f3c" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "#071020" }}>
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
                      backgroundColor: idx % 2 === 0 ? "#0d1f3c" : "#0a1a35",
                      borderTop: "1px solid #1e3a5f",
                    }}
                  >
                    <td className="px-4 py-3 text-white">
                      {log.user?.name ?? log.user?.email ?? "System"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={log.action} label={log.action} />
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
    </div>
  )
}
