import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma, withRetry } from "@/lib/prisma"

function requireAdmin(role?: string) {
  return role === "ADMIN" || role === "SUPER_ADMIN"
}

// ── GET /api/chat/messages?conversationId=&limit=40&before=ISO ──────────────
export async function GET(req: NextRequest) {
  const session = await auth()
  const u = session?.user as { id?: string; role?: string } | undefined
  if (!u?.id || !requireAdmin(u.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const conversationId = searchParams.get("conversationId")
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "40"), 100)
  const before = searchParams.get("before")

  if (!conversationId) {
    return NextResponse.json({ error: "conversationId required" }, { status: 400 })
  }

  // Verify participant
  const participant = await withRetry(() =>
    prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId: u.id! } },
    })
  )
  if (!participant) {
    return NextResponse.json({ error: "Not a participant" }, { status: 403 })
  }

  const messages = await withRetry(() =>
    prisma.message.findMany({
      where: {
        conversationId,
        ...(before ? { createdAt: { lt: new Date(before) } } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      include: {
        sender: { select: { id: true, name: true, role: true } },
        reactions: {
          include: { user: { select: { id: true, name: true } } },
        },
      },
    })
  )

  const hasMore = messages.length > limit
  const items = messages.slice(0, limit).reverse()

  // Update lastReadAt
  await withRetry(() =>
    prisma.conversationParticipant.update({
      where: { conversationId_userId: { conversationId, userId: u.id! } },
      data: { lastReadAt: new Date() },
    })
  )

  return NextResponse.json({ success: true, data: { items, hasMore } })
}

// ── POST /api/chat/messages ─────────────────────────────────────────────────
const SendSchema = z.object({
  conversationId: z.string().min(1),
  content: z.string().min(1).max(5000),
  type: z.enum(["TEXT", "IMAGE", "FILE", "EMOJI"]).default("TEXT"),
  fileName: z.string().optional(),
  fileSize: z.number().int().positive().optional(),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  const u = session?.user as { id?: string; role?: string } | undefined
  if (!u?.id || !requireAdmin(u.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = SendSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 })
  }

  const { conversationId, content, type, fileName, fileSize } = parsed.data

  // Verify participant
  const participant = await withRetry(() =>
    prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId: u.id! } },
    })
  )
  if (!participant) {
    return NextResponse.json({ error: "Not a participant" }, { status: 403 })
  }

  const [message] = await withRetry(() =>
    prisma.$transaction([
      prisma.message.create({
        data: { conversationId, senderId: u.id!, type, content, fileName, fileSize },
        include: {
          sender: { select: { id: true, name: true, role: true } },
          reactions: { include: { user: { select: { id: true, name: true } } } },
        },
      }),
      prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      }),
    ])
  )

  return NextResponse.json({ success: true, data: message }, { status: 201 })
}
