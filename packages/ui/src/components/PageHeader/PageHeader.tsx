import { type ReactNode } from "react"
import { cn } from "@erp/utils"

interface Breadcrumb {
  label: string
  href?: string
  onClick?: () => void
}

interface PageHeaderProps {
  title: string
  subtitle?: string
  breadcrumbs?: Breadcrumb[]
  actions?: ReactNode
  className?: string
}

/**
 * Standard page header with breadcrumbs, title, and action area.
 * Used at the top of every page inside the main content area.
 *
 * @example
 * <PageHeader
 *   title={t("orders.title")}
 *   breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: t("orders.title") }]}
 *   actions={
 *     <PermissionGate permission="orders:create">
 *       <Button leftIcon="add">{t("orders.newOrder")}</Button>
 *     </PermissionGate>
 *   }
 * />
 */
export function PageHeader({ title, subtitle, breadcrumbs, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-3 mb-6", className)}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1 text-xs">
            {breadcrumbs.map((crumb, i) => {
              const isLast = i === breadcrumbs.length - 1
              return (
                <li key={i} className="flex items-center gap-1">
                  {i > 0 && (
                    <span className="material-symbols-outlined text-[14px] text-text-secondary-light dark:text-text-secondary-dark">
                      chevron_right
                    </span>
                  )}
                  {isLast ? (
                    <span className="text-text-main-light dark:text-text-main-dark font-500">
                      {crumb.label}
                    </span>
                  ) : crumb.href ? (
                    <a
                      href={crumb.href}
                      className="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary transition-colors font-400"
                    >
                      {crumb.label}
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={crumb.onClick}
                      className="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary transition-colors font-400"
                    >
                      {crumb.label}
                    </button>
                  )}
                </li>
              )
            })}
          </ol>
        </nav>
      )}

      {/* Title row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl md:text-2xl font-800 text-text-main-light dark:text-text-main-dark tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
              {subtitle}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-2 shrink-0">{actions}</div>
        )}
      </div>
    </div>
  )
}
