import { cn } from "@erp/utils"

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export function Pagination({ page, totalPages, onPageChange, className }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = buildPageRange(page, totalPages)

  return (
    <div className={cn("flex items-center justify-center gap-1", className)}>
      {/* Prev */}
      <PageBtn
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        aria-label="Önceki sayfa"
      >
        <span className="material-symbols-outlined text-[18px]">chevron_start</span>
      </PageBtn>

      {pages.map((p, i) =>
        p === "..." ? (
          <span
            key={`ellipsis-${i}`}
            className="w-9 text-center text-sm text-text-secondary-light dark:text-text-secondary-dark"
          >
            …
          </span>
        ) : (
          <PageBtn
            key={p}
            onClick={() => onPageChange(p as number)}
            active={p === page}
          >
            {p}
          </PageBtn>
        ),
      )}

      {/* Next */}
      <PageBtn
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Sonraki sayfa"
      >
        <span className="material-symbols-outlined text-[18px]">chevron_end</span>
      </PageBtn>
    </div>
  )
}

function PageBtn({
  children,
  onClick,
  disabled,
  active,
  ...props
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  active?: boolean
  [key: string]: unknown
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-9 h-9 flex items-center justify-center rounded-lg text-sm font-500 transition-colors",
        active
          ? "bg-primary text-white font-700"
          : "text-text-secondary-light dark:text-text-secondary-dark hover:bg-background-light dark:hover:bg-background-dark",
        disabled && "opacity-40 cursor-not-allowed",
      )}
      {...props}
    >
      {children}
    </button>
  )
}

function buildPageRange(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  if (current <= 4) return [1, 2, 3, 4, 5, "...", total]
  if (current >= total - 3) return [1, "...", total - 4, total - 3, total - 2, total - 1, total]
  return [1, "...", current - 1, current, current + 1, "...", total]
}
