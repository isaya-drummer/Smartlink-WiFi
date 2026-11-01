"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"

function getGreeting() {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12)  return "Good morning"
  if (hour >= 12 && hour < 17) return "Good afternoon"
  if (hour >= 17 && hour < 21) return "Good evening"
  return "Good night"
}

function getEmoji() {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12)  return "☀️"
  if (hour >= 12 && hour < 17) return "🌤️"
  if (hour >= 17 && hour < 21) return "🌆"
  return "🌙"
}

function firstName(full?: string | null) {
  const trimmed = full?.trim()
  if (!trimmed) return "Admin"
  return trimmed.split(/\s+/)[0]
}

export default function DashboardGreeting({ subtitle }: { subtitle: string }) {
  const { data: session } = useSession()
  const [greeting, setGreeting] = useState("")
  const [emoji, setEmoji] = useState("")

  // Run on client only to avoid hydration mismatch
  useEffect(() => {
    setGreeting(getGreeting())
    setEmoji(getEmoji())

    // Update every minute in case the hour changes while admin is on the page
    const interval = setInterval(() => {
      setGreeting(getGreeting())
      setEmoji(getEmoji())
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  const name = firstName(session?.user?.name)

  return (
    <div>
      <h1 className="text-xl md:text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
        {emoji && <span className="mr-2">{emoji}</span>}
        {greeting ? `${greeting}, ${name}!` : `Hello, ${name}!`}
      </h1>
      <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
        {subtitle}
      </p>
    </div>
  )
}
