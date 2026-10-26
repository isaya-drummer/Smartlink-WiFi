import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role

  if (role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId") ?? undefined
  const action = searchParams.get("action") ?? undefined
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10))
  const pageSize = 20

  const where: Record<string, unknown> = {}
  if (userId) where.userId = userId
  if (action) where.action = { contains: action }

  const [total, logs] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        user: { select: { name: true, email: true } },
      },
    }),
  ])

  return NextResponse.json({
    logs,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  })
}
