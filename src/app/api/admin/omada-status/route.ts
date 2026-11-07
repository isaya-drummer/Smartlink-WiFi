/**
 * GET /api/admin/omada-status
 * Returns Omada connection status for the admin dashboard.
 * Shows whether the AP is reachable and how many clients are connected.
 */

import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getAPStatus, getConnectedClients } from "@/lib/omada"

export async function GET() {
  const session = await auth()
  const u = session?.user as { role?: string } | undefined
  if (!u || (u.role !== "ADMIN" && u.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const configured = !!(
    process.env.OMADA_BASE_URL &&
    process.env.OMADA_CLIENT_ID &&
    process.env.OMADA_OMADAC_ID
  )

  if (!configured) {
    return NextResponse.json({
      configured: false,
      message: "Omada not configured — running in simulation mode",
      ap: null,
      connectedClients: 0,
    })
  }

  try {
    const [ap, clients] = await Promise.all([
      getAPStatus(),
      getConnectedClients(),
    ])

    return NextResponse.json({
      configured: true,
      ap,
      connectedClients: clients.length,
      clients,
      baseUrl: process.env.OMADA_BASE_URL,
    })
  } catch (err) {
    return NextResponse.json({
      configured: true,
      error: "Could not reach Omada controller",
      message: String(err),
      ap: null,
      connectedClients: 0,
    })
  }
}
