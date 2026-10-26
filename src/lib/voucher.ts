// Characters that exclude confusable chars: 0, O, I, 1, l
const VOUCHER_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"

/**
 * Generates an 8-character uppercase alphanumeric voucher code,
 * excluding confusable characters (0, O, I, 1, l).
 */
export function generateVoucherCode(): string {
  let code = ""
  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * VOUCHER_CHARS.length)
    code += VOUCHER_CHARS[randomIndex]
  }
  return code
}

/**
 * Validates that a voucher code is exactly 8 characters and
 * all characters are from the allowed pool.
 */
export function validateVoucherCode(code: string): boolean {
  if (code.length !== 8) return false
  return code.split("").every((char) => VOUCHER_CHARS.includes(char))
}
