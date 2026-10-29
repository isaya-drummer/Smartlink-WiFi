import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { Prisma } from "@prisma/client"

const RatingSchema = z.object({
  voucherCode: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(300).optional(),
})

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const ref = searchParams.get("ref")

  if (!ref) {
    return NextResponse.json(
      { canRate: false, alreadyRated: false, bundleName: null },
      { status: 400 }
    )
  }

  const voucher = await prisma.voucher.findUnique({
    where: { code: ref },
    include: { bundle: { select: { name: true } } },
  })

  if (!voucher) {
    return NextResponse.json({ canRate: false, alreadyRated: false, bundleName: null })
  }

  const existing = await prisma.serviceRating.findUnique({
    where: { voucherId: voucher.id },
  })
  const alreadyRated = !!existing

  return NextResponse.json({
    canRate: !alreadyRated,
    alreadyRated,
    bundleName: voucher.bundle?.name ?? null,
  })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = RatingSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.issues },
      { status: 400 }
    )
  }

  const { voucherCode, rating, comment } = parsed.data

  const voucher = await prisma.voucher.findUnique({ where: { code: voucherCode } })
  if (!voucher) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 })
  }

  const existing = await prisma.serviceRating.findUnique({
    where: { voucherId: voucher.id },
  })
  if (existing) {
    return NextResponse.json({ error: "Already rated" }, { status: 409 })
  }

  try {
    await prisma.serviceRating.create({
      data: { voucherId: voucher.id, rating, comment },
    })
  } catch (e) {
    // Handle concurrent duplicate submissions — DB unique constraint violation
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json({ error: "Already rated" }, { status: 409 })
    }
    throw e
  }

  return NextResponse.json({ success: true })
}
