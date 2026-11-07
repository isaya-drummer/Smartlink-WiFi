import { ReactNode } from "react"

interface Column<T> {
  key: string
  header: string
  render?: (row: T) => ReactNode
  mobileHide?: boolean   // hide this column in mobile card view
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyField: keyof T
  emptyMessage?: string
}

/**
 * Responsive data table.
 * - Desktop (md+): standard HTML table with sticky header
 * - Mobile: each row renders as a card with label/value pairs
 */
export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  keyField,
  emptyMessage = "No data found.",
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div
        className="rounded-xl py-12 text-center text-gray-500 text-sm"
        style={{ border: "1px solid var(--border-color)", backgroundColor: "var(--bg-secondary)" }}
      >
        {emptyMessage}
      </div>
    )
  }

  return (
    <>
      {/* â”€â”€ Desktop table (md+) â”€â”€ */}
      <div
        className="hidden md:block rounded-xl overflow-hidden"
        style={{ border: "1px solid var(--border-color)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "var(--bg-tertiary)" }}>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-4 py-3 text-left font-semibold text-gray-400 whitespace-nowrap"
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr
                  key={String(row[keyField])}
                  style={{
                    backgroundColor: idx % 2 === 0 ? "var(--bg-secondary)" : "var(--bg-tertiary)",
                    borderTop: "1px solid var(--border-color)",
                  }}
                  className="hover:opacity-90 transition-opacity"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-white">
                      {col.render ? col.render(row) : (row[col.key] as ReactNode)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* â”€â”€ Mobile cards (< md) â”€â”€ */}
      <div className="md:hidden space-y-3">
        {data.map((row) => (
          <div
            key={String(row[keyField])}
            className="rounded-xl p-4 space-y-2"
            style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color)" }}
          >
            {columns
              .filter((col) => !col.mobileHide)
              .map((col) => (
                <div key={col.key} className="flex items-start justify-between gap-2 min-w-0">
                  <span className="text-xs text-gray-400 flex-shrink-0 pt-0.5 w-24">
                    {col.header}
                  </span>
                  <span className="text-sm text-white text-right break-words min-w-0">
                    {col.render ? col.render(row) : (row[col.key] as ReactNode)}
                  </span>
                </div>
              ))}
          </div>
        ))}
      </div>
    </>
  )
}
