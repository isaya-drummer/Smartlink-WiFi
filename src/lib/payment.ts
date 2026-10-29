/**
 * SmartLink Digital — Payment Provider Integration
 *
 * Uses PayIn (payin.co.tz) — a Tanzanian payment aggregator that handles
 * M-Pesa, Airtel Money, HaloPesa, and Mixx by Yas through one unified API.
 *
 * Docs: https://docs.payin.co.tz
 *
 * To go live:
 * 1. Register at https://payin.co.tz and get your API keys
 * 2. Set PAYIN_API_KEY and PAYIN_API_SECRET in .env
 * 3. Set PAYIN_WEBHOOK_SECRET for webhook signature verification
 * 4. Set PAYIN_SANDBOX=false in .env for production
 */

export type Provider = "YAS" | "AIRTEL" | "VODACOM" | "HALOTEL"

// Maps our internal provider enum to PayIn operator codes
export const PROVIDER_TO_OPERATOR: Record<Provider, string> = {
  YAS:     "mixxyas",   // Mixx by Yas (formerly Tigo Pesa network)
  AIRTEL:  "airtel",    // Airtel Money Tanzania
  VODACOM: "mpesa",     // Vodacom M-Pesa Tanzania
  HALOTEL: "halopesa",  // HaloPesa (Halotel)
}

export const PROVIDER_CONFIG: Record<
  Provider,
  { name: string; color: string; textColor: string; logo: string }
> = {
  YAS: {
    name: "Yas Mixx",
    color: "#FFC107",
    textColor: "#1a1a1a",
    logo: "/yas.jpg",
  },
  AIRTEL: {
    name: "Airtel",
    color: "#E53935",
    textColor: "#ffffff",
    logo: "/airtel.jpg",
  },
  VODACOM: {
    name: "Vodacom M-Pesa",
    color: "#E53935",
    textColor: "#ffffff",
    logo: "/vodacom.png",
  },
  HALOTEL: {
    name: "HaloPesa",
    color: "#ff5722",
    textColor: "#ffffff",
    logo: "/halopesa.png",
  },
}

// ─── PayIn API config ────────────────────────────────────────────────────────

const PAYIN_SANDBOX = process.env.PAYIN_SANDBOX !== "false"

const PAYIN_BASE_URL = PAYIN_SANDBOX
  ? "https://api.sandbox.payin.co.tz/api/v1"
  : "https://api.payin.co.tz/api/v1"

const PAYIN_API_KEY    = process.env.PAYIN_API_KEY    ?? ""
const PAYIN_API_SECRET = process.env.PAYIN_API_SECRET ?? ""

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PaymentResult {
  success: boolean
  reference: string      // PayIn request_ref (PAY-...)
  message: string
  provider: Provider
  status: "processing" | "failed"
}

export interface PaymentStatusResult {
  success: boolean
  status: "PENDING" | "SUCCESS" | "FAILED"
  reference: string
  message: string
  operatorRef?: string   // operator's own transaction ID
}

// PayIn collection response shape
interface PayInCollectionResponse {
  request_ref:  string
  external_ref: string
  status:       "processing" | "failed"
  message:      string
  operator_ref?: string
  checkout_url?: string
}

// PayIn status response shape
interface PayInStatusResponse {
  request_ref:  string
  external_ref: string
  status:       "completed" | "failed" | "processing" | "pending"
  operator_ref?: string
  message:      string
  error?:       string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function payinHeaders(idempotencyKey?: string): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type":  "application/json",
    "X-API-Key":     PAYIN_API_KEY,
    "X-API-Secret":  PAYIN_API_SECRET,
  }
  if (idempotencyKey) {
    headers["X-Idempotency-Key"] = idempotencyKey
  }
  return headers
}

// ─── Core API Functions ───────────────────────────────────────────────────────

/**
 * Initiates a USSD push payment request via PayIn.
 *
 * The customer receives a prompt on their phone to confirm the payment.
 * Once confirmed, PayIn sends a webhook to /api/webhook/payment.
 *
 * @param provider   - Our internal provider enum
 * @param phone      - Customer phone in international format (e.g. 255714123456)
 * @param amount     - Amount in TZS
 * @param externalRef - Our internal reference (used for idempotency + webhook matching)
 * @returns PaymentResult
 */
