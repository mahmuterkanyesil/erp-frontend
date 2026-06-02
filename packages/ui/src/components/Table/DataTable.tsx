import { type ReactNode } from "react"
import { cn } from "@erp/utils"
import { TableSkeleton } from "../Skeleton/Skeleton"
import { EmptyState } from "../EmptyState/EmptyState"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Column<T> {
  key: string
  header: string
  /** Render function — receives the row item */
  cell: (row: T) => ReactNode
  /** Show only on these breakpoints and above. Default: always visible */
  hideBelow?: "sm" | "md" | "lg"
  /** Column header alignment */
  align?: "start" | "end" | "center"
  /** Optional fixed width class e.g. "w-32" */
  width?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (row: T) => string
  loading?: boolean
  emptyTitle?: string
  emptyDescription?: string
  emptyIcon?: string
  emptyAction?: ReactNode
  onRowClick?: (row: T) => void
  /** Renders a mobile card for each row. Falls back to a simple key-value card if not provided. */
  mobileCard?: (row: T) => ReactNode
  className?: string
}

const hideClasses: Record<string, string> = {
  sm: "hidden sm:table-cell",
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell",
}

/** Generic responsive data table.
 *
 * - Desktop (md+): renders a full <table>
 * - Mobile (<md): renders a list of cards (mobileCard prop or auto-generated)
 */
export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  loading = false,
  emptyTitle = "Kayıt bulunamadı",
  emptyDescription,
  emptyIcon = "inbox",
  emptyAction,
  onRowClick,
  mobileCard,
  className,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className={cn("rounded-lg border border-border-light dark:border-border-dark overflow-hidden", className)}>
        <TableSkeleton rows={6} cols={columns.length} />
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className={cn("rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark", className)}>
        <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} action={emptyAction} />
      </div>
    )
  }

  return (
    <div className={cn("rounded-lg border border-border-light dark:border-border-dark overflow-hidden", className)}>

      {/* ── Desktop table ── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-background-light dark:bg-background-dark border-b border-border-light dark:border-border-dark">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-3 text-xs font-700 uppercase tracking-wide",
                    "text-text-secondary-light dark:text-text-secondary-dark",
                    `text-${col.align ?? "start"}`,
                    col.hideBelow && hideClasses[col.hideBelow],
                    col.width,
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light dark:divide-border-dark">
            {data.map((row) => (
              <tr
                key={keyExtractor(row)}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  "bg-surface-light dark:bg-surface-dark",
                  "transition-colors duration-100",
                  onRowClick && "cursor-pointer hover:bg-background-light dark:hover:bg-background-dark",
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "px-4 py-3.5 text-text-main-light dark:text-text-main-dark",
                      `text-${col.align ?? "start"}`,
                      col.hideBelow && hideClasses[col.hideBelow],
                      col.width,
                    )}
                  >
                    {col.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Mobile cards ── */}
      <div className="md:hidden divide-y divide-border-light dark:divide-border-dark">
        {data.map((row) => (
          <div
            key={keyExtractor(row)}
            onClick={() => onRowClick?.(row)}
            className={cn(
              "bg-surface-light dark:bg-surface-dark p-4",
              onRowClick && "cursor-pointer hover:bg-background-light dark:hover:bg-background-dark",
            )}
          >
            {mobileCard ? (
              mobileCard(row)
            ) : (
              // Auto-generated mobile card: shows all columns as key-value pairs
              <div className="flex flex-col gap-2">
                {columns.map((col) => (
                  <div key={col.key} className="flex items-start justify-between gap-3">
                    <span className="text-xs font-500 text-text-secondary-light dark:text-text-secondary-dark shrink-0">
                      {col.header}
                    </span>
                    <span className="text-sm text-text-main-light dark:text-text-main-dark text-end">
                      {col.cell(row)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
