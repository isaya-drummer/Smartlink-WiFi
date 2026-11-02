"use client"
import { useState } from "react"
import { SessionProvider } from "next-auth/react"
import { Menu } from "lucide-react"
import Sidebar from "@/components/admin/Sidebar"
import SmartLinkLogo from "@/components/SmartLinkLogoThemed"
import AdminTopBar from "@/components/admin/AdminTopBar"
import { ThemeProvider, useTheme } from "@/context/ThemeContext"
import { LanguageProvider } from "@/context/LanguageContext"

function AdminShellInner({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme()
  const [open, setOpen] = useState(false)
  return (
    <div className={`flex h-screen overflow-hidden ${theme}`} style={{backgroundColor: "var(--bg-primary)"}}>
      {open && <div className="fixed inset-0 z-20 bg-black/60 md:hidden" onClick={() => setOpen(false)} />}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:flex md:flex-shrink-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Sidebar onClose={() => setOpen(false)} />
      </div>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b flex-shrink-0" style={{backgroundColor: "var(--bg-primary)", borderColor: "var(--border-color)"}}>
          <button onClick={() => setOpen(true)} className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors" aria-label="Open menu"><Menu className="w-5 h-5" /></button>
          <div className="md:hidden"><SmartLinkLogo size="sm" /></div>
          <AdminTopBar />
        </div>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <SessionProvider>
          <AdminShellInner>{children}</AdminShellInner>
        </SessionProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}
