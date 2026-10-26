export interface ActiveConnection {
  mac: string
  ip: string
  uptime: string
  bytesIn: number
  bytesOut: number
}

/**
 * Adds a voucher to the MikroTik hotspot user list.
 *
 * TODO: Replace stub with real MikroTik RouterOS API integration.
 * Use the `node-routeros` package:
 *   1. npm install node-routeros
 *   2. Connect via: new RouterOSAPI({ host, user, password, port: 8728 })
 *   3. Call: api.write('/ip/hotspot/user/add', [
 *        '=name=' + code,
 *        '=password=' + code,
 *        '=limit-uptime=' + durationHours + 'h',
 *        '=limit-bytes-total=' + (dataLimitMB * 1024 * 1024),
 *      ])
 */
export async function addVoucher(
  code: string,
  durationHours: number,
  dataLimitMB: number
): Promise<{ success: boolean; message: string }> {
  console.log(
    `[MikroTik] TODO: Add hotspot user with code=${code}, duration=${durationHours}h, dataLimit=${dataLimitMB}MB`
  )

  // Mock response
  return {
    success: true,
    message: `Voucher ${code} added to MikroTik hotspot (mock)`,
  }
}

/**
 * Removes a voucher from the MikroTik hotspot user list.
 *
 * TODO: Replace stub with real MikroTik RouterOS API integration.
 * Use the `node-routeros` package:
 *   1. Find the user: api.write('/ip/hotspot/user/print', ['?name=' + code])
 *   2. Remove by ID: api.write('/ip/hotspot/user/remove', ['=.id=' + userId])
 */
export async function removeVoucher(
  code: string
): Promise<{ success: boolean; message: string }> {
  console.log(`[MikroTik] TODO: Remove hotspot user with code=${code}`)

  // Mock response
  return {
    success: true,
    message: `Voucher ${code} removed from MikroTik hotspot (mock)`,
  }
}

/**
 * Gets the list of currently active connections on the MikroTik hotspot.
 *
 * TODO: Replace stub with real MikroTik RouterOS API integration.
 * Use the `node-routeros` package:
 *   1. api.write('/ip/hotspot/active/print')
 *   2. Map results to ActiveConnection objects
 */
export async function getActiveConnections(): Promise<ActiveConnection[]> {
  console.log(`[MikroTik] TODO: Get active hotspot connections`)

  // Mock response
  return [
    {
      mac: "AA:BB:CC:DD:EE:FF",
      ip: "192.168.88.100",
      uptime: "1h30m",
      bytesIn: 52428800,
      bytesOut: 10485760,
    },
  ]
}
