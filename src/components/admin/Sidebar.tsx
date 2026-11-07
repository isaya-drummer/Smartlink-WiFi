"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import {
  LayoutDashboard,
  Package,
  Ticket,
  CreditCard,
  Users,
  Settings,
  MessageCircle,
  FileBarChart,
  X,
} from "lucide-react"
import SmartLinkLogo from "@/components/SmartLinkLogoThemed"

const navLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/bundles", label: "Bundles", icon: Package, exact: false },
  { href: "/admin/vouchers", label: "Vouchers", icon: Ticket, exact: false },
  {
    href: "/admin/payments",
    label: "Payments",
    icon: CreditCard,
    exact: false,
  },
  { href: "/admin/clients", label: "Clients", icon: Users, exact: false },
  { href: "/admin/reports", label: "Reports", icon: FileBarChart, exact: false },
  { href: "/admin/chat", label: "Chat", icon: MessageCircle, exact: false },
  { href: "/admin/settings", label: "Settings", icon: Settings, exact: false },
]

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const res = await fetch("/api/chat/unread")
        if (!active) return
        if (res.ok) {
          const data = await res.json()
          setUnread(data?.data?.unread ?? 0)
        }
      } catch {
        // ignore transient errors
      }
    }
    load()
    const interval = setInterval(load, 30000)
    return () => {
      active = false
      clearInterval(interval)
    }
  }, [])

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href)
  }

  return (
    <aside
      className="admin-sidebar flex flex-col h-full w-64 flex-shrink-0"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      {/* Logo + mobile close button */}
      <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: "var(--border-color)" }}>
        <SmartLinkLogo size="sm" />
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav Links */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navLinks.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact)
          return (
            <Link
              key={href}
              href={href}
              onClick={() => onClose?.()}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all`}
              style={
                active
                  ? {
                      borderLeft: "3px solid #c8870a",
                      paddingLeft: "calc(0.75rem - 3px)",
                      backgroundColor: "rgba(200,135,10,0.10)",
                      color: "#c8870a",
                    }
                  : { color: "var(--text-secondary)" }
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {label}
              {href === "/admin/chat" && unread > 0 && (
                <span
                  className="ml-auto rounded-full text-xs font-bold flex items-center justify-center"
                  style={{
                    backgroundColor: "var(--accent)",
                    color: "var(--bg-primary)",
                    minWidth: "1.25rem",
                    height: "1.25rem",
                    padding: "0 0.4rem",
                  }}
                >
                  {unread > 99 ? "99+" : unread}
                </span>
              )}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
