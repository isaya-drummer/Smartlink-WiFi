import { PrismaClient } from "@prisma/client"

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

function isRetryableError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false
  const code = (err as { code?: string }).code ?? ""
  if (["P1001", "P1002", "P2024"].includes(code)) return true
  const msg = (err as { message?: string }).message ?? ""
  return (
    msg.includes("ConnectionReset") ||
    msg.includes("ECONNRESET") ||
    msg.includes("forcibly closed") ||
    msg.includes("broken pipe") ||
    msg.includes("BrokenPipe") ||
    msg.includes("connection pool") ||
    msg.includes("Timed out fetching") ||
    msg.includes("Can't reach database") ||
    msg.includes("10054")
  )
}

export const prisma = global.__prisma ?? new PrismaClient({
  log: ["error"],
  datasources: { db: { url: process.env.DATABASE_URL } },
})

if (process.env.NODE_ENV !== "production") global.__prisma = prisma

/**
 * Wraps any Prisma operation with automatic retry on Neon connection errors.
 * Neon free tier resets idle connections — this retries up to 3 times.
 *
 * Usage: await withRetry(() => prisma.bundle.findMany())
 */
export async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (err: unknown) {
      const isLast = attempt === retries
      if (isLast || !isRetryableError(err)) throw err

      const delay = 700 * attempt
      console.warn(
        `[Prisma] Retryable error on attempt ${attempt}/${retries}, ` +
        `retrying in ${delay}ms… (${(err as { message?: string }).message?.slice(0, 80)})`
      )
      await sleep(delay)
    }
  }
  throw new Error("[Prisma] Exhausted retries")
}
