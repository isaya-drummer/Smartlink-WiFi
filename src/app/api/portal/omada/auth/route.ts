/**
 * Omada External Portal Authorization Callback
 *
 * The EAP625 redirects unauthenticated clients to:
 *   https://your-domain.com/api/portal/omada/auth
 *   ?clientMac=XX:XX:XX:XX:XX:XX
 *   &apMac=A8:29:48:31:8A:18
 *   &ssidName=Smartlink+WiFi
 *   &radioId=1
 *   &redirectUrl=http://original-url.com
 *
 * This endpoint:
 * 1. Stores the client parameters in a short-lived session
 * 2. Redirects to the portal to collect payment
 * 3. After payment, authorizes the client on Omada
 *
 * Configure on EAP625:
 *   Wireless > SSID > Portal > External Web Portal
 *   URL: https://automatic-octo-parakeet.vercel.app/api/portal/omada/auth
 */

import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const clientMac  = searchParams.get("clientMac")  ?? searchParams.get("client_mac") ?? ""
  const apMac      = searchParams.get("apMac")       ?? searchParams.get("ap_mac")     ?? ""
  const ssidName   = searchParams.get("ssidName")    ?? searchParams.get("ssid")       ?? "Smartlink WiFi"
  const radioId    = searchParams.get("radioId")     ?? "1"
  const redirectUrl = searchParams.get("redirectUrl") ?? searchParams.get("redirect")  ?? "/"

  console.log(`[Omada Portal] Client connecting: MAC=${clientMac} AP=${apMac} SSID=${ssidName}`)

  // Build portal URL with client info as query params
  // The portal page uses these to know which client to authorize after payment
  const portalUrl = new URL(
    `/portal?clientMac=${encodeURIComponent(clientMac)}&apMac=${encodeURIComponent(apMac)}&ssid=${encodeURIComponent(ssidName)}&radioId=${radioId}&redirect=${encodeURIComponent(redirectUrl)}`,
    request.nextUrl.origin
  )

  return NextResponse.redirect(portalUrl.toString())
}
