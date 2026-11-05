/**
 * TP-Link Omada Open API Integration
 * Smartlink WiFi — Hotspot Access Control
 *
 * Replaces the MikroTik stub. Uses Omada's OAuth 2.0 Client Credentials
 * mode to authorize hotspot clients after payment.
 *
 * Required environment variables:
 *   OMADA_BASE_URL      — e.g. https://192.168.0.1:8043 (local) or
 *                          https://aps1-omada-northbound.tplinkcloud.com (cloud)
 *   OMADA_CLIENT_ID     — from Settings > Platform Integration > Open API
 *   OMADA_CLIENT_SECRET — from Settings > Platform Integration > Open API
 *   OMADA_OMADAC_ID     — Omada ID (shown in View details of the application)
 *   OMADA_SITE_ID       — Site ID where the EAP625 is adopted
 *
 * Docs: TP-Link Omada Open API Guide v2
 */

const OMADA_BASE_URL     = process.env.OMADA_BASE_URL     ?? ""
const OMADA_CLIENT_ID    = process.env.OMADA_CLIENT_ID    ?? ""
const OMADA_CLIENT_SECRET = process.env.OMADA_CLIENT_SECRET ?? ""
const OMADA_OMADAC_ID    = process.env.OMADA_OMADAC_ID    ?? ""
const OMADA_SITE_ID      = process.env.OMADA_SITE_ID      ?? ""

// ── Token cache ──────────────────────────────────────────────────────────────

interface TokenCache {
  accessToken:  string
  refreshToken: string
  expiresAt:    number  // unix ms
}

let tokenCache: TokenCache | null = null

// ── Helpers ──────────────────────────────────────────────────────────────────

function isConfigured(): boolean {
  return !!(OMADA_BASE_URL && OMADA_CLIENT_ID && OMADA_CLIENT_SECRET && OMADA_OMADAC_ID && OMADA_SITE_ID)
}

async function omadaFetch(
  path: string,
  options: RequestInit = {},
  accessToken?: string
): Promise<Response> {
  const url = `${OMADA_BASE_URL}${path}`
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> ?? {}),
  }
  if (accessToken) {
    headers["Authorization"] = `AccessToken=${accessToken}`
  }
  // Skip TLS verification for local controllers (self-signed certs)
  return fetch(url, { ...options, headers })
}

// ── Authentication — Client Credentials Mode ─────────────────────────────────

async function getAccessToken(): Promise<string> {
  const now = Date.now()

  // Return cached token if still valid (with 60s buffer)
  if (tokenCache && tokenCache.expiresAt - 60000 > now) {
    return tokenCache.accessToken
  }

  // Try refresh token first if available and not expired
  if (tokenCache?.refreshToken) {
    try {
      const refreshed = await refreshAccessToken(tokenCache.refreshToken)
      if (refreshed) return refreshed
    } catch {
      // Fall through to full re-auth
    }
  }

  // Full authentication
  console.log("[Omada] Authenticating via client credentials...")

  const res = await omadaFetch(
    `/openapi/authorize/token?grant_type=client_credentials`,
    {
      method: "POST",
      body: JSON.stringify({
        omadacId:      OMADA_OMADAC_ID,
        client_id:     OMADA_CLIENT_ID,
        client_secret: OMADA_CLIENT_SECRET,
      }),
    }
  )

  const data = await res.json()

  if (data.errorCode !== 0) {
    throw new Error(`[Omada] Auth failed: ${data.msg} (code ${data.errorCode})`)
  }

  const { accessToken, refreshToken, expiresIn } = data.result
  tokenCache = {
    accessToken,
    refreshToken,
    expiresAt: now + expiresIn * 1000,
  }

  console.log(`[Omada] Token obtained, expires in ${expiresIn}s`)
  return accessToken
}

async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  const res = await omadaFetch(
    `/openapi/authorize/token?grant_type=refresh_token&refresh_token=${refreshToken}`,
    {
      method: "POST",
      body: JSON.stringify({
        client_id:     OMADA_CLIENT_ID,
        client_secret: OMADA_CLIENT_SECRET,
      }),
    }
  )

  const data = await res.json()
  if (data.errorCode !== 0) return null

  const { accessToken, refreshToken: newRefresh, expiresIn } = data.result
  tokenCache = {
    accessToken,
    refreshToken: newRefresh,
    expiresAt: Date.now() + expiresIn * 1000,
  }

  return accessToken
}

// ── Core API Calls ────────────────────────────────────────────────────────────

/**
 * Authorize a hotspot client after successful payment.
 * Called when a voucher is activated — grants the client internet access
 * for the purchased duration.
 *
 * Uses Omada's External Portal Authorization endpoint:
 * POST /openapi/v1/{omadacId}/hotspot/extPortal/auth
 *
 * @param clientMac   - Client MAC address (e.g. "AA:BB:CC:DD:EE:FF")
 * @param apMac       - AP MAC address (your EAP625 MAC: A8:29:48:31:8A:18)
 * @param ssidName    - WiFi network name (e.g. "Smartlink WiFi")
 * @param radioId     - Radio band: 0=2.4GHz, 1=5GHz
 * @param durationSec - Access duration in seconds
 * @param trafficMB   - Data limit in MB (0 = unlimited)
 */
