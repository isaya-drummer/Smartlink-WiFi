/**
 * UploadThing file upload endpoint for the chat engine.
 * Accepts images and files, returns the URL to embed in a chat message.
 *
 * Since the UploadThing SDK (@uploadthing/react) is not installed,
 * we proxy uploads directly to UploadThing's REST API.
 *
 * POST /api/uploadthing
 * Body: FormData with file field "file"
 * Returns: { success: true, data: { url, name, size, type } }
 */

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function POST(req: NextRequest) {
  const session = await auth()
  const u = session?.user as { id?: string; role?: string } | undefined
  if (!u?.id || (u.role !== "ADMIN" && u.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const token = process.env.UPLOADTHING_TOKEN
  if (!token) {
    return NextResponse.json({ error: "UploadThing not configured" }, { status: 500 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Max 32MB
    if (file.size > 32 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 32MB)" }, { status: 400 })
    }

    // Step 1: Request upload URL from UploadThing
    const requestUpload = await fetch("https://api.uploadthing.com/v6/uploadFiles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-uploadthing-api-key": process.env.UPLOADTHING_SECRET ?? "",
      },
      body: JSON.stringify({
        files: [{ name: file.name, size: file.size, type: file.type }],
        acl: "public-read",
      }),
    })

    if (!requestUpload.ok) {
      const err = await requestUpload.text()
      console.error("[UploadThing] Failed to get upload URL:", err)
      return NextResponse.json({ error: "Upload failed" }, { status: 502 })
    }

    const { data: uploadData } = await requestUpload.json()
    const uploadInfo = uploadData?.[0]

    if (!uploadInfo?.url) {
      return NextResponse.json({ error: "No upload URL returned" }, { status: 502 })
    }

    // Step 2: Upload the file to the presigned URL
    const uploadRes = await fetch(uploadInfo.url, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: await file.arrayBuffer(),
    })

    if (!uploadRes.ok) {
      return NextResponse.json({ error: "File upload failed" }, { status: 502 })
    }

    return NextResponse.json({
      success: true,
      data: {
        url: uploadInfo.fileUrl ?? uploadInfo.ufsUrl ?? uploadInfo.url,
        name: file.name,
        size: file.size,
        type: file.type,
      },
    })
  } catch (err) {
    console.error("[UploadThing] Error:", err)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
