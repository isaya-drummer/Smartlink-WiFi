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

  const since = new Date()
  since.setDate(since.getDate() - 7)

  const [payments, activeVouchers] = await withRetry(() =>
    Promise.all([
      prisma.payment.findMany({
        where: { createdAt: { gte: since } },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          voucher: { select: { clientName: true, clientPhone: true } },
        },
      }),
      prisma.voucher.findMany({
        where: { status: "ACTIVE" },
        orderBy: { activatedAt: "desc" },
        take: 20,
        select: {
          id: true,
          code: true,
          clientName: true,
          clientPhone: true,
          activatedAt: true,
          expiresAt: true,
          createdAt: true,
          bundle: { select: { name: true } },
        },
      }),
    ])
  )

  const transactions = payments.map((p) => ({
    id: p.id,
    type: "transaction" as const,
    title:
      p.status === "SUCCESS"
        ? `Payment received from ${p.voucher?.clientName || p.phoneNumber}`
        : p.status === "FAILED"
          ? `Payment failed for ${p.voucher?.clientName || p.phoneNumber}`
          : `Payment pending for ${p.voucher?.clientName || p.phoneNumber}`,
    detail: `${p.provider} · ${p.currency} ${p.amount.toLocaleString()} · ${p.status}`,
    href: "/admin/payments",
    createdAt: p.createdAt.toISOString(),
    status: p.status,
  }))

  const activeClients = activeVouchers.map((v) => ({
    id: v.id,
    type: "active_client" as const,
    title: `${v.clientName || "Client"} is currently online`,
    detail: `${v.bundle?.name ?? "Bundle"} · ${v.clientPhone}`,
    href: "/admin/clients",
    createdAt: (v.activatedAt ?? v.createdAt).toISOString(),
    expiresAt: v.expiresAt?.toISOString() ?? null,
  }))

  return NextResponse.json({
    transactions,
    activeClients,
    counts: {
      transactions: transactions.length,
      activeClients: activeClients.length,
    },
  })
}
