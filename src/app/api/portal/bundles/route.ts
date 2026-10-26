import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/portal/bundles
 * Returns all active bundles ordered by price ascending.
 * No authentication required (public captive portal endpoint).
 */
export async function GET() {
  try {
    const bundles = await prisma.bundle.findMany({
      where: { isActive: true },
      orderBy: { price: "asc" },
    })
    return NextResponse.json(bundles)
  } catch (error) {
    console.error("[GET /api/portal/bundles] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch bundles" },
      { status: 500 }
    )
  }
}
