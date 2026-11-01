/**
 * File upload proxy endpoint.
 * Uploads files to UploadThing and returns the public URL.
 *
 * POST /api/uploadthing
 * Body: FormData with "file" field
 * Returns: { success: true, data: { url, name, size } }
 */

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function POST(req: NextRequest) {
  const session = await auth()
  const u = session?.user as { id?: string; role?: string } | undefined
  if (!u?.id || (u.role !== "ADMIN" && u.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const apiKey = process.env.UPLOADTHING_SECRET ?? process.env.UPLOADTHING_TOKEN ?? ""
  if (!apiKey) {
    return NextResponse.json({ error: "UploadThing not configured" }, { status: 500 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })
    if (file.size > 32 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 32MB)" }, { status: 400 })
    }

    // Step 1 — request a presigned upload URL from UploadThing
    const initRes = await fetch("https://api.uploadthing.com/v6/uploadFiles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-uploadthing-api-key": apiKey,
      },
      body: JSON.stringify({
        files: [{ name: file.name, size: file.size, type: file.type }],
        acl: "public-read",
        contentDisposition: "inline",
      }),
    })

    const initText = await initRes.text()
    console.log("[UploadThing] Init response:", initRes.status, initText.slice(0, 300))

    if (!initRes.ok) {
      return NextResponse.json({ error: `UploadThing init failed: ${initRes.status}` }, { status: 502 })
    }

    const initData = JSON.parse(initText)

    // Handle both { data: [...] } and direct array shapes
    const uploads: Record<string, unknown>[] = Array.isArray(initData)
      ? initData
      : (initData.data ?? [])

    const upload = uploads[0] as Record<string, unknown> | undefined
    if (!upload) {
      return NextResponse.json({ error: "No upload slot returned" }, { status: 502 })
    }

    const presignedUrl = (upload.url ?? upload.uploadUrl ?? upload.presignedUrl) as string | undefined
    if (!presignedUrl) {
      console.error("[UploadThing] Upload slot keys:", Object.keys(upload))
      return NextResponse.json({ error: "No presigned URL in response" }, { status: 502 })
    }

    // Step 2 — PUT file to the presigned URL
    const fileBuffer = await file.arrayBuffer()
    const putRes = await fetch(presignedUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: fileBuffer,
    })

    if (!putRes.ok) {
      console.error("[UploadThing] PUT failed:", putRes.status, await putRes.text().catch(() => ""))
      return NextResponse.json({ error: "File upload to storage failed" }, { status: 502 })
    }

    // Step 3 — derive the public URL
    const fileUrl =
      (upload.fileUrl ?? upload.ufsUrl ?? upload.appUrl ?? upload.customId) as string | undefined

    // UploadThing CDN URL pattern if not returned directly
    const appId = process.env.UPLOADTHING_APP_ID ?? ""
    const key = (upload.key ?? upload.fileKey) as string | undefined
    const publicUrl = fileUrl ?? (key && appId ? `https://utfs.io/f/${key}` : null)

    if (!publicUrl) {
      console.error("[UploadThing] Cannot derive URL. Upload keys:", Object.keys(upload))
      return NextResponse.json({ error: "Could not determine file URL" }, { status: 502 })
    }

    return NextResponse.json({
      success: true,
      data: { url: publicUrl, name: file.name, size: file.size, type: file.type },
    })
  } catch (err) {
    console.error("[UploadThing] Unexpected error:", err)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
