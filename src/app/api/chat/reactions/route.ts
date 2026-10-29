import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma, withRetry } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

const ReactionSchema = z.object({
  messageId: z.string().min(1),
  emoji: z.string().min(1).max(10),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  const u = session?.user as { id?: string; role?: string } | undefined
  if (!u?.id || (u.role !== "ADMIN" && u.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = ReactionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 })
  }

  const { messageId, emoji } = parsed.data

  const existing = await withRetry(() =>
    prisma.messageReaction.findUnique({
      where: { messageId_userId_emoji: { messageId, userId: u.id!, emoji } },
    })
  )

  if (existing) {
    await withRetry(() =>
      prisma.messageReaction.delete({ where: { id: existing.id } })
    )
    return NextResponse.json({ success: true, data: { action: "removed", emoji } })
  }

  try {
    await withRetry(() =>
      prisma.messageReaction.create({
        data: { messageId, userId: u.id!, emoji },
      })
    )
    return NextResponse.json({ success: true, data: { action: "added", emoji } })
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json({ success: true, data: { action: "added", emoji } })
    }
    throw e
  }
}
