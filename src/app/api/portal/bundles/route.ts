export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server"
import { prisma, withRetry } from "@/lib/prisma"

export async function GET() {
  try {
    const bundles = await withRetry(() =>
      prisma.bundle.findMany({
        where: { isActive: true },
        orderBy: { price: "asc" },
      })
    )
    return NextResponse.json(bundles)
  } catch (error) {
    console.error("[GET /api/portal/bundles] Error:", error)
    return NextResponse.json({ error: "Failed to fetch bundles" }, { status: 500 })
  }
}
