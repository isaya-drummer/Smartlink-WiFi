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
    msg.includes("10054") ||
    msg.includes("undefined")
  )
}

// Lazy initialization — only create PrismaClient when DATABASE_URL is available
// This prevents build-time errors on Cloudflare Pages
function getPrismaClient(): PrismaClient {
  if (global.__prisma) return global.__prisma

  const url = process.env.DATABASE_URL
  if (!url) {
    // During build time, return a dummy that won't be called
    console.warn("[Prisma] DATABASE_URL not set — using placeholder client")
  }

  const client = new PrismaClient({
    log: ["error"],
    datasources: url ? { db: { url } } : undefined,
  })

  if (process.env.NODE_ENV !== "production") {
    global.__prisma = client
  }

  return client
}

export const prisma = getPrismaClient()

export async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (err: unknown) {
      const isLast = attempt === retries
      if (isLast || !isRetryableError(err)) throw err
      const delay = 700 * attempt
      console.warn(`[Prisma] Retry ${attempt}/${retries} in ${delay}ms…`)
      await sleep(delay)
    }
  }
  throw new Error("[Prisma] Exhausted retries")
}
