"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"

function greetingForHour(hour: number) {
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

function firstName(full?: string | null) {
  const trimmed = full?.trim()
  if (!trimmed) return "Admin"
  return trimmed.split(/\s+/)[0]
}

export default function DashboardGreeting({
  subtitle,
}: {
  subtitle: string
}) {
  const { data: session } = useSession()
  const [greeting, setGreeting] = useState("Hello")

  useEffect(() => {
    setGreeting(greetingForHour(new Date().getHours()))
  }, [])

  const name = firstName(session?.user?.name)

  return (
    <div>
      <h1 className="text-xl md:text-2xl font-bold text-white">
        {greeting}, {name}
      </h1>
      <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
    </div>
  )
}
