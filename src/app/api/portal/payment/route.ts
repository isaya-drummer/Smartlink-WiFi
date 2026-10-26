import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { initiatePayment } from "@/lib/payment"
import { generateVoucherCode } from "@/lib/voucher"

const paymentSchema = z.object({
  provider: z.enum(["YAS", "AIRTEL", "VODACOM", "HALOTEL"]),
  bundleId: z.string().min(1),
  clientName: z.string().min(2),
  clientPhone: z.string().min(8),
})

/**
 * POST /api/portal/payment
 * Validates the request body, looks up the bundle, initiates payment,
 * generates a voucher code, and creates Voucher + Payment records in a transaction.
 * Returns { success, paymentRef, voucherCode } with status 201.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = paymentSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { provider, bundleId, clientName, clientPhone } = parsed.data

    // Fetch the bundle
    const bundle = await prisma.bundle.findUnique({ where: { id: bundleId } })
    if (!bundle || !bundle.isActive) {
      return NextResponse.json(
        { error: "Bundle not found or no longer available" },
        { status: 404 }
      )
    }

    // Generate voucher code and payment reference
    const voucherCode = generateVoucherCode()
    const paymentRef = `PAY-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`

    // Initiate payment with provider (stub)
    await initiatePayment(provider, clientPhone, bundle.price, paymentRef)

    // Create Voucher + Payment in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const voucher = await tx.voucher.create({
        data: {
          code: voucherCode,
          bundleId: bundle.id,
          clientPhone,
          clientName,
          paymentProvider: provider,
          paymentRef,
          amount: bundle.price,
          status: "PENDING",
        },
      })

      const payment = await tx.payment.create({
        data: {
          voucherId: voucher.id,
          provider,
          phoneNumber: clientPhone,
          amount: bundle.price,
          currency: bundle.currency,
          reference: paymentRef,
          status: "PENDING",
        },
      })

      return { voucher, payment }
    })

    return NextResponse.json(
      {
        success: true,
        paymentRef: result.payment.reference,
        voucherCode: result.voucher.code,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("[POST /api/portal/payment] Error:", error)
    return NextResponse.json(
      { error: "Payment initiation failed" },
      { status: 500 }
    )
  }
}
