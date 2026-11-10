export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma, withRetry } from "@/lib/prisma"

export async function PATCH(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  const u = session?.user as { id?: string; role?: string } | undefined
  if (!u?.id || (u.role !== "ADMIN" && u.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const message = await withRetry(() =>
    prisma.message.findUnique({ where: { id: params.id } })
  )
  if (!message) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 })
  }
  if (message.senderId !== u.id) {
    return NextResponse.json({ error: "Cannot delete others messages" }, { status: 403 })
  }

  await withRetry(() =>
    prisma.message.update({
      where: { id: params.id },
      data: { deleted: true, content: "" },
    })
  )

  return NextResponse.json({ success: true })
}
