import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createAuditLog } from "@/lib/audit"

export async function POST() {
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role
  const userId = (session?.user as { id?: string } | undefined)?.id

  if (role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const result = await prisma.voucher.updateMany({
    where: { status: "PENDING" },
    data: { status: "EXPIRED" },
  })

  await createAuditLog(prisma, {
    userId,
    action: "EXPIRE_PENDING_VOUCHERS",
    details: JSON.stringify({ count: result.count }),
  })

  return NextResponse.json({ success: true, count: result.count })
}
