"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  LayoutDashboard,
  ShieldCheck,
  ClipboardList,
  Settings2,
  MessageCircle,
  Star,
  ExternalLink,
  LogOut,
} from "lucide-react"
import SmartLinkLogo from "@/components/SmartLinkLogo"

const navLinks = [
  { href: "/super-admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/super-admin/admins", label: "Admins", icon: ShieldCheck, exact: false },
  { href: "/super-admin/audit", label: "Audit Log", icon: ClipboardList, exact: false },
  { href: "/super-admin/ratings", label: "Ratings", icon: Star, exact: false },
  { href: "/super-admin/system", label: "System", icon: Settings2, exact: false },
  { href: "/admin/chat", label: "Chat", icon: MessageCircle, exact: false },
]

export default function SuperAdminSidebar() {
  const pathname = usePathname()

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href)
  }

  return (
    <aside
      className="flex flex-col h-full w-64 flex-shrink-0"
      style={{ backgroundColor: "#0a1628" }}
    >
      {/* Logo + Badge */}
      <div className="p-6 border-b space-y-3" style={{ borderColor: "#1e3a5f" }}>
        <SmartLinkLogo size="sm" />
        <span
          className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-widest"
          style={{ backgroundColor: "rgba(0,180,255,0.15)", color: "#00b4ff" }}
        >
          SUPER ADMIN
        </span>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navLinks.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active ? "text-cyan-400" : "text-gray-400 hover:text-white"
              }`}
              style={
                active
                  ? {
                      borderLeft: "3px solid #00b4ff",
                      paddingLeft: "calc(0.75rem - 3px)",
                      backgroundColor: "rgba(0, 180, 255, 0.08)",
                      color: "#00b4ff",
                    }
                  : {}
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {label}
            </Link>
          )
        })}

        {/* Divider */}
        <div className="my-2 border-t" style={{ borderColor: "#1e3a5f" }} />

        {/* Quick link to Admin Panel */}
        <Link
          href="/admin"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-all"
        >
          <ExternalLink className="w-5 h-5 flex-shrink-0" />
          Admin Panel
        </Link>
      </nav>

      {/* Sign Out */}
      <div className="p-3 border-t" style={{ borderColor: "#1e3a5f" }}>
        <button
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
