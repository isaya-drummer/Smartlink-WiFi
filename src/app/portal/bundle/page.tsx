"use client"

import { Suspense } from "react"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import ProviderBadge from "@/components/portal/ProviderBadge"
import BundleCard from "@/components/portal/BundleCard"
import { type Provider } from "@/lib/payment"

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

function BundlePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const providerParam = searchParams.get("provider")?.toUpperCase() as Provider | null

  const [bundles, setBundles] = useState<Bundle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Validate provider on mount
  useEffect(() => {
    if (!providerParam || !VALID_PROVIDERS.includes(providerParam)) {
      router.replace("/portal")
    }
  }, [providerParam, router])

  // Fetch active bundles
  useEffect(() => {
    if (!providerParam || !VALID_PROVIDERS.includes(providerParam)) return

    setLoading(true)
    fetch("/api/portal/bundles")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load bundles")
        return res.json()
      })
      .then((data: Bundle[]) => {
        setBundles(data)
        setLoading(false)
      })
      .catch(() => {
        setError("Could not load bundles. Please try again.")
        setLoading(false)
      })
  }, [providerParam])

  const handleBundleSelect = (bundleId: string) => {
    router.push(`/portal/pay?provider=${providerParam}&bundleId=${bundleId}`)
  }

  if (!providerParam || !VALID_PROVIDERS.includes(providerParam)) {
    return null
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Back + provider badge */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/portal")}
          className="flex items-center gap-1 text-sm text-white/70 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#00b4ff] rounded"
          aria-label="Back to provider selection"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <ProviderBadge provider={providerParam} />
      </div>

      <div>
        <h2 className="text-xl font-bold text-white">Select a Bundle</h2>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
          Choose the plan that works best for you
        </p>
      </div>

      {loading && (
        <div className="flex justify-center py-10">
          <div
            className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: "#00b4ff", borderTopColor: "transparent" }}
            role="status"
            aria-label="Loading bundles"
          />
        </div>
      )}

      {error && (
        <p className="text-red-400 text-sm text-center py-4">{error}</p>
      )}

      {!loading && !error && bundles.length === 0 && (
        <p className="text-white/50 text-sm text-center py-4">
          No bundles available at the moment.
        </p>
      )}

      {!loading && !error && bundles.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {bundles.map((bundle) => (
            <BundleCard
              key={bundle.id}
              bundle={bundle}
              onClick={handleBundleSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function BundlePage() {
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
      <BundlePageContent />
    </Suspense>
  )
}
