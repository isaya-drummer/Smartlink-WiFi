"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import {
  Send, PencilLine, Search, Users, X, Plus, Check,
  Paperclip, Smile, Trash2, ChevronLeft,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Participant { id: string; name: string; role: string }

interface LastMessage {
  id: string; content: string; type: string; senderId: string
  senderName: string; createdAt: string; deleted: boolean
  fileName?: string | null
}

interface Conversation {
  id: string; type: "DIRECT" | "GROUP"; name: string | null
  description: string | null; avatarUrl: string | null
  updatedAt: string; participants: Participant[]
  lastMessage: LastMessage | null; unreadCount: number
}

interface Reaction {
  id: string; emoji: string; userId: string
  user: { id: string; name: string }
}

interface Message {
  id: string; conversationId: string; senderId: string
  type: "TEXT" | "IMAGE" | "FILE" | "EMOJI"; content: string
  fileName: string | null; fileSize: number | null
  deleted: boolean; createdAt: string
  sender: { id: string; name: string; role: string }
  reactions: Reaction[]
}

interface AdminUser { id: string; name: string; email: string; role: string }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
}

function hhmm(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
}

function dayLabel(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const yesterday = today - 86400000
  const md = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  if (md === today) return "Today"
  if (md === yesterday) return "Yesterday"
  return d.toLocaleDateString()
}

function convName(conv: Conversation, myId: string) {
  if (conv.type === "GROUP") return conv.name ?? "Group"
  const other = conv.participants.find((p) => p.id !== myId)
  return other?.name ?? "Direct Message"
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

const QUICK_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏", "🔥", "✅"]
const EMOJI_GRID = [
  "😀","😂","😍","🥳","😎","🤔","😅","🙄",
  "👍","❤️","🔥","✅","🎉","💪","🙏","😢",
  "😮","🤣","💯","👏",
]

// ─── Avatar Component ─────────────────────────────────────────────────────────

function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "w-7 h-7 text-[10px]", md: "w-9 h-9 text-xs", lg: "w-11 h-11 text-sm" }
  return (
    <div className={`${sizes[size]} rounded-full flex items-center justify-center font-semibold flex-shrink-0`}
      style={{ backgroundColor: "var(--border-color)", color: "#00b4ff" }}>
      {initials(name)}
    </div>
  )
}

// ─── New Chat Dialog ──────────────────────────────────────────────────────────

