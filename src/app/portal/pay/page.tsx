"use client"

import { Suspense } from "react"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"
import ProviderBadge from "@/components/portal/ProviderBadge"
import { type Provider } from "@/lib/payment"
import { formatCurrency, formatDataLimit, formatDuration } from "@/lib/utils"
import { useLanguage } from "@/context/LanguageContext"

const VALID_PROVIDERS: Provider[] = ["YAS", "AIRTEL", "VODACOM", "HALOTEL"]

interface Bundle {
  id: string
  name: string
  description?: string | null
  price: number
  currency: string
  durationHours: number
  dataLimitMB: number
}

function PayPageContent() {
  const router = useRouter()
  const { t } = useLanguage()
  const searchParams = useSearchParams()
  const providerParam = searchParams.get("provider")?.toUpperCase() as Provider | null
  const bundleId = searchParams.get("bundleId")

  const [bundle, setBundle] = useState<Bundle | null>(null)
  const [loadingBundle, setLoadingBundle] = useState(true)
  const [clientName, setClientName] = useState("")
  const [clientPhone, setClientPhone] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Validate params
  useEffect(() => {
    if (
      !providerParam ||
      !VALID_PROVIDERS.includes(providerParam) ||
      !bundleId
    ) {
      router.replace("/portal")
    }
  }, [providerParam, bundleId, router])

  // Fetch the selected bundle
  useEffect(() => {
    if (!bundleId) return
    setLoadingBundle(true)
    fetch("/api/portal/bundles")
      .then((r) => r.json())
      .then((data: Bundle[]) => {
        const found = data.find((b) => b.id === bundleId)
        if (found) {
          setBundle(found)
        } else {
          router.replace(`/portal/bundle?provider=${providerParam}`)
        }
        setLoadingBundle(false)
      })
      .catch(() => {
        setError("Could not load bundle details.")
        setLoadingBundle(false)
      })
  }, [bundleId, providerParam, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bundle || !providerParam) return

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch("/api/portal/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: providerParam,
          bundleId: bundle.id,
          clientName: clientName.trim(),
          clientPhone: clientPhone.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.error || "Payment failed. Please try again.")
        setSubmitting(false)
        return
      }

      router.push(`/portal/success?ref=${encodeURIComponent(data.paymentRef)}`)
    } catch {
      setError("Network error. Please check your connection and try again.")
      setSubmitting(false)
    }
  }

  if (!providerParam || !VALID_PROVIDERS.includes(providerParam) || !bundleId) {
    return null
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Back + provider badge */}
      <div className="flex items-center gap-3">
        <button
          onClick={() =>
            router.push(`/portal/bundle?provider=${providerParam}`)
          }
          className="flex items-center gap-1 text-sm text-white/70 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#00b4ff] rounded"
          aria-label={t.common.back}
        >
          <ArrowLeft size={16} />
          {t.common.back}
        </button>
        {providerParam && <ProviderBadge provider={providerParam} />}
      </div>

      {/* Bundle summary */}
      {loadingBundle ? (
        <div className="flex justify-center py-6">
          <div
            className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: "#00b4ff", borderTopColor: "transparent" }}
            aria-label="Loading bundle"
          />
        </div>
      ) : bundle ? (
        <div
          className="rounded-xl p-4"
          style={{ backgroundColor: "#0d1f3c", border: "1px solid #1e3a5f" }}
        >
          <h3 className="text-white font-semibold mb-1">{bundle.name}</h3>
          {bundle.description && (
            <p className="text-white/60 text-sm mb-2">{bundle.description}</p>
          )}
          <div className="flex gap-4">
            <div>
              <span className="text-white/50 text-xs">{t.bundle.duration}</span>
              <p className="text-sm font-medium" style={{ color: "#00b4ff" }}>
                {formatDuration(bundle.durationHours)}
              </p>
            </div>
            <div>
              <span className="text-white/50 text-xs">{t.bundle.dataLimit}</span>
              <p className="text-sm font-medium" style={{ color: "#00b4ff" }}>
                {formatDataLimit(bundle.dataLimitMB)}
              </p>
            </div>
            <div>
              <span className="text-white/50 text-xs">{t.bundle.price}</span>
              <p className="text-sm font-bold" style={{ color: "#00b4ff" }}>
                {formatCurrency(bundle.price, bundle.currency)}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Payment form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-white">{t.pay.title}</h2>

        <div className="flex flex-col gap-1">
          <label htmlFor="clientName" className="text-sm text-white/70">
            {t.pay.clientNameLabel}
          </label>
          <input
            id="clientName"
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder={t.pay.clientNamePlaceholder}
            required
            minLength={2}
            className="w-full rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none transition-colors"
            style={{
              backgroundColor: "#0d1f3c",
              border: "1px solid #1e3a5f",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#00b4ff")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#1e3a5f")}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="clientPhone" className="text-sm text-white/70">
            {t.pay.phoneLabel}
          </label>
          <input
            id="clientPhone"
            type="tel"
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
            placeholder={t.pay.phonePlaceholder}
            required
            minLength={8}
            className="w-full rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none transition-colors"
            style={{
              backgroundColor: "#0d1f3c",
              border: "1px solid #1e3a5f",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#00b4ff")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#1e3a5f")}
          />
          <p className="text-xs text-gray-400 mt-1">{t.pay.pushNotice}</p>
        </div>

        {error && (
          <p className="text-red-400 text-sm" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting || loadingBundle || !bundle}
          className="w-full py-4 rounded-xl font-bold text-base text-white transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-[#00b4ff]/30 disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            background: "linear-gradient(135deg, #00b4ff 0%, #0066ff 100%)",
          }}
        >
          {submitting ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              {t.pay.processingButton}
            </>
          ) : (
            `${t.pay.payButton} ${bundle ? formatCurrency(bundle.price, bundle.currency) : ""}`
          )}
        </button>
      </form>
    </div>
  )
}

export default function PayPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-10">
          <div
            className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: "#00b4ff", borderTopColor: "transparent" }}
            role="status"
            aria-label="Loading"
          />
        </div>
      }
    >
      <PayPageContent />
    </Suspense>
  )
}
