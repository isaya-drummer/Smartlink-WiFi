export const dynamic = 'force-dynamic'
/**
 * POST /api/portal/omada/grant
 *
 * Called after successful payment to authorize the client on the EAP625.
 * The portal success page calls this with the client MAC and voucher info.
 *
 * Body: {
 *   clientMac: string
 *   apMac: string
 *   ssidName: string
 *   radioId: number
 *   voucherId: string   — to get bundle duration/data from DB
 * }
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma, withRetry } from "@/lib/prisma"
import { authorizeClient } from "@/lib/omada"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { clientMac, apMac, ssidName, radioId, voucherId } = body

    if (!clientMac || !voucherId) {
      return NextResponse.json({ error: "clientMac and voucherId required" }, { status: 400 })
    }

    // Get voucher + bundle details
    const voucher = await withRetry(() =>
      prisma.voucher.findUnique({
        where: { id: voucherId },
        include: { bundle: true },
      })
    )

    if (!voucher) {
      return NextResponse.json({ error: "Voucher not found" }, { status: 404 })
    }

    if (voucher.status !== "ACTIVE") {
      return NextResponse.json({ error: "Voucher not active" }, { status: 400 })
    }

    // Calculate remaining time in seconds
    const now = new Date()
    const expiresAt = voucher.expiresAt
    const remainingSec = expiresAt
      ? Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000))
      : voucher.bundle.durationHours * 3600

    if (remainingSec === 0) {
      return NextResponse.json({ error: "Voucher expired" }, { status: 400 })
    }

    const AP_MAC  = apMac     || process.env.OMADA_AP_MAC  || "A82948318A18"
    const SSID    = ssidName  || process.env.OMADA_SSID    || "Smartlink WiFi"
    const RADIO   = radioId   ?? 1

    // Authorize on Omada
    const result = await authorizeClient(
      clientMac,
      AP_MAC,
      SSID,
      RADIO,
      remainingSec,
      voucher.bundle.dataLimitMB
    )

    // Store session record
    if (result.success) {
      await withRetry(() =>
        prisma.session.upsert({
          where: { id: `${voucherId}-${clientMac.replace(/[:-]/g, "")}` },
          create: {
            id:         `${voucherId}-${clientMac.replace(/[:-]/g, "")}`,
            voucherId,
            clientMac:  clientMac.toUpperCase(),
            clientIp:   req.headers.get("x-forwarded-for") ?? "unknown",
            connectedAt: now,
          },
          update: {
            connectedAt: now,
          },
        })
      ).catch(() => {/* non-critical */})
    }

    return NextResponse.json({
      success: result.success,
      message: result.message,
      remainingSec,
      expiresAt: expiresAt?.toISOString(),
    })
  } catch (err) {
    console.error("[Omada Grant]", err)
    return NextResponse.json({ error: "Authorization failed" }, { status: 500 })
  }
}
