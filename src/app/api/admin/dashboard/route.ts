export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma, withRetry } from "@/lib/prisma"

function requireAdminAuth(role?: string) {
  return role === "ADMIN" || role === "SUPER_ADMIN"
}

export async function GET() {
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role

  if (!requireAdminAuth(role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

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

  // Today's revenue
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

  // Revenue by day — last 7 days
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
    createdAt: r.createdAt,
  }))

  return NextResponse.json({
    totalVouchers,
    activeVouchers,
    totalRevenue,
    todayRevenue,
    totalClients,
    revenueByDay,
    recentPayments,
    avgRating,
    totalRatings,
    recentRatings,
  })
}
