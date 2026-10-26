import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

function requireAdminAuth(role?: string) {
  return role === "ADMIN" || role === "SUPER_ADMIN"
}

export async function GET(req: NextRequest) {
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role

  if (!requireAdminAuth(role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"))
  const limit = Math.min(100, parseInt(searchParams.get("limit") ?? "20"))
  const provider = searchParams.get("provider")
  const status = searchParams.get("status")

  const where: Prisma.PaymentWhereInput = {
    ...(provider ? { provider: provider as Prisma.EnumPaymentProviderFilter["equals"] } : {}),
    ...(status ? { status: status as Prisma.EnumPaymentStatusFilter["equals"] } : {}),
  }

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        voucher: { select: { code: true, clientName: true, clientPhone: true } },
      },
    }),
    prisma.payment.count({ where }),
  ])

  return NextResponse.json({
    payments,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  })
}
