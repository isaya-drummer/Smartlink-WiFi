export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

function requireAdminAuth(role?: string) {
  return role === "ADMIN" || role === "SUPER_ADMIN"
}

function parseRange(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get("type") ?? "summary"
  const fromParam = searchParams.get("from")
  const toParam = searchParams.get("to")

  const to = toParam ? new Date(`${toParam}T23:59:59.999`) : new Date()
  const from = fromParam
    ? new Date(`${fromParam}T00:00:00.000`)
    : new Date(to.getTime() - 29 * 24 * 60 * 60 * 1000)

  return { type, from, to }
}

export async function GET(req: NextRequest) {
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role

  if (!requireAdminAuth(role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { type, from, to } = parseRange(req)
  const generatedBy = session?.user?.name ?? session?.user?.email ?? "Admin"
  const generatedAt = new Date().toISOString()

  if (type === "payments") {
    const rows = await prisma.payment.findMany({
      where: { createdAt: { gte: from, lte: to } },
      orderBy: { createdAt: "desc" },
      take: 2000,
      include: {
        voucher: { select: { code: true, clientName: true, clientPhone: true } },
      },
    })

    return NextResponse.json({
      type,
      from: from.toISOString(),
      to: to.toISOString(),
      generatedAt,
      generatedBy,
      title: "Payments Report",
      columns: ["Reference", "Client", "Phone", "Provider", "Amount", "Status", "Date"],
      rows: rows.map((p) => [
        p.reference,
        p.voucher?.clientName ?? "—",
        p.phoneNumber,
        p.provider,
        `${p.currency} ${p.amount.toLocaleString()}`,
        p.status,
        p.createdAt.toISOString(),
      ]),
    })
  }

  if (type === "vouchers") {
    const rows = await prisma.voucher.findMany({
      where: { createdAt: { gte: from, lte: to } },
      orderBy: { createdAt: "desc" },
      take: 2000,
      include: { bundle: { select: { name: true } } },
    })

    return NextResponse.json({
      type,
      from: from.toISOString(),
      to: to.toISOString(),
      generatedAt,
      generatedBy,
      title: "Vouchers Report",
      columns: ["Code", "Client", "Phone", "Bundle", "Amount", "Status", "Created"],
      rows: rows.map((v) => [
        v.code,
        v.clientName,
        v.clientPhone,
        v.bundle?.name ?? "—",
        `TZS ${v.amount.toLocaleString()}`,
        v.status,
        v.createdAt.toISOString(),
      ]),
    })
  }

  if (type === "clients") {
    const groups = await prisma.voucher.groupBy({
      by: ["clientPhone", "clientName"],
      where: { createdAt: { gte: from, lte: to } },
      _count: { id: true },
      _sum: { amount: true },
      _max: { createdAt: true },
      orderBy: { _max: { createdAt: "desc" } },
    })

    return NextResponse.json({
      type,
      from: from.toISOString(),
      to: to.toISOString(),
      generatedAt,
      generatedBy,
      title: "Clients Report",
      columns: ["Client", "Phone", "Purchases", "Total Spent", "Last Seen"],
      rows: groups.map((g) => [
        g.clientName,
        g.clientPhone,
        String(g._count.id),
        `TZS ${(g._sum.amount ?? 0).toLocaleString()}`,
        g._max.createdAt?.toISOString() ?? "—",
      ]),
    })
  }

  const [payments, vouchers, activeVouchers, revenue] = await Promise.all([
    prisma.payment.count({ where: { createdAt: { gte: from, lte: to } } }),
    prisma.voucher.count({ where: { createdAt: { gte: from, lte: to } } }),
    prisma.voucher.count({ where: { status: "ACTIVE" } }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "SUCCESS", createdAt: { gte: from, lte: to } },
    }),
  ])

  const byProvider = await prisma.payment.groupBy({
    by: ["provider"],
    where: { status: "SUCCESS", createdAt: { gte: from, lte: to } },
    _sum: { amount: true },
    _count: { id: true },
  })

  return NextResponse.json({
    type: "summary",
    from: from.toISOString(),
    to: to.toISOString(),
    generatedAt,
    generatedBy,
    title: "System Summary Report",
    columns: ["Metric", "Value"],
    rows: [
      ["Successful revenue", `TZS ${(revenue._sum.amount ?? 0).toLocaleString()}`],
      ["Payments in range", String(payments)],
      ["Vouchers issued", String(vouchers)],
      ["Active clients now", String(activeVouchers)],
      ...byProvider.map((p) => [
        `${p.provider} revenue`,
        `TZS ${(p._sum.amount ?? 0).toLocaleString()} (${p._count.id} payments)`,
      ]),
    ],
  })
}
