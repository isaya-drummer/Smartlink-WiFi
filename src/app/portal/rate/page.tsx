"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { CheckCircle } from "lucide-react"

const LABELS: Record<number, string> = {
  1: "Very Poor",
  2: "Poor",
  3: "Fair",
  4: "Good",
  5: "Excellent",
}

function RatePageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const ref = searchParams.get("ref") ?? ""

  const [loading, setLoading] = useState(true)
  const [canRate, setCanRate] = useState(false)
  const [alreadyRated, setAlreadyRated] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [bundleName, setBundleName] = useState<string | null>(null)

  const [selected, setSelected] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    document.title = "SmartLink Digital — Rate Our Service"
  }, [])

  useEffect(() => {
    if (!ref) {
      setNotFound(true)
      setLoading(false)
      return
    }
    fetch(`/api/portal/rate?ref=${encodeURIComponent(ref)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.canRate && !data.alreadyRated) {
          setNotFound(true)
        } else if (data.alreadyRated) {
          setAlreadyRated(true)
        } else {
          setCanRate(true)
          setBundleName(data.bundleName ?? null)
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [ref])

  async function handleSubmit() {
    if (!selected || submitting) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/portal/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voucherCode: ref, rating: selected, comment: comment || undefined }),
      })
      if (res.ok) {
        setDone(true)
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div
          className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "#00b4ff", borderTopColor: "transparent" }}
          role="status"
          aria-label="Loading"
        />
      </div>
    )
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-6 py-8">
        <CheckCircle size={64} style={{ color: "#00b4ff" }} />
        <h2 className="text-2xl font-bold text-white text-center">
          Thank you for your feedback!
        </h2>
        <button
          onClick={() => router.push("/portal")}
          className="w-full py-3 rounded-xl font-semibold text-white"
          style={{
            background: "linear-gradient(135deg, #00b4ff 0%, #0066ff 100%)",
          }}
        >
          Back to Portal
        </button>
      </div>
    )
  }

  if (alreadyRated) {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <p className="text-white text-center">You have already rated this session.</p>
        <button
          onClick={() => router.push("/portal")}
          className="px-6 py-3 rounded-xl font-semibold text-white"
          style={{
            background: "linear-gradient(135deg, #00b4ff 0%, #0066ff 100%)",
          }}
        >
          Back to Portal
        </button>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <p className="text-white text-center">Session not found.</p>
        <button
          onClick={() => router.push("/portal")}
          className="px-6 py-3 rounded-xl font-semibold text-white"
          style={{
            background: "linear-gradient(135deg, #00b4ff 0%, #0066ff 100%)",
          }}
        >
          Back to Portal
        </button>
      </div>
    )
  }

  if (!canRate) return null

  const displayStar = hovered > 0 ? hovered : selected

  return (
    <div className="flex flex-col gap-5 py-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">How was your experience?</h2>
        {bundleName && (
          <p className="mt-1 text-sm font-medium" style={{ color: "#00b4ff" }}>
            {bundleName}
          </p>
        )}
      </div>

      {/* Star buttons */}
      <div className="flex justify-center gap-3 mt-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
            onClick={() => setSelected(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="text-5xl leading-none transition-colors cursor-pointer bg-transparent border-none p-0"
            style={{ color: star <= displayStar ? "#00b4ff" : "#6b7280" }}
          >
            ★
          </button>
        ))}
      </div>

      {/* Label */}
      <div className="text-center h-5">
        {displayStar > 0 && (
          <span className="text-sm font-medium" style={{ color: "#00b4ff" }}>
            {LABELS[displayStar]}
          </span>
        )}
      </div>

      {/* Optional comment */}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Tell us more (optional)"
        maxLength={300}
        rows={3}
        className="w-full rounded-xl p-3 text-sm outline-none resize-none mt-2"
        style={{
          backgroundColor: "#0d1f3c",
          border: "1px solid #1e3a5f",
          color: "#fff",
        }}
      />

      <button
        onClick={handleSubmit}
        disabled={!selected || submitting}
        className="w-full py-3 rounded-xl font-semibold text-white mt-2 disabled:opacity-50"
        style={{
          background: "linear-gradient(135deg, #00b4ff 0%, #0066ff 100%)",
        }}
      >
        {submitting ? "Submitting…" : "Submit Rating"}
      </button>
    </div>
  )
}

export default function RatePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-16">
          <div
            className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: "#00b4ff", borderTopColor: "transparent" }}
            role="status"
            aria-label="Loading"
          />
        </div>
      }
    >
      <RatePageContent />
    </Suspense>
  )
}
