import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma, withRetry } from "@/lib/prisma"

function requireAdmin(role?: string) {
  return role === "ADMIN" || role === "SUPER_ADMIN"
}

// ── GET /api/chat/conversations ─────────────────────────────────────────────
export async function GET() {
  const session = await auth()
  const u = session?.user as { id?: string; role?: string } | undefined
  if (!u?.id || !requireAdmin(u.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const participations = await withRetry(() =>
    prisma.conversationParticipant.findMany({
      where: { userId: u.id },
      include: {
        conversation: {
          include: {
            participants: {
              include: { user: { select: { id: true, name: true, role: true } } },
            },
            messages: {
              orderBy: { createdAt: "desc" },
              take: 1,
              include: { sender: { select: { id: true, name: true } } },
            },
          },
        },
      },
      orderBy: { conversation: { updatedAt: "desc" } },
    })
  )

  const items = await Promise.all(
    participations.map(async (p) => {
      const conv = p.conversation
      const lastMsg = conv.messages[0] ?? null

      // unread count: messages after my lastReadAt, not sent by me
      const unreadCount = await withRetry(() =>
        prisma.message.count({
          where: {
            conversationId: conv.id,
            createdAt: { gt: p.lastReadAt },
            senderId: { not: u.id },
            deleted: false,
          },
        })
      )

      return {
        id: conv.id,
        type: conv.type,
        name: conv.name,
        description: conv.description,
        avatarUrl: conv.avatarUrl,
        updatedAt: conv.updatedAt,
        participants: conv.participants.map((cp) => ({
          id: cp.user.id,
          name: cp.user.name,
          role: cp.user.role,
        })),
        lastMessage: lastMsg
          ? {
              id: lastMsg.id,
              content: lastMsg.deleted ? "" : lastMsg.content,
              type: lastMsg.type,
              senderId: lastMsg.senderId,
              senderName: lastMsg.sender.name,
              createdAt: lastMsg.createdAt,
              deleted: lastMsg.deleted,
            }
          : null,
        unreadCount,
      }
    })
  )

  return NextResponse.json({ success: true, data: { items } })
}

// ── POST /api/chat/conversations ────────────────────────────────────────────
const CreateSchema = z.object({
  type: z.enum(["DIRECT", "GROUP"]),
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(300).optional(),
  avatarUrl: z.string().url().optional(),
  participantIds: z.array(z.string()).min(1),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  const u = session?.user as { id?: string; name?: string; role?: string } | undefined
  if (!u?.id || !requireAdmin(u.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = CreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 })
  }

  const { type, name, description, avatarUrl, participantIds } = parsed.data
  const allIds = Array.from(new Set([u.id, ...participantIds]))

  if (type === "DIRECT") {
    if (allIds.length !== 2) {
      return NextResponse.json({ error: "Direct message requires exactly 2 participants" }, { status: 400 })
    }
    // Check if direct conversation already exists between these two users
    const existing = await withRetry(() =>
      prisma.conversation.findFirst({
        where: {
          type: "DIRECT",
          AND: allIds.map((id) => ({
            participants: { some: { userId: id } },
          })),
        },
        include: {
          participants: {
            include: { user: { select: { id: true, name: true, role: true } } },
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: { sender: { select: { id: true, name: true } } },
          },
        },
      })
    )
    if (existing) {
      return NextResponse.json({ success: true, data: existing })
    }
  }

  if (type === "GROUP" && !name) {
    return NextResponse.json({ error: "Group name is required" }, { status: 400 })
  }

  const conv = await withRetry(() =>
    prisma.conversation.create({
      data: {
        type,
        name: type === "GROUP" ? name : null,
        description,
        avatarUrl,
        createdById: u.id,
        participants: {
          create: allIds.map((id) => ({ userId: id })),
        },
      },
      include: {
        participants: {
          include: { user: { select: { id: true, name: true, role: true } } },
        },
      },
    })
  )

  return NextResponse.json({ success: true, data: conv }, { status: 201 })
}
