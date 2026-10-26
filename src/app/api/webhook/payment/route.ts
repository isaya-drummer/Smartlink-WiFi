import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { addVoucher } from "@/lib/mikrotik"

/**
 * Shared logic: find a PENDING payment by ref, activate it and its voucher,
 * call MikroTik to register the hotspot user, and return the activated voucher.
 */
async function activatePayment(ref: string) {
  const payment = await prisma.payment.findUnique({
    where: { reference: ref },
    include: {
      voucher: {
        include: { bundle: true },
      },
    },
  })

  if (!payment) {
    return { status: 404, body: { error: "Payment not found" } }
  }

  // If already activated, return current state without re-processing
  if (payment.status !== "PENDING") {
    return {
      status: 200,
      body: {
        success: true,
        voucher: {
          code: payment.voucher.code,
          expiresAt: payment.voucher.expiresAt,
        },
      },
    }
  }

  const now = new Date()
  const expiresAt = new Date(
    now.getTime() + payment.voucher.bundle.durationHours * 60 * 60 * 1000
  )

  // Update Payment → SUCCESS and Voucher → ACTIVE in a transaction
  const updated = await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: { status: "SUCCESS" },
    })

    const voucher = await tx.voucher.update({
      where: { id: payment.voucherId },
      data: {
        status: "ACTIVE",
        activatedAt: now,
        expiresAt,
      },
    })

    return voucher
  })

  // Register on MikroTik (stub — logs TODO)
  await addVoucher(
    updated.code,
    payment.voucher.bundle.durationHours,
    payment.voucher.bundle.dataLimitMB
  )

  return {
    status: 200,
    body: {
      success: true,
      voucher: {
        code: updated.code,
        expiresAt: updated.expiresAt,
      },
    },
  }
}

/**
 * GET /api/webhook/payment?ref=<paymentReference>
 * Simulated activation called from /portal/success after a 3s delay.
 */
export async function GET(request: NextRequest) {
  try {
    const ref = request.nextUrl.searchParams.get("ref")
    if (!ref) {
      return NextResponse.json(
        { error: "Missing ref parameter" },
        { status: 400 }
      )
    }

    const result = await activatePayment(ref)
    return NextResponse.json(result.body, { status: result.status })
  } catch (error) {
    console.error("[GET /api/webhook/payment] Error:", error)
    return NextResponse.json(
      { error: "Activation failed" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/webhook/payment
 * Real webhook endpoint for payment provider callbacks.
 * Expects body with { reference } or provider-specific payload.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const ref = body.reference || body.ref || body.paymentRef

    if (!ref || typeof ref !== "string") {
      return NextResponse.json(
        { error: "Missing payment reference in body" },
        { status: 400 }
      )
    }

    const result = await activatePayment(ref)
    return NextResponse.json(result.body, { status: result.status })
  } catch (error) {
    console.error("[POST /api/webhook/payment] Error:", error)
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    )
  }
}
