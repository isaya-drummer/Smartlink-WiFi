import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

function requireAdminAuth(role?: string) {
  return role === "ADMIN" || role === "SUPER_ADMIN"
}

const ProfileUpdateSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  avatarUrl: z.string().min(1).optional(), // accepts both https:// URLs and data: URLs
})

export async function GET() {
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role

  if (!session?.user || !requireAdminAuth(role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, role: true, avatarUrl: true },
  })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  return NextResponse.json(user)
}

export async function PUT(req: NextRequest) {
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role

  if (!session?.user || !requireAdminAuth(role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = ProfileUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 })
  }

  if (!parsed.data.name && parsed.data.avatarUrl === undefined) {
    return NextResponse.json({ error: "Provide name or avatarUrl." }, { status: 400 })
  }

  const updateData: { name?: string; avatarUrl?: string } = {}
  if (parsed.data.name) updateData.name = parsed.data.name
  if (parsed.data.avatarUrl !== undefined) updateData.avatarUrl = parsed.data.avatarUrl

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: updateData,
    select: { id: true, name: true, email: true, role: true, avatarUrl: true },
  })

  return NextResponse.json(user)
}
