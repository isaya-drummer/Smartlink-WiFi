"use client"

import { useEffect, useState } from "react"
import { RefreshCw } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"

interface Client {
  clientName: string
  clientPhone: string
  totalPurchases: number
  totalSpent: number
  lastSeen: string | null
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = "Smartlink WiFi â€” Admin: Clients"
    fetchClients()
  }, [])

  async function fetchClients() {
    setLoading(true)
    const res = await fetch("/api/admin/clients")
    if (res.ok) {
      const data = await res.json()
      setClients(data)
    }
    setLoading(false)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Clients</h1>
          <p className="text-sm text-gray-400 mt-1">
            Overview of all registered clients
          </p>
        </div>
        <button
          onClick={fetchClients}
          className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="text-gray-400 py-8 text-center">Loading...</div>
      ) : (
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: "1px solid var(--border-color)" }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "var(--bg-tertiary)" }}>
                  {[
                    "Name",
                    "Phone",
                    "Total Purchases",
                    "Total Spent",
                    "Last Seen",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left font-semibold text-gray-400 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clients.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      No clients found.
                    </td>
                  </tr>
                ) : (
                  clients.map((c, idx) => (
                    <tr
                      key={c.clientPhone}
                      style={{
                        backgroundColor:
                          idx % 2 === 0 ? "var(--bg-secondary)" : "var(--bg-tertiary)",
                        borderTop: "1px solid var(--border-color)",
                      }}
                    >
                      <td className="px-4 py-3 text-white font-medium">
                        {c.clientName}
                      </td>
                      <td className="px-4 py-3 text-gray-300">
                        {c.clientPhone}
                      </td>
                      <td className="px-4 py-3 text-white text-center">
                        {c.totalPurchases}
                      </td>
                      <td className="px-4 py-3 text-white">
                        {formatCurrency(c.totalSpent)}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                        {c.lastSeen ? formatDate(c.lastSeen) : "â€”"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
