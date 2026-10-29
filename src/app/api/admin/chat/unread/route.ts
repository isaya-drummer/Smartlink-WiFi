import { NextResponse } from "next/server"
// Deprecated — use /api/chat/unread instead
export async function GET() {
  return NextResponse.json({ success: true, data: { unread: 0 }, count: 0 })
}
