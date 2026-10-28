import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role

  if (role !== "SUPER_ADMIN") {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const ratingParam = searchParams.get("rating")
  const dateFrom = searchParams.get("dateFrom")
  const dateTo = searchParams.get("dateTo")

  // Build where clause
  type WhereClause = {
    rating?: number
    createdAt?: { gte?: Date; lte?: Date }
  }
  const where: WhereClause = {}

  if (ratingParam) {
    where.rating = Number(ratingParam)
  }

  const createdAt: { gte?: Date; lte?: Date } = {}
  if (dateFrom) createdAt.gte = new Date(dateFrom)
  if (dateTo) createdAt.lte = new Date(dateTo)
  if (createdAt.gte || createdAt.lte) where.createdAt = createdAt

  const ratings = await prisma.serviceRating.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      voucher: {
        select: {
          code: true,
          clientPhone: true,
          clientName: true,
          paymentProvider: true,
          bundle: { select: { name: true } },
        },
      },
    },
  })

  const total = await prisma.serviceRating.count({ where })

  const aggResult = await prisma.serviceRating.aggregate({
    _avg: { rating: true },
    where,
  })
  const average = Math.round((aggResult._avg.rating ?? 0) * 10) / 10

  const groupResult = await prisma.serviceRating.groupBy({
    by: ["rating"],
    _count: { _all: true },
    where,
  })
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  for (const g of groupResult) {
    distribution[g.rating] = g._count._all
  }

  return NextResponse.json({
    ratings,
    stats: { total, average, distribution },
  })
}
