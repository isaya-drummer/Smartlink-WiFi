export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role

  if (role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const [users, bundles, vouchers, payments, auditLogs, sessions] =
    await Promise.all([
      prisma.user.count(),
      prisma.bundle.count(),
      prisma.voucher.count(),
      prisma.payment.count(),
      prisma.auditLog.count(),
      prisma.session.count(),
    ])

  return NextResponse.json({ users, bundles, vouchers, payments, auditLogs, sessions })
}
