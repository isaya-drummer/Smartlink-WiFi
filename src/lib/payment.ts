export type Provider = "YAS" | "AIRTEL" | "VODACOM" | "HALOTEL"

export interface PaymentResult {
  success: boolean
  reference: string
  message: string
  provider: Provider
}

export interface PaymentStatusResult {
  success: boolean
  status: "PENDING" | "SUCCESS" | "FAILED"
  reference: string
  message: string
}

export const PROVIDER_CONFIG: Record<
  Provider,
  { name: string; color: string; textColor: string }
> = {
  YAS: {
    name: "Yas",
    color: "#FFC107",
    textColor: "#1a1a1a",
  },
  AIRTEL: {
    name: "Airtel",
    color: "#E53935",
    textColor: "#ffffff",
  },
  VODACOM: {
    name: "Vodacom",
    color: "#43A047",
    textColor: "#ffffff",
  },
  HALOTEL: {
    name: "Halotel",
    color: "#1E88E5",
    textColor: "#ffffff",
  },
}

/**
 * Initiates a payment with the given provider.
 * TODO: Replace stub with real payment provider API integration.
 *
 * @param provider - The payment provider (YAS, AIRTEL, VODACOM, HALOTEL)
 * @param phone - The client's phone number
 * @param amount - The payment amount in TZS
 * @param ref - A unique reference for this payment
 * @returns A mock successful payment initiation response
 */
export async function initiatePayment(
  provider: Provider,
  phone: string,
  amount: number,
  ref: string
): Promise<PaymentResult> {
  console.log(
    `[Payment] Initiating ${provider} payment for ${phone}, amount: ${amount} TZS, ref: ${ref}`
  )

  // Mock response — replace with real API call
  return {
    success: true,
    reference: ref,
    message: `Payment of ${amount} TZS initiated via ${PROVIDER_CONFIG[provider].name}. Please confirm on your phone.`,
    provider,
  }
}

/**
 * Checks the status of a payment with the given provider.
 * TODO: Replace stub with real payment provider API integration.
 *
 * @param provider - The payment provider
 * @param ref - The payment reference to check
 * @returns A mock payment status response
 */
export async function checkPaymentStatus(
  provider: Provider,
  ref: string
): Promise<PaymentStatusResult> {
  console.log(`[Payment] Checking ${provider} payment status for ref: ${ref}`)

  // Mock response — replace with real API call
  return {
    success: true,
    status: "SUCCESS",
    reference: ref,
    message: `Payment ${ref} confirmed successfully via ${PROVIDER_CONFIG[provider].name}.`,
  }
}
