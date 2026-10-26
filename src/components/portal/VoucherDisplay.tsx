"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"

interface VoucherDisplayProps {
  code: string
}

/**
 * Large monospace voucher code display with a copy-to-clipboard button.
 */
export default function VoucherDisplay({ code }: VoucherDisplayProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for environments without clipboard API
      const el = document.createElement("textarea")
      el.value = code
      document.body.appendChild(el)
      el.select()
      document.execCommand("copy")
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div
      className="flex items-center justify-between rounded-xl px-5 py-4 gap-4"
      style={{ border: "2px solid #00b4ff", backgroundColor: "#0d1f3c" }}
    >
      <span
        className="font-mono text-3xl font-bold tracking-widest"
        style={{ color: "#00b4ff" }}
        aria-label={`Voucher code: ${code}`}
      >
        {code}
      </span>
      <button
        onClick={handleCopy}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#00b4ff]"
        style={{
          backgroundColor: copied ? "#00b4ff" : "#1e3a5f",
          color: copied ? "#0a1628" : "#ffffff",
        }}
        aria-label="Copy voucher code to clipboard"
      >
        {copied ? (
          <>
            <Check size={16} />
            Copied!
          </>
        ) : (
          <>
            <Copy size={16} />
            Copy
          </>
        )}
      </button>
    </div>
  )
}
