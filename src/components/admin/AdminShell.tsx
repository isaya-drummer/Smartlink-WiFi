"use client"

import { useState } from "react"
import { SessionProvider } from "next-auth/react"
import { Menu } from "lucide-react"
import Sidebar from "@/components/admin/Sidebar"
import SmartLinkLogo from "@/components/SmartLinkLogo"

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <SessionProvider>
      <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "#0a1628" }}>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/60 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar — hidden off-screen on mobile, always visible on md+ */}
      <div
        className={`
          fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0 md:flex md:flex-shrink-0
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <Sidebar onClose={() => setOpen(false)} />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile top bar */}
        <div
          className="md:hidden flex items-center gap-3 px-4 py-3 border-b flex-shrink-0"
          style={{ backgroundColor: "#0a1628", borderColor: "#1e3a5f" }}
        >
          <button
            onClick={() => setOpen(true)}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <SmartLinkLogo size="sm" />
        </div>

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
    </SessionProvider>
  )
}
