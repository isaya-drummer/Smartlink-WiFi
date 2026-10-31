"use client"

import { useEffect, useMemo, useState } from "react"
import { Download, FileText, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"

interface ReportPayload {
  type: string
  from: string
  to: string
  generatedAt: string
  generatedBy: string
  title: string
  columns: string[]
  rows: string[][]
}

const REPORT_TYPES = [
  { value: "summary", label: "System summary" },
  { value: "payments", label: "Payments" },
  { value: "vouchers", label: "Vouchers" },
  { value: "clients", label: "Clients" },
]

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10)
}

function defaultFrom() {
  const d = new Date()
  d.setDate(d.getDate() - 29)
  return isoDate(d)
}

function escapeCsv(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

function openWatermarkedPrint(report: ReportPayload) {
  const origin = window.location.origin
  const logoUrl = `${origin}/smartlink-logo.jpeg`
  const tableHead = report.columns.map((c) => `<th>${c}</th>`).join("")
  const tableBody = report.rows
    .map(
      (row) =>
        `<tr>${row.map((cell) => `<td>${cell.replace(/</g, "&lt;")}</td>`).join("")}</tr>`
    )
    .join("")

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${report.title}</title>
  <style>
    @page { margin: 18mm; }
    body { font-family: Arial, sans-serif; color: #0a1628; margin: 0; position: relative; }
    .watermark {
      position: fixed;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      background-image: url('${logoUrl}');
      background-repeat: repeat;
      background-size: 180px;
      opacity: 0.08;
      transform: rotate(-18deg) scale(1.2);
    }
    .content { position: relative; z-index: 1; }
    header { display: flex; align-items: center; gap: 14px; border-bottom: 2px solid #00b4ff; padding-bottom: 12px; margin-bottom: 16px; }
    header img { width: 56px; height: 56px; border-radius: 50%; }
    h1 { margin: 0; font-size: 22px; }
    .meta { color: #445; font-size: 12px; margin: 4px 0 0; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    th, td { border: 1px solid #c9d6e8; padding: 7px 8px; text-align: left; }
    th { background: #e8f6ff; color: #0a1628; }
    tr:nth-child(even) td { background: rgba(0,180,255,0.06); }
    footer { margin-top: 18px; font-size: 11px; color: #667; }
  </style>
</head>
<body>
  <div class="watermark"></div>
  <div class="content">
    <header>
      <img src="${logoUrl}" alt="SmartLink Digital" />
      <div>
        <h1>${report.title}</h1>
        <p class="meta">SmartLink Digital · ${new Date(report.from).toLocaleDateString()} – ${new Date(report.to).toLocaleDateString()}</p>
        <p class="meta">Generated ${new Date(report.generatedAt).toLocaleString()} by ${report.generatedBy}</p>
      </div>
    </header>
    <table>
      <thead><tr>${tableHead}</tr></thead>
      <tbody>${tableBody || `<tr><td colspan="${report.columns.length}">No records in this range.</td></tr>`}</tbody>
    </table>
    <footer>Confidential · SmartLink Digital watermarked report</footer>
  </div>
  <script>window.onload = function () { window.focus(); window.print(); }</script>
</body>
</html>`

  const printWindow = window.open("", "_blank", "noopener,noreferrer,width=1024,height=720")
  if (!printWindow) return
  printWindow.document.open()
  printWindow.document.write(html)
  printWindow.document.close()
}

export default function ReportsPage() {
  const [type, setType] = useState("summary")
  const [from, setFrom] = useState(defaultFrom)
  const [to, setTo] = useState(isoDate(new Date()))
  const [report, setReport] = useState<ReportPayload | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const query = useMemo(() => {
    const params = new URLSearchParams({ type, from, to })
    return params.toString()
  }, [type, from, to])

  async function loadReport() {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/admin/reports?${query}`)
      if (!res.ok) throw new Error("Could not load report")
      setReport(await res.json())
    } catch {
      setError("Unable to load this report. Try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    document.title = "SmartLink Digital — Admin: Reports"
    loadReport()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  function downloadCsv() {
    if (!report) return
    const lines = [
      escapeCsv(report.title),
      `Generated,${report.generatedAt}`,
      `By,${report.generatedBy}`,
      "",
      report.columns.map(escapeCsv).join(","),
      ...report.rows.map((row) => row.map(escapeCsv).join(",")),
    ]
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${report.type}-report.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-white">Reports</h1>
        <p className="text-sm text-gray-400 mt-1">
          Generate and download system reports. PDF copies include the SmartLink Digital logo watermark.
        </p>
      </div>

      <div
        className="rounded-xl p-4 md:p-5 flex flex-wrap items-end gap-3"
        style={{ backgroundColor: "#0a1628", border: "1px solid #1e3a5f" }}
      >
        <label className="space-y-1.5 text-sm text-gray-300">
          <span className="block">Report type</span>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="h-10 rounded-md px-3 text-sm outline-none"
            style={{ backgroundColor: "#0d1f3c", border: "1px solid #1e3a5f", color: "#fff" }}
          >
            {REPORT_TYPES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1.5 text-sm text-gray-300">
          <span className="block">From</span>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="h-10 rounded-md px-3 text-sm outline-none"
            style={{ backgroundColor: "#0d1f3c", border: "1px solid #1e3a5f", color: "#fff" }}
          />
        </label>
        <label className="space-y-1.5 text-sm text-gray-300">
          <span className="block">To</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="h-10 rounded-md px-3 text-sm outline-none"
            style={{ backgroundColor: "#0d1f3c", border: "1px solid #1e3a5f", color: "#fff" }}
          />
        </label>
        <Button
          onClick={loadReport}
          disabled={loading}
          className="h-10"
          style={{ backgroundColor: "#00b4ff", color: "#0a1628" }}
        >
          <FileText className="w-4 h-4" />
          {loading ? "Loading…" : "Refresh"}
        </Button>
        <Button
          onClick={downloadCsv}
          disabled={!report}
          variant="outline"
          className="h-10 border-cyan-700 text-white hover:bg-white/10"
        >
          <Download className="w-4 h-4" />
          CSV
        </Button>
        <Button
          onClick={() => report && openWatermarkedPrint(report)}
          disabled={!report}
          variant="outline"
          className="h-10 border-cyan-700 text-white hover:bg-white/10"
        >
          <Printer className="w-4 h-4" />
          Download PDF
        </Button>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #1e3a5f" }}>
        <div className="px-6 py-4 border-b" style={{ backgroundColor: "#0a1628", borderColor: "#1e3a5f" }}>
          <h2 className="text-lg font-semibold text-white">{report?.title ?? "Report preview"}</h2>
          {report && (
            <p className="text-xs text-gray-400 mt-1">
              {formatDate(report.from)} – {formatDate(report.to)} · {report.rows.length} row(s)
            </p>
          )}
        </div>
        <div className="overflow-x-auto" style={{ backgroundColor: "#0d1f3c" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "#071020" }}>
                {(report?.columns ?? ["Loading"]).map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-gray-400 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={report?.columns.length ?? 1} className="px-4 py-8 text-center text-gray-500">
                    Loading report…
                  </td>
                </tr>
              ) : !report || report.rows.length === 0 ? (
                <tr>
                  <td colSpan={report?.columns.length ?? 1} className="px-4 py-8 text-center text-gray-500">
                    No records in this range.
                  </td>
                </tr>
              ) : (
                report.rows.map((row, idx) => (
                  <tr
                    key={idx}
                    style={{
                      backgroundColor: idx % 2 === 0 ? "#0d1f3c" : "#0a1a35",
                      borderTop: "1px solid #1e3a5f",
                    }}
                  >
                    {row.map((cell, i) => (
                      <td key={i} className="px-4 py-3 text-white whitespace-nowrap">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
