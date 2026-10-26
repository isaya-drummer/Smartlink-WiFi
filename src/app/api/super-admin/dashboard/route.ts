import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role

  if (role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Reuse admin dashboard data
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

  // Revenue by day (last 7)
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

  // Super-admin extras
  const totalAdmins = await prisma.user.count({ where: { role: "ADMIN" } })

  const recentAuditLogs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { user: { select: { name: true, email: true } } },
  })

  return NextResponse.json({
    totalVouchers,
    activeVouchers,
    totalRevenue,
    todayRevenue,
    totalClients,
    revenueByDay,
    totalAdmins,
    recentAuditLogs,
  })
}
