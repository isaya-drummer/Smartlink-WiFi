"use client"

import { Suspense } from "react"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle, Wifi } from "lucide-react"
import VoucherDisplay from "@/components/portal/VoucherDisplay"
import { formatDate } from "@/lib/utils"

interface VoucherData {
  code: string
  expiresAt: string | null
}

interface ActivationResult {
  success: boolean
  voucher?: VoucherData
  error?: string
}

function SuccessPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const ref = searchParams.get("ref")

  const [activating, setActivating] = useState(true)
  const [voucher, setVoucher] = useState<VoucherData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!ref) {
      router.replace("/portal")
      return
    }

    // Wait 3 seconds, then activate the voucher
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/webhook/payment?ref=${encodeURIComponent(ref)}`
        )
        const data: ActivationResult = await res.json()

        if (!res.ok || !data.success || !data.voucher) {
          setError(data.error || "Activation failed. Please contact support.")
        } else {
          setVoucher(data.voucher)
        }
      } catch {
        setError("Network error during activation. Please try again.")
      } finally {
        setActivating(false)
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [ref, router])

  if (!ref) return null

  return (
    <div className="flex flex-col gap-6">
      {activating ? (
        /* 3-second pulsing loading animation */
        <div className="flex flex-col items-center gap-4 py-10">
          <div className="relative flex items-center justify-center">
            <div
              className="w-20 h-20 rounded-full animate-ping absolute"
              style={{ backgroundColor: "rgba(0,180,255,0.2)" }}
            />
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: "rgba(0,180,255,0.15)",
                border: "2px solid #00b4ff",
              }}
            >
              <Wifi size={32} style={{ color: "#00b4ff" }} />
            </div>
          </div>
          <p className="text-white font-semibold text-lg">
            Activating your voucher&hellip;
          </p>
          <p className="text-white/50 text-sm text-center">
            Please wait while we connect you to the internet.
          </p>
        </div>
      ) : error ? (
        /* Error state */
        <div className="flex flex-col items-center gap-4 py-6">
          <p className="text-red-400 text-center">{error}</p>
          <button
            onClick={() => router.push("/portal")}
            className="px-6 py-3 rounded-xl font-semibold text-white"
            style={{
              background: "linear-gradient(135deg, #00b4ff 0%, #0066ff 100%)",
            }}
          >
            Try Again
          </button>
        </div>
      ) : voucher ? (
        /* Success state */
        <div className="flex flex-col gap-5">
          {/* Connected header */}
          <div className="flex flex-col items-center gap-2 py-2">
            <CheckCircle size={48} style={{ color: "#00b4ff" }} />
            <h2
              className="text-xl font-bold text-center"
              style={{ color: "#00b4ff" }}
            >
              You are now connected! 🎉
            </h2>
          </div>

          {/* Voucher code display */}
          <div className="flex flex-col gap-2">
            <p className="text-white/70 text-sm">Your access code:</p>
            <VoucherDisplay code={voucher.code} />
            <p className="text-white/40 text-xs text-center">
              Enter this code in the hotspot login page
            </p>
          </div>

          {/* Expiry info */}
          {voucher.expiresAt && (
            <div
              className="rounded-xl p-4"
              style={{
                backgroundColor: "#0d1f3c",
                border: "1px solid #1e3a5f",
              }}
            >
              <div className="flex justify-between items-center">
                <span className="text-white/60 text-sm">Expires at</span>
                <span className="text-white text-sm font-medium">
                  {formatDate(voucher.expiresAt)}
                </span>
              </div>
            </div>
          )}

          {/* Usage instructions */}
          <div
            className="rounded-xl p-4"
            style={{ backgroundColor: "#0d1f3c", border: "1px solid #1e3a5f" }}
          >
            <h3 className="text-white font-semibold mb-3">How to connect</h3>
            <ol className="flex flex-col gap-2 text-sm text-white/70 list-decimal list-inside">
              <li>Open your device&apos;s browser</li>
              <li>
                You will be redirected to the login page automatically
              </li>
              <li>Enter the voucher code shown above</li>
              <li>
                Tap <strong className="text-white">Connect</strong> and enjoy!
              </li>
            </ol>
          </div>

          <button
            onClick={() => router.push("/portal")}
            className="w-full py-3 rounded-xl font-semibold text-white/70 text-sm transition-colors hover:text-white"
            style={{ border: "1px solid #1e3a5f" }}
          >
            Buy Another Bundle
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center gap-4 py-10">
          <div
            className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: "#00b4ff", borderTopColor: "transparent" }}
            role="status"
            aria-label="Loading"
          />
        </div>
      }
    >
      <SuccessPageContent />
    </Suspense>
  )
}
