"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { Bell, CreditCard, LogOut, UserRound, Users } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import ThemeToggle from "@/components/admin/ThemeToggle"

interface NotificationItem {
  id: string
  type: "transaction" | "active_client"
  title: string
  detail: string
  href: string
  createdAt: string
}

const SEEN_KEY = "smartlink-admin-notifications-seen"

function initials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email || "A"
  const parts = source.split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.max(0, Math.floor(diff / 60000))
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export default function AdminTopBar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const profileHref = pathname.startsWith("/super-admin")
    ? "/super-admin/profile"
    : "/admin/profile"

  const [transactions, setTransactions] = useState<NotificationItem[]>([])
  const [activeClients, setActiveClients] = useState<NotificationItem[]>([])
  const [seenAt, setSeenAt] = useState<number>(() => {
    if (typeof window === "undefined") return Date.now()
    const stored = window.localStorage.getItem(SEEN_KEY)
    return stored ? Number(stored) : 0
  })
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const res = await fetch("/api/admin/notifications")
        if (!res.ok || !active) return
        const data = await res.json()
        setTransactions(data.transactions ?? [])
        setActiveClients(data.activeClients ?? [])
      } catch {
        // ignore polling errors
      }
    }
    load()
    const interval = setInterval(load, 20000)
    return () => {
      active = false
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    let active = true
    async function loadProfile() {
      try {
        const res = await fetch("/api/admin/profile")
        if (!res.ok || !active) return
        const data = await res.json()
        setAvatarUrl(data.avatarUrl ?? null)
      } catch {
        // ignore
      }
    }
    loadProfile()
    return () => { active = false }
  }, [session?.user?.email])

  const items = useMemo(
    () =>
      [...transactions, ...activeClients].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [transactions, activeClients]
  )

  const unread = items.filter((item) => new Date(item.createdAt).getTime() > seenAt).length
  const user = session?.user
  const displayName = user?.name || "Admin"

  function markSeen() {
    const now = Date.now()
    setSeenAt(now)
    window.localStorage.setItem(SEEN_KEY, String(now))
  }

  return (
    <div className="ml-auto flex items-center gap-2">
      <ThemeToggle />

      <DropdownMenu
        onOpenChange={(open) => {
          if (open) markSeen()
        }}
      >
        <DropdownMenuTrigger asChild>
          <button
            className="relative p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unread > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 min-w-[1.1rem] h-[1.1rem] px-1 rounded-full text-[10px] font-bold flex items-center justify-center"
                style={{ backgroundColor: "#00b4ff", color: "#0a1628" }}
              >
                {unread > 99 ? "99+" : unread}
              </span>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-[22rem] p-0"
          style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)", color: "#fff" }}
        >
          <DropdownMenuLabel className="px-4 py-3 text-white">
            Notifications
            <p className="text-xs font-normal text-gray-400 mt-0.5">
              Transactions and active clients
            </p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator style={{ backgroundColor: "var(--border-color)" }} />
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-6 text-sm text-gray-400 text-center">
                No recent activity yet.
              </p>
            ) : (
              items.slice(0, 12).map((item) => (
                <DropdownMenuItem key={`${item.type}-${item.id}`} asChild className="p-0">
                  <Link
                    href={item.href}
                    className="flex items-start gap-3 px-4 py-3 text-sm hover:bg-white/5"
                  >
                    <span
                      className="mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: "rgba(0,180,255,0.12)",
                        color: "#00b4ff",
                      }}
                    >
                      {item.type === "transaction" ? (
                        <CreditCard className="w-4 h-4" />
                      ) : (
                        <Users className="w-4 h-4" />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-white leading-snug">{item.title}</span>
                      <span className="block text-xs text-gray-400 mt-0.5">{item.detail}</span>
                      <span className="block text-[11px] text-gray-500 mt-1">
                        {timeAgo(item.createdAt)}
                      </span>
                    </span>
                  </Link>
                </DropdownMenuItem>
              ))
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Open profile menu"
          >
            {avatarUrl ? (
              <img src={avatarUrl} className="w-8 h-8 rounded-full object-cover" alt="Profile" />
            ) : (
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: "rgba(0,180,255,0.2)", color: "#00b4ff" }}
              >
                {initials(user?.name, user?.email)}
              </span>
            )}
            <span className="hidden sm:block text-left">
              <span className="block text-sm font-medium text-white leading-tight max-w-[10rem] truncate">
                {displayName}
              </span>
              <span className="block text-[11px] text-gray-400 leading-tight">
                {user?.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
              </span>
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-56"
          style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)", color: "#fff" }}
        >
          <DropdownMenuLabel className="font-normal">
            <p className="text-sm font-medium text-white">{displayName}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator style={{ backgroundColor: "var(--border-color)" }} />
          <DropdownMenuItem asChild>
            <Link href={profileHref} className="flex items-center gap-2 cursor-pointer">
              <UserRound className="w-4 h-4" />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator style={{ backgroundColor: "var(--border-color)" }} />
          <DropdownMenuItem
            className="cursor-pointer text-red-300 focus:text-red-200"
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
