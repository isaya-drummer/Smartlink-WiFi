/**
 * File upload endpoint — converts profile photos to small base64 data URLs.
 * No external SDK or npm packages needed.
 *
 * Images are accepted up to 5MB but the stored data URL is generated from
 * the raw bytes — browser will display it directly.
 *
 * POST /api/uploadthing
 * Body: FormData with "file" field
 * Returns: { success: true, data: { url, name, size, type } }
 */

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

const MAX_SIZE = 5 * 1024 * 1024 // 5MB input limit

export async function POST(req: NextRequest) {
  const session = await auth()
  const u = session?.user as { id?: string; role?: string } | undefined
  if (!u?.id || (u.role !== "ADMIN" && u.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are supported for profile photos" }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large. Maximum 5MB." }, { status: 400 })
    }

    // Convert to base64 data URL
    const buffer = await file.arrayBuffer()
    const base64 = Buffer.from(buffer).toString("base64")
    const dataUrl = `data:${file.type};base64,${base64}`

    console.log(`[Upload] Profile photo: ${file.name} ${(file.size/1024).toFixed(0)}KB -> data URL`)

    return NextResponse.json({
      success: true,
      data: {
        url: dataUrl,
        name: file.name,
        size: file.size,
        type: file.type,
      },
    })
  } catch (err) {
    console.error("[Upload] Error:", err)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