function NewChatDialog({
  users, myId, onClose, onCreate,
}: {
  users: AdminUser[]; myId: string
  onClose: () => void
  onCreate: (conv: Conversation) => void
}) {
  const [tab, setTab] = useState<"direct" | "group">("direct")
  const [selectedId, setSelectedId] = useState<string>("")
  const [groupName, setGroupName] = useState("")
  const [groupDesc, setGroupDesc] = useState("")
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const others = users.filter((u) => u.id !== myId)

  async function create() {
    setLoading(true)
    try {
      const body = tab === "direct"
        ? { type: "DIRECT", participantIds: [selectedId] }
        : { type: "GROUP", name: groupName, description: groupDesc, participantIds: selected }
      const res = await fetch("/api/chat/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        const d = await res.json()
        onCreate(d.data)
        onClose()
      }
    } finally {
      setLoading(false)
    }
  }

  const canCreate = tab === "direct" ? !!selectedId : groupName.trim().length > 0 && selected.length > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.7)" }}>
      <div className="w-full max-w-md rounded-2xl p-6 space-y-5" style={{ backgroundColor: "var(--bg-primary)", border: "1px solid #1e3a5f" }}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">New Conversation</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"><X className="w-5 h-5" /></button>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl overflow-hidden" style={{ border: "1px solid #1e3a5f" }}>
          {(["direct", "group"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className="flex-1 py-2 text-sm font-medium transition-colors"
              style={{ backgroundColor: tab === t ? "#00b4ff" : "transparent", color: tab === t ? "#000" : "#9ca3af" }}>
              {t === "direct" ? "Direct Message" : "Group Chat"}
            </button>
          ))}
        </div>

        {tab === "direct" ? (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {others.map((u) => (
              <button key={u.id} onClick={() => setSelectedId(u.id)}
                className="w-full flex items-center gap-3 p-3 rounded-xl transition-colors"
                style={{ backgroundColor: selectedId === u.id ? "rgba(0,180,255,0.15)" : "var(--bg-secondary)", border: `1px solid ${selectedId === u.id ? "#00b4ff" : "var(--border-color)"}` }}>
                <Avatar name={u.name} size="sm" />
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-white">{u.name}</p>
                  <p className="text-xs text-gray-400">{u.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}</p>
                </div>
                {selectedId === u.id && <Check className="w-4 h-4" style={{ color: "#00b4ff" }} />}
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <input value={groupName} onChange={(e) => setGroupName(e.target.value)}
              placeholder="Group name *" className="w-full px-4 py-2.5 rounded-xl text-sm outline-none text-white"
              style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid #1e3a5f" }} />
            <input value={groupDesc} onChange={(e) => setGroupDesc(e.target.value)}
              placeholder="Description (optional)" className="w-full px-4 py-2.5 rounded-xl text-sm outline-none text-white"
              style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid #1e3a5f" }} />
            <p className="text-xs text-gray-400">Select members:</p>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {others.map((u) => {
                const on = selected.includes(u.id)
                return (
                  <button key={u.id} onClick={() => setSelected(on ? selected.filter((id) => id !== u.id) : [...selected, u.id])}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl transition-colors"
                    style={{ backgroundColor: on ? "rgba(0,180,255,0.1)" : "var(--bg-secondary)", border: `1px solid ${on ? "#00b4ff" : "var(--border-color)"}` }}>
                    <Avatar name={u.name} size="sm" />
                    <span className="flex-1 text-left text-sm text-white">{u.name}</span>
                    {on && <Check className="w-4 h-4" style={{ color: "#00b4ff" }} />}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <button onClick={create} disabled={!canCreate || loading}
          className="w-full py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-opacity"
          style={{ background: "linear-gradient(to right, #00b4ff, #0066ff)" }}>
          {loading ? "Creating…" : "Create"}
        </button>
      </div>
    </div>
  )
}

// ─── Main Chat Page ───────────────────────────────────────────────────────────

export default function ChatPage() {
  const { data: session } = useSession()
  const myId = (session?.user as { id?: string } | undefined)?.id ?? ""
  const myName = (session?.user as { name?: string } | undefined)?.name ?? ""

  const [convs, setConvs] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState("")
  const [sending, setSending] = useState(false)
  const [showConvs, setShowConvs] = useState(false)
  const [showMembers, setShowMembers] = useState(false)
  const [newChatOpen, setNewChatOpen] = useState(false)
  const [allUsers, setAllUsers] = useState<AdminUser[]>([])
  const [search, setSearch] = useState("")
  const [emojiOpen, setEmojiOpen] = useState(false)
  const [hoveredMsgId, setHoveredMsgId] = useState<string | null>(null)
  const [quickReactId, setQuickReactId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const feedRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const activeConv = convs.find((c) => c.id === activeId) ?? null

  // ── Fetch conversations ──────────────────────────────────────────────────
  const fetchConvs = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/conversations")
      if (res.ok) {
        const d = await res.json()
        setConvs(d.data?.items ?? [])
      }
    } catch { /* ignore */ }
  }, [])

  // ── Fetch messages ───────────────────────────────────────────────────────
  const fetchMessages = useCallback(async (convId: string) => {
    try {
      const res = await fetch(`/api/chat/messages?conversationId=${convId}&limit=60`)
      if (res.ok) {
        const d = await res.json()
        setMessages(d.data?.items ?? [])
      }
    } catch { /* ignore */ }
  }, [])

  // ── Initial load ─────────────────────────────────────────────────────────
  useEffect(() => {
    document.title = "SmartLink Digital — Chat"
    fetchConvs()
    fetch("/api/admin/users")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setAllUsers(d.data?.users ?? []) })
      .catch(() => {})
  }, [fetchConvs])

  // ── Select conversation ──────────────────────────────────────────────────
  useEffect(() => {
    if (activeId) fetchMessages(activeId)
  }, [activeId, fetchMessages])

  // ── Polling every 3s ────────────────────────────────────────────────────
  useEffect(() => {
    const poll = setInterval(() => {
      fetchConvs()
      if (activeId) fetchMessages(activeId)
    }, 3000)
    return () => clearInterval(poll)
  }, [activeId, fetchConvs, fetchMessages])

  // ── Auto-scroll ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight
  }, [messages])

  // ── Auto-resize textarea ─────────────────────────────────────────────────
  function autoResize() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = Math.min(el.scrollHeight, 120) + "px"
  }

  // ── Send text message ────────────────────────────────────────────────────
  async function sendMessage() {
    if (!activeId || !text.trim() || sending) return
    setSending(true)
    const content = text.trim()
    setText("")
    if (textareaRef.current) textareaRef.current.style.height = "auto"
    try {
      await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: activeId, content, type: "TEXT" }),
      })
      await fetchMessages(activeId)
      await fetchConvs()
    } finally {
      setSending(false)
    }
  }

  // ── Send emoji ───────────────────────────────────────────────────────────
  async function sendEmoji(emoji: string) {
    if (!activeId) return
    setEmojiOpen(false)
    await fetch("/api/chat/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: activeId, content: emoji, type: "EMOJI" }),
    })
    await fetchMessages(activeId)
  }

  // ── Upload file ──────────────────────────────────────────────────────────
  async function handleFileUpload(file: File) {
    if (!activeId) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/uploadthing", { method: "POST", body: fd })
      if (!res.ok) return
      const d = await res.json()
      const isImage = file.type.startsWith("image/")
      await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeId,
          content: d.data.url,
          type: isImage ? "IMAGE" : "FILE",
          fileName: d.data.name,
          fileSize: d.data.size,
        }),
      })
      await fetchMessages(activeId)
    } finally {
      setUploading(false)
    }
  }

  // ── Toggle reaction ──────────────────────────────────────────────────────
  async function toggleReaction(messageId: string, emoji: string) {
    await fetch("/api/chat/reactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageId, emoji }),
    })
    if (activeId) await fetchMessages(activeId)
  }

  // ── Delete message ───────────────────────────────────────────────────────
  async function deleteMessage(msgId: string) {
    await fetch(`/api/chat/messages/${msgId}`, { method: "PATCH" })
    if (activeId) await fetchMessages(activeId)
  }

  // ── Filtered conversations ───────────────────────────────────────────────
  const filteredConvs = convs.filter((c) =>
    convName(c, myId).toLowerCase().includes(search.toLowerCase())
  )

  // ── Build message feed with date separators ──────────────────────────────
  const feed: React.ReactNode[] = []
  let lastDay = ""
  messages.forEach((m) => {
    const label = dayLabel(m.createdAt)
    if (label !== lastDay) {
      feed.push(
        <div key={`sep-${m.id}`} className="flex justify-center my-4">
          <span className="px-3 py-1 rounded-full text-xs" style={{ backgroundColor: "var(--bg-tertiary)", color: "#9ca3af" }}>{label}</span>
        </div>
      )
      lastDay = label
    }

    const own = m.senderId === myId
    const grouped = m.reactions.reduce<Record<string, { count: number; mine: boolean }>>((acc, r) => {
      if (!acc[r.emoji]) acc[r.emoji] = { count: 0, mine: false }
      acc[r.emoji].count++
      if (r.userId === myId) acc[r.emoji].mine = true
      return acc
    }, {})

    feed.push(
      <div key={m.id}
        className={`flex ${own ? "justify-end" : "justify-start"} mb-1 group`}
        onMouseEnter={() => setHoveredMsgId(m.id)}
        onMouseLeave={() => { setHoveredMsgId(null); setQuickReactId(null) }}>
        {!own && <div className="mr-2 mt-1"><Avatar name={m.sender.name} size="sm" /></div>}
        <div className={`max-w-[70%] flex flex-col ${own ? "items-end" : "items-start"}`}>
          {!own && (
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-xs font-semibold" style={{ color: "#00b4ff" }}>{m.sender.name}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                style={{ backgroundColor: m.sender.role === "SUPER_ADMIN" ? "#9333ea" : "#0066ff", color: "#fff" }}>
                {m.sender.role === "SUPER_ADMIN" ? "SA" : "AD"}
              </span>
            </div>
          )}

          <div className="relative">
            {/* Message bubble */}
            <div className="px-3.5 py-2 rounded-2xl text-sm"
              style={{ backgroundColor: own ? "#00b4ff" : "var(--border-color)", color: "#fff",
                borderRadius: own ? "18px 18px 4px 18px" : "18px 18px 18px 4px" }}>
              {m.deleted ? (
                <span className="italic text-white/50">Message deleted</span>
              ) : m.type === "IMAGE" ? (
                <img src={m.content} alt="image" className="max-w-[200px] rounded-xl cursor-pointer" onClick={() => window.open(m.content, "_blank")} />
              ) : m.type === "FILE" ? (
                <a href={m.content} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <Paperclip className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm underline truncate max-w-[160px]">{m.fileName ?? "File"}</span>
                  {m.fileSize && <span className="text-[10px] opacity-70">{formatSize(m.fileSize)}</span>}
                </a>
              ) : m.type === "EMOJI" ? (
                <span className="text-3xl">{m.content}</span>
              ) : (
                <span className="whitespace-pre-wrap break-words">{m.content}</span>
              )}
              <div className="text-[10px] mt-1 text-right opacity-70">{hhmm(m.createdAt)}</div>
            </div>

            {/* Hover toolbar */}
            {hoveredMsgId === m.id && !m.deleted && (
              <div className={`absolute top-0 ${own ? "right-full mr-2" : "left-full ml-2"} flex items-center gap-1`}>
                <button onClick={() => setQuickReactId(quickReactId === m.id ? null : m.id)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white transition-colors"
                  style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid #1e3a5f" }}>
                  <Smile className="w-3.5 h-3.5" />
                </button>
                {own && (
                  <button onClick={() => deleteMessage(m.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                    style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid #1e3a5f" }}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Quick react picker */}
            {quickReactId === m.id && (
              <div className={`absolute z-10 flex gap-1 p-2 rounded-2xl shadow-xl ${own ? "right-0" : "left-0"}`}
                style={{ backgroundColor: "var(--bg-primary)", border: "1px solid #1e3a5f", bottom: "calc(100% + 8px)" }}>
                {QUICK_EMOJIS.map((e) => (
                  <button key={e} onClick={() => { toggleReaction(m.id, e); setQuickReactId(null) }}
                    className="text-lg hover:scale-125 transition-transform">{e}</button>
                ))}
              </div>
            )}
          </div>

          {/* Reactions bar */}
          {Object.keys(grouped).length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {Object.entries(grouped).map(([emoji, { count, mine }]) => (
                <button key={emoji} onClick={() => toggleReaction(m.id, emoji)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors"
                  style={{ backgroundColor: mine ? "rgba(0,180,255,0.2)" : "var(--bg-tertiary)",
                    border: `1px solid ${mine ? "#00b4ff" : "var(--border-color)"}`, color: "#fff" }}>
                  <span>{emoji}</span><span>{count}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  })

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-full overflow-hidden" style={{ backgroundColor: "var(--bg-primary)" }}>

      {/* ── Conversations sidebar ── */}
      <aside className={`
        ${showConvs ? "flex" : "hidden"} md:flex
        w-full md:w-72 flex-shrink-0 flex-col border-r absolute md:relative inset-0 z-10 md:z-auto
      `} style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-color)" }}>

        {/* Sidebar header */}
        <div className="flex items-center justify-between px-4 py-4 border-b flex-shrink-0" style={{ borderColor: "var(--border-color)" }}>
          <h2 className="text-lg font-bold text-white">Messages</h2>
          <div className="flex items-center gap-2">
            <button onClick={() => setNewChatOpen(true)}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
              <PencilLine className="w-5 h-5" />
            </button>
            <button onClick={() => setShowConvs(false)} className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-3 py-2 flex-shrink-0">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid #1e3a5f" }}>
            <Search className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations…" className="flex-1 text-sm bg-transparent text-white outline-none placeholder-gray-500" />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto py-1">
          {filteredConvs.length === 0 && (
            <div className="py-8 text-center text-gray-500 text-sm">No conversations yet</div>
          )}
          {filteredConvs.map((c) => {
            const name = convName(c, myId)
            const isActive = c.id === activeId
            const preview = c.lastMessage?.deleted ? "Message deleted"
              : c.lastMessage?.type === "IMAGE" ? "📷 Image"
              : c.lastMessage?.type === "FILE" ? `📎 ${c.lastMessage.fileName ?? "File"}`
              : c.lastMessage?.type === "EMOJI" ? c.lastMessage.content
              : (c.lastMessage?.content ?? "")
            return (
              <button key={c.id} onClick={() => { setActiveId(c.id); setShowConvs(false) }}
                className="w-full flex items-center gap-3 px-3 py-3 transition-colors text-left"
                style={{ backgroundColor: isActive ? "rgba(0,180,255,0.08)" : "transparent",
                  borderLeft: isActive ? "3px solid #00b4ff" : "3px solid transparent" }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0"
                  style={{ backgroundColor: "var(--border-color)", color: "#00b4ff" }}>
                  {initials(name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-sm font-semibold text-white truncate">{name}</span>
                    {c.lastMessage && <span className="text-[10px] text-gray-500 flex-shrink-0">{hhmm(c.lastMessage.createdAt)}</span>}
                  </div>
                  <div className="flex items-center justify-between gap-1 mt-0.5">
                    <span className="text-xs text-gray-400 truncate">{preview.slice(0, 40)}</span>
                    {c.unreadCount > 0 && (
                      <span className="text-[10px] font-bold rounded-full px-1.5 py-0.5 flex-shrink-0"
                        style={{ backgroundColor: "#00b4ff", color: "var(--bg-primary)" }}>
                        {c.unreadCount > 99 ? "99+" : c.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </aside>

      {/* ── Message feed ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Feed header */}
        <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
          style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-color)" }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowConvs(true)} className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white">
              <ChevronLeft className="w-5 h-5" />
            </button>
            {activeConv ? (
              <>
                <Avatar name={convName(activeConv, myId)} size="md" />
                <div>
                  <p className="text-sm font-semibold text-white">{convName(activeConv, myId)}</p>
                  <p className="text-xs text-gray-400">
                    {activeConv.type === "GROUP" ? `${activeConv.participants.length} members` : "Direct message"}
                  </p>
                </div>
              </>
            ) : (
              <span className="text-sm text-gray-400">Select a conversation</span>
            )}
          </div>
          {activeConv && (
            <button onClick={() => setShowMembers(!showMembers)}
              className="p-2 rounded-lg transition-colors"
              style={{ backgroundColor: showMembers ? "rgba(0,180,255,0.15)" : "transparent", color: showMembers ? "#00b4ff" : "#9ca3af" }}>
              <Users className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Messages area */}
        {!activeConv ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: "rgba(0,180,255,0.1)" }}>
              <PencilLine className="w-7 h-7" style={{ color: "#00b4ff" }} />
            </div>
            <p className="text-white font-semibold mb-1">Your messages</p>
            <p className="text-gray-400 text-sm">Select a conversation or start a new one</p>
            <button onClick={() => setNewChatOpen(true)}
              className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: "linear-gradient(to right, #00b4ff, #0066ff)" }}>
              <Plus className="w-4 h-4" /> New Conversation
            </button>
          </div>
        ) : (
          <>
            <div ref={feedRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                  No messages yet — say hello!
                </div>
              ) : feed}
            </div>

            {/* Emoji grid picker */}
            {emojiOpen && (
              <div className="px-4 py-2 border-t" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-primary)" }}>
                <div className="grid grid-cols-10 gap-1">
                  {EMOJI_GRID.map((e) => (
                    <button key={e} onClick={() => { setText((t) => t + e); setEmojiOpen(false); textareaRef.current?.focus() }}
                      className="text-xl hover:scale-125 transition-transform p-1">{e}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Input bar */}
            <div className="flex items-end gap-2 px-4 py-3 border-t flex-shrink-0"
              style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-color)" }}>
              {/* File upload */}
              <input ref={fileInputRef} type="file" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); e.target.value = "" }} />
              <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                className="p-2.5 rounded-xl text-gray-400 hover:text-white transition-colors flex-shrink-0 disabled:opacity-50"
                style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid #1e3a5f" }}>
                <Paperclip className="w-4 h-4" />
              </button>

              {/* Emoji toggle */}
              <button onClick={() => setEmojiOpen(!emojiOpen)}
                className="p-2.5 rounded-xl transition-colors flex-shrink-0"
                style={{ backgroundColor: emojiOpen ? "rgba(0,180,255,0.15)" : "var(--bg-secondary)",
                  border: `1px solid ${emojiOpen ? "#00b4ff" : "var(--border-color)"}`,
                  color: emojiOpen ? "#00b4ff" : "#9ca3af" }}>
                <Smile className="w-4 h-4" />
              </button>

              {/* Textarea */}
              <textarea ref={textareaRef} value={text}
                onChange={(e) => { setText(e.target.value); autoResize() }}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                placeholder="Type a message…"
                rows={1} className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none resize-none"
                style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid #1e3a5f", color: "#fff",
                  maxHeight: "120px", overflowY: "auto" }} />

              {/* Send */}
              <button onClick={sendMessage} disabled={!text.trim() || sending}
                className="p-2.5 rounded-xl text-sm font-medium disabled:opacity-50 flex-shrink-0"
                style={{ backgroundColor: "#00b4ff", color: "#000" }}>
                <Send className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Members panel — slide-over on mobile, inline on desktop */}
      {showMembers && activeConv && (
        <>
          {/* Dark overlay on mobile */}
          <div
            className="fixed inset-0 z-20 bg-black/60 md:hidden"
            onClick={() => setShowMembers(false)}
          />
          <aside
            className="fixed right-0 top-0 h-full z-30 w-56 flex flex-col border-l md:relative md:z-auto"
            style={{backgroundColor: "var(--bg-primary)", borderColor: "var(--border-color)"}}
          >
            <div className="px-4 py-4 border-b flex items-center justify-between" style={{borderColor: "var(--border-color)"}}>
              <h3 className="text-sm font-semibold" style={{color: "var(--text-primary)"}}>Members</h3>
              <button onClick={() => setShowMembers(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-2">
              {activeConv.participants.map((p) => (
                <div key={p.id} className="flex items-center gap-3 px-4 py-2.5">
                  <div className="relative">
                    <Avatar name={p.name} size="sm" />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2"
                      style={{backgroundColor: "#22c55e", borderColor: "var(--bg-primary)"}} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{color: "var(--text-primary)"}}>{p.name}</p>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                      style={{backgroundColor: p.role === "SUPER_ADMIN" ? "#9333ea" : "#0066ff", color: "#fff"}}>
                      {p.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </>
      )}

      {/* ── New chat dialog ── */}
      {newChatOpen && (
        <NewChatDialog
          users={allUsers} myId={myId}
          onClose={() => setNewChatOpen(false)}
          onCreate={(conv) => {
            setConvs((prev) => {
              const exists = prev.find((c) => c.id === conv.id)
              if (exists) return prev
              return [{ ...conv, unreadCount: 0, lastMessage: null, updatedAt: new Date().toISOString() }, ...prev]
            })
            setActiveId(conv.id)
          }}
        />
      )}
    </div>
  )
}
