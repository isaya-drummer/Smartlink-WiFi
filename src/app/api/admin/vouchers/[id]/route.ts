export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

function requireAdminAuth(role?: string) {
  return role === "ADMIN" || role === "SUPER_ADMIN"
}

const VoucherUpdateSchema = z.object({
  status: z.enum(["PENDING", "ACTIVE", "EXPIRED", "USED"]).optional(),
})

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role

  if (!requireAdminAuth(role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const voucher = await prisma.voucher.findUnique({
    where: { id: params.id },
    include: {
      bundle: true,
      payments: true,
      sessions: true,
    },
  })

  if (!voucher) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json(voucher)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role

  if (!requireAdminAuth(role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = VoucherUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.issues },
      { status: 400 }
    )
  }

  const voucher = await prisma.voucher.update({
    where: { id: params.id },
    data: parsed.data,
  })

  return NextResponse.json(voucher)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role

  if (!requireAdminAuth(role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await prisma.voucher.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
