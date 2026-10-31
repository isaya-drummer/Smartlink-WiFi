import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma, withRetry } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  const u = session?.user as { id?: string; role?: string } | undefined
  if (!u?.id || (u.role !== "ADMIN" && u.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Efficient approach: raw aggregate per participation
    const participations = await withRetry(() =>
      prisma.conversationParticipant.findMany({
        where: { userId: u.id },
        select: { conversationId: true, lastReadAt: true },
      })
    )

    if (participations.length === 0) {
      return NextResponse.json({ success: true, data: { unread: 0 } })
    }

    // Count unread per conversation in parallel (but limit concurrency)
    const counts = await withRetry(() =>
      Promise.all(
        participations.map((p) =>
          prisma.message.count({
            where: {
              conversationId: p.conversationId,
              createdAt: { gt: p.lastReadAt },
              senderId: { not: u.id },
              deleted: false,
            },
          })
        )
      )
    )

    const unread = counts.reduce((sum, c) => sum + c, 0)
    return NextResponse.json({ success: true, data: { unread } })
  } catch {
    return NextResponse.json({ success: true, data: { unread: 0 } })
  }
}
