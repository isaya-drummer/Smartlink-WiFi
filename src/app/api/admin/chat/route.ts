import { NextResponse } from "next/server"
// Deprecated — use /api/chat/ routes instead
export async function GET() {
  return NextResponse.json({ error: "Deprecated. Use /api/chat/conversations and /api/chat/messages" }, { status: 410 })
}
export async function POST() {
  return NextResponse.json({ error: "Deprecated. Use /api/chat/messages" }, { status: 410 })
}
