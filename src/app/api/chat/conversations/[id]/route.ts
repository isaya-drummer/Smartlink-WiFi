export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma, withRetry } from "@/lib/prisma"

const UpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(300).optional(),
  avatarUrl: z.string().url().optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  const u = session?.user as { id?: string; role?: string } | undefined
  if (!u?.id || (u.role !== "ADMIN" && u.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Verify participant
  const participant = await withRetry(() =>
    prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId: params.id, userId: u.id! } },
    })
  )
  if (!participant) {
    return NextResponse.json({ error: "Not a participant" }, { status: 403 })
  }

  const body = await req.json()
  const parsed = UpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 })
  }

  const updated = await withRetry(() =>
    prisma.conversation.update({
      where: { id: params.id },
      data: { ...parsed.data, updatedAt: new Date() },
      include: {
        participants: {
          include: { user: { select: { id: true, name: true, role: true } } },
        },
      },
    })
  )

  return NextResponse.json({ success: true, data: updated })
}
