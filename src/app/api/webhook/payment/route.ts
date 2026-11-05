/**
 * POST /api/webhook/payment
 *
 * Receives real-time payment status callbacks from PayIn (payin.co.tz).
 *
 * PayIn webhook payload shape:
 * {
 *   request_ref:   "PAY-xxxx",         // PayIn's own reference
 *   external_ref:  "PAY-timestamp-xxx", // Our reference we passed at initiation
 *   status:        "completed" | "failed",
 *   operator_ref:  "12345678",          // Operator's transaction ID
 *   phone:         "255714123456",
 *   amount:        5000,
 *   currency:      "TZS",
 *   operator:      "mpesa"
 * }
 *
 * GET /api/webhook/payment?ref=<externalRef>
 * Simulated auto-activation (used on /portal/success in demo mode).
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma, withRetry } from "@/lib/prisma"
import { verifyWebhookSignature } from "@/lib/payment"
import { authorizeClient } from "@/lib/omada"

// ─── Shared activation logic ──────────────────────────────────────────────────

async function activateByRef(externalRef: string) {
  const payment = await withRetry(() => prisma.payment.findUnique({
    where: { reference: externalRef },
    include: {
      voucher: { include: { bundle: true } },
    },
  }))

  if (!payment) {
    return { status: 404, body: { error: "Payment not found", ref: externalRef } }
  }

  // Idempotent — if already processed, return current state
  if (payment.status !== "PENDING") {
    return {
      status: 200,
      body: {
        success: true,
        already_processed: true,
        voucher: {
          code:      payment.voucher.code,
          expiresAt: payment.voucher.expiresAt,
        },
      },
    }
  }

  const now      = new Date()
  const expiresAt = new Date(
    now.getTime() + payment.voucher.bundle.durationHours * 60 * 60 * 1000
  )

  const updated = await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data:  { status: "SUCCESS" },
    })

    return tx.voucher.update({
      where: { id: payment.voucherId },
      data: {
        status:      "ACTIVE",
        activatedAt: now,
        expiresAt,
      },
    })
  })

  // Authorize client on Omada EAP625 if MAC address is known
  // clientMac comes from the session record if available
  const session = await prisma.session.findFirst({
    where: { voucherId: updated.id },
    orderBy: { connectedAt: "desc" },
  })

  const apMac   = process.env.OMADA_AP_MAC ?? "A82948318A18" // EAP625 MAC
  const ssid    = process.env.OMADA_SSID   ?? "Smartlink WiFi"
  const radioId = 1 // 5GHz band

  if (session?.clientMac) {
    await authorizeClient(
      session.clientMac,
      apMac,
      ssid,
      radioId,
      payment.voucher.bundle.durationHours * 3600,
      payment.voucher.bundle.dataLimitMB
    )
  } else {
    console.log(`[Webhook] No client MAC for voucher ${updated.code} — Omada auth skipped until client connects`)
  }

  console.log(`[Webhook] Voucher ${updated.code} activated | expires ${expiresAt.toISOString()}`)

  return {
    status: 200,
    body: {
      success:  true,
      voucher: {
        code:      updated.code,
        expiresAt: updated.expiresAt,
      },
    },
  }
}

async function failPayment(externalRef: string) {
  await prisma.payment.updateMany({
    where:  { reference: externalRef, status: "PENDING" },
    data:   { status: "FAILED" },
  })
  console.log(`[Webhook] Payment ${externalRef} marked as FAILED`)
}

// ─── GET — demo simulation ────────────────────────────────────────────────────

/**
 * Called by /portal/success after 3 seconds in demo/sandbox mode.
 * In production the real webhook below handles activation instead.
 */
export async function GET(request: NextRequest) {
  try {
    const ref = request.nextUrl.searchParams.get("ref")
    if (!ref) {
      return NextResponse.json({ error: "Missing ref" }, { status: 400 })
    }

    const result = await activateByRef(ref)
    return NextResponse.json(result.body, { status: result.status })
  } catch (err) {
    console.error("[GET /api/webhook/payment]", err)
    return NextResponse.json({ error: "Activation failed" }, { status: 500 })
  }
}

// ─── POST — real PayIn webhook ────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()

    // Verify HMAC-SHA256 signature from PayIn
    const signature = request.headers.get("X-PayIn-Signature") ?? ""
    const isValid   = await verifyWebhookSignature(rawBody, signature)

    if (!isValid) {
      console.warn("[Webhook] Invalid signature — rejecting request")
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const body = JSON.parse(rawBody)

    // PayIn sends external_ref = the reference we passed when initiating
    const externalRef = body.external_ref ?? body.reference ?? body.ref

    if (!externalRef || typeof externalRef !== "string") {
      return NextResponse.json({ error: "Missing external_ref" }, { status: 400 })
    }

    const status: string = body.status ?? ""

    console.log(`[Webhook] PayIn callback | ref=${externalRef} | status=${status} | operator_ref=${body.operator_ref}`)

    if (status === "completed") {
      const result = await activateByRef(externalRef)
      return NextResponse.json(result.body, { status: result.status })
    }

    if (status === "failed") {
      await failPayment(externalRef)
      return NextResponse.json({ success: true, message: "Payment marked as failed" })
    }

    // Unknown status — acknowledge receipt so PayIn doesn't retry
    return NextResponse.json({ success: true, message: `Status '${status}' acknowledged` })
  } catch (err) {
    console.error("[POST /api/webhook/payment]", err)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