export async function authorizeClient(
  clientMac: string,
  apMac: string,
  ssidName: string,
  radioId: number,
  durationSec: number,
  trafficMB: number = 0
): Promise<{ success: boolean; message: string }> {
  if (!isConfigured()) {
    console.warn("[Omada] Not configured — skipping client authorization (simulation mode)")
    return { success: true, message: "Simulation: client authorized (Omada not configured)" }
  }

  try {
    const token = await getAccessToken()

    const body: Record<string, unknown> = {
      clientMac: clientMac.replace(/[:-]/g, "").toUpperCase(),
      apMac:     apMac.replace(/[:-]/g, "").toUpperCase(),
      ssidName,
      radioId,
      authType:  2,           // 2 = time-based
      time:      durationSec,
    }

    // Add traffic limit if specified
    if (trafficMB > 0) {
      body.trafficQuota = trafficMB * 1024 * 1024  // bytes
    }

    const res = await omadaFetch(
      `/openapi/v1/${OMADA_OMADAC_ID}/hotspot/extPortal/auth`,
      {
        method: "POST",
        body: JSON.stringify(body),
      },
      token
    )

    const data = await res.json()

    if (data.errorCode === 0) {
      console.log(`[Omada] Client ${clientMac} authorized for ${durationSec}s`)
      return { success: true, message: `Client authorized for ${Math.round(durationSec / 3600)}h` }
    }

    // Handle token expiry
    if (data.errorCode === -44112 || data.errorCode === -44113) {
      console.warn("[Omada] Token expired, retrying...")
      tokenCache = null
      return authorizeClient(clientMac, apMac, ssidName, radioId, durationSec, trafficMB)
    }

    console.error(`[Omada] Auth failed: ${data.msg} (${data.errorCode})`)
    return { success: false, message: `Omada error: ${data.msg}` }
  } catch (err) {
    console.error("[Omada] Network error:", err)
    return { success: false, message: "Could not reach Omada controller" }
  }
}

/**
 * Unauthorize / kick a client from the hotspot.
 * Called when a voucher expires or is manually revoked.
 *
 * POST /openapi/v1/{omadacId}/hotspot/extPortal/unauth
 */
export async function unauthorizeClient(
  clientMac: string
): Promise<{ success: boolean; message: string }> {
  if (!isConfigured()) {
    return { success: true, message: "Simulation: client unauthorized" }
  }

  try {
    const token = await getAccessToken()

    const res = await omadaFetch(
      `/openapi/v1/${OMADA_OMADAC_ID}/hotspot/extPortal/unauth`,
      {
        method: "POST",
        body: JSON.stringify({
          clientMac: clientMac.replace(/[:-]/g, "").toUpperCase(),
        }),
      },
      token
    )

    const data = await res.json()
    if (data.errorCode === 0) {
      console.log(`[Omada] Client ${clientMac} unauthorized`)
      return { success: true, message: "Client unauthorized" }
    }

    return { success: false, message: `Omada error: ${data.msg}` }
  } catch (err) {
    console.error("[Omada] Unauth error:", err)
    return { success: false, message: "Could not reach Omada controller" }
  }
}

/**
 * Get list of currently connected hotspot clients.
 * Used for the admin "Clients" dashboard.
 *
 * GET /openapi/v1/{omadacId}/sites/{siteId}/hotspot/clients
 */
export async function getConnectedClients(): Promise<{
  mac: string
  hostname: string
  ip: string
  uptime: number
  rxBytes: number
  txBytes: number
}[]> {
  if (!isConfigured()) {
    console.warn("[Omada] Not configured — returning empty client list")
    return []
  }

  try {
    const token = await getAccessToken()

    const res = await omadaFetch(
      `/openapi/v1/${OMADA_OMADAC_ID}/sites/${OMADA_SITE_ID}/hotspot/clients?pageSize=100&page=1`,
      { method: "GET" },
      token
    )

    const data = await res.json()
    if (data.errorCode !== 0) return []

    return (data.result?.data ?? []).map((c: Record<string, unknown>) => ({
      mac:      c.mac as string,
      hostname: (c.hostname ?? c.name ?? "Unknown") as string,
      ip:       (c.ip ?? "") as string,
      uptime:   (c.uptime ?? 0) as number,
      rxBytes:  (c.downPacket ?? 0) as number,
      txBytes:  (c.upPacket ?? 0) as number,
    }))
  } catch {
    return []
  }
}

/**
 * Get AP device info (EAP625 status).
 * Useful for the admin dashboard to show AP health.
 */
export async function getAPStatus(): Promise<{
  name: string
  mac: string
  status: string
  clients: number
  cpu: number
  mem: number
} | null> {
  if (!isConfigured()) return null

  try {
    const token = await getAccessToken()

    const res = await omadaFetch(
      `/openapi/v1/${OMADA_OMADAC_ID}/sites/${OMADA_SITE_ID}/aps?pageSize=10&page=1`,
      { method: "GET" },
      token
    )

    const data = await res.json()
    if (data.errorCode !== 0) return null

    const ap = data.result?.data?.[0]
    if (!ap) return null

    return {
      name:    ap.name ?? "EAP625",
      mac:     ap.mac ?? "",
      status:  ap.status === 0 ? "connected" : "disconnected",
      clients: ap.clientNum ?? 0,
      cpu:     ap.cpuUtil ?? 0,
      mem:     ap.memUtil ?? 0,
    }
  } catch {
    return null
  }
}
