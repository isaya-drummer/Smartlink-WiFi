import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

function requireAdminAuth(role?: string) {
  return role === "ADMIN" || role === "SUPER_ADMIN"
}

export async function GET() {
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role

  if (!requireAdminAuth(role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Total vouchers
  const totalVouchers = await prisma.voucher.count()

  // Active vouchers
  const activeVouchers = await prisma.voucher.count({
    where: { status: "ACTIVE" },
  })

  // Total revenue (sum of successful payments)
  const revenueResult = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: { status: "SUCCESS" },
  })
  const totalRevenue = revenueResult._sum.amount ?? 0

  // Today's revenue
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)
  const todayResult = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: {
      status: "SUCCESS",
      createdAt: { gte: startOfToday },
    },
  })
  const todayRevenue = todayResult._sum.amount ?? 0

  // Total distinct clients (by clientPhone)
  const clientGroups = await prisma.voucher.groupBy({
    by: ["clientPhone"],
  })
  const totalClients = clientGroups.length

  // Revenue by day — last 7 days
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
  sevenDaysAgo.setHours(0, 0, 0, 0)

  const successfulPayments = await prisma.payment.findMany({
    where: {
      status: "SUCCESS",
      createdAt: { gte: sevenDaysAgo },
    },
    select: { amount: true, createdAt: true },
  })

  // Build a map of date -> amount for last 7 days
  const dailyMap: Record<string, number> = {}
  for (let i = 0; i < 7; i++) {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const key = d.toISOString().slice(0, 10)
    dailyMap[key] = 0
  }
  for (const p of successfulPayments) {
    const key = p.createdAt.toISOString().slice(0, 10)
    if (key in dailyMap) {
      dailyMap[key] = (dailyMap[key] ?? 0) + p.amount
    }
  }
  const revenueByDay = Object.entries(dailyMap).map(([date, amount]) => ({
    date,
    amount,
  }))

  // Recent payments (last 10)
  const recentPayments = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      voucher: { select: { clientName: true, clientPhone: true } },
    },
  })

  return NextResponse.json({
    totalVouchers,
    activeVouchers,
    totalRevenue,
    todayRevenue,
    totalClients,
    revenueByDay,
    recentPayments,
  })
}
