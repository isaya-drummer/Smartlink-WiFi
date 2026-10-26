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

  // Group vouchers by clientPhone to aggregate client data
  const groups = await prisma.voucher.groupBy({
    by: ["clientPhone", "clientName"],
    _count: { id: true },
    _sum: { amount: true },
    _max: { createdAt: true },
    orderBy: { _max: { createdAt: "desc" } },
  })

  const clients = groups.map((g) => ({
    clientName: g.clientName,
    clientPhone: g.clientPhone,
    totalPurchases: g._count.id,
    totalSpent: g._sum.amount ?? 0,
    lastSeen: g._max.createdAt,
  }))

  return NextResponse.json(clients)
}