export async function initiatePayment(
  provider: Provider,
  phone: string,
  amount: number,
  externalRef: string
): Promise<PaymentResult> {
  const operator = PROVIDER_TO_OPERATOR[provider]

  // Normalize phone: strip leading 0 and ensure 255 prefix
  const normalizedPhone = normalizePhone(phone)

  console.log(
    `[PayIn] Initiating ${operator} payment | phone=${normalizedPhone} | amount=${amount} TZS | ref=${externalRef}`
  )

  // If no API keys configured, fall back to simulation mode
  if (!PAYIN_API_KEY || !PAYIN_API_SECRET) {
    console.warn("[PayIn] No API keys set — running in SIMULATION mode. Set PAYIN_API_KEY and PAYIN_API_SECRET in .env")
    return {
      success: true,
      reference: externalRef,
      message: `[Simulation] Payment of ${amount} TZS initiated via ${PROVIDER_CONFIG[provider].name}. The customer would receive a USSD prompt.`,
      provider,
      status: "processing",
    }
  }

  try {
    const res = await fetch(`${PAYIN_BASE_URL}/collection`, {
      method: "POST",
      headers: payinHeaders(externalRef),
      body: JSON.stringify({
        phone:        normalizedPhone,
        amount:       amount,
        currency:     "TZS",
        operator:     operator,
        external_ref: externalRef,
        callback_url: `${process.env.NEXTAUTH_URL}/api/webhook/payment`,
      }),
    })

    const data: PayInCollectionResponse = await res.json()

    if (!res.ok) {
      console.error(`[PayIn] Collection failed (HTTP ${res.status}):`, data)
      return {
        success: false,
        reference: externalRef,
        message: (data as { message?: string }).message ?? "Payment initiation failed",
        provider,
        status: "failed",
      }
    }

    console.log(`[PayIn] Collection accepted | payin_ref=${data.request_ref} | status=${data.status}`)

    return {
      success: true,
      reference: externalRef,       // keep our own ref for DB matching
      message: data.message,
      provider,
      status: data.status,
    }
  } catch (err) {
    console.error("[PayIn] Network error during collection:", err)
    return {
      success: false,
      reference: externalRef,
      message: "Network error — could not reach payment provider",
      provider,
      status: "failed",
    }
  }
}

/**
 * Polls PayIn for the current status of a payment.
 * Used as a fallback if the webhook hasn't arrived yet.
 *
 * @param externalRef - Our internal payment reference
 * @returns PaymentStatusResult
 */
export async function checkPaymentStatus(
  externalRef: string
): Promise<PaymentStatusResult> {
  if (!PAYIN_API_KEY || !PAYIN_API_SECRET) {
    // Simulation: always return success
    return {
      success: true,
      status:  "SUCCESS",
      reference: externalRef,
      message:  "[Simulation] Payment confirmed",
    }
  }

  try {
    const res = await fetch(`${PAYIN_BASE_URL}/status/${encodeURIComponent(externalRef)}`, {
      method:  "GET",
      headers: payinHeaders(),
    })

    const data: PayInStatusResponse = await res.json()

    if (!res.ok) {
      return {
        success:   false,
        status:    "FAILED",
        reference: externalRef,
        message:   (data as { message?: string }).message ?? "Status check failed",
      }
    }

    const statusMap: Record<PayInStatusResponse["status"], PaymentStatusResult["status"]> = {
      completed:  "SUCCESS",
      failed:     "FAILED",
      processing: "PENDING",
      pending:    "PENDING",
    }

    return {
      success:     data.status === "completed",
      status:      statusMap[data.status] ?? "PENDING",
      reference:   externalRef,
      message:     data.message,
      operatorRef: data.operator_ref,
    }
  } catch (err) {
    console.error("[PayIn] Status check error:", err)
    return {
      success:   false,
      status:    "FAILED",
      reference: externalRef,
      message:   "Network error during status check",
    }
  }
}

// ─── Webhook Signature Verification ──────────────────────────────────────────

/**
 * Verifies the HMAC-SHA256 signature on incoming PayIn webhooks.
 *
 * PayIn signs each webhook with your PAYIN_WEBHOOK_SECRET.
 * The signature is sent in the X-PayIn-Signature header as:
 *   sha256=<hex_digest>
 *
 * @param rawBody  - Raw request body as a string (before JSON.parse)
 * @param signature - Value of the X-PayIn-Signature header
 * @returns true if signature is valid
 */
export async function verifyWebhookSignature(
  rawBody: string,
  signature: string
): Promise<boolean> {
  const secret = process.env.PAYIN_WEBHOOK_SECRET
  if (!secret) {
    console.warn("[PayIn] PAYIN_WEBHOOK_SECRET not set — skipping signature verification")
    return true  // allow in dev; always set in production
  }

  try {
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    )

    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(rawBody)
    )

    const expectedHex = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")

    const expected = `sha256=${expectedHex}`

    // Constant-time comparison to prevent timing attacks
    if (expected.length !== signature.length) return false

    let mismatch = 0
    for (let i = 0; i < expected.length; i++) {
      mismatch |= expected.charCodeAt(i) ^ signature.charCodeAt(i)
    }
    return mismatch === 0
  } catch (err) {
    console.error("[PayIn] Signature verification error:", err)
    return false
  }
}

// ─── Utilities ────────────────────────────────────────────────────────────────

/**
 * Normalizes a Tanzanian phone number to international format (255XXXXXXXXX).
 * Handles formats: 07XXXXXXXX, 255XXXXXXXXX, +255XXXXXXXXX
 */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "")

  if (digits.startsWith("255") && digits.length === 12) return digits
  if (digits.startsWith("0") && digits.length === 10)   return "255" + digits.slice(1)
  if (digits.startsWith("7") && digits.length === 9)    return "255" + digits

  return digits  // return as-is if format is unrecognized
}
