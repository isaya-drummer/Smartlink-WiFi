import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createAuditLog } from "@/lib/audit"

const upsertSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
})

export async function GET() {
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role

  if (role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const settings = await prisma.systemSettings.findMany({
    orderBy: { key: "asc" },
  })

  return NextResponse.json(settings)
}

export async function PUT(req: NextRequest) {
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role
  const userId = (session?.user as { id?: string } | undefined)?.id

  if (role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = upsertSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { key, value } = parsed.data

  // Get old value for audit log
  const existing = await prisma.systemSettings.findUnique({ where: { key } })
  const oldValue = existing?.value ?? null

  const setting = await prisma.systemSettings.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  })

  // Write audit log
  await createAuditLog(prisma, {
    userId,
    action: "SETTINGS_UPDATED",
    details: JSON.stringify({ key, oldValue, newValue: value }),
    ipAddress: req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? undefined,
  })

  return NextResponse.json(setting)
}
