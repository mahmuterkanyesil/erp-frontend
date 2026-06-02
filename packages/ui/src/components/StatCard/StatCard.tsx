import { type ReactNode } from "react"
import { cn } from "@erp/utils"

interface Trend {
  value: number        // e.g. 12 → "+12%"
  direction: "up" | "down" | "neutral"
  label?: string       // e.g. "Düne göre"
}

interface StatCardProps {
  label: string
  value: ReactNode
  icon: string          // Material Symbol name
  iconColor?: "primary" | "success" | "warning" | "danger" | "info"
  trend?: Trend
  loading?: boolean
  className?: string
}

const iconBg: Record<string, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
  warning: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400",
  danger:  "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
  info:    "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
}

const trendColor: Record<"up" | "down" | "neutral", string> = {
  up:      "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20",
  down:    "text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20",
  neutral: "text-text-secondary-light dark:text-text-secondary-dark bg-background-light dark:bg-background-dark",
}

const trendIcon: Record<"up" | "down" | "neutral", string> = {
  up:      "trending_up",
  down:    "trending_down",
  neutral: "trending_flat",
}

/**
 * Dashboard KPI card.
 *
 * @example
 * <StatCard
 *   label={t("dashboard.dailySales")}
 *   value={formatCurrency("120500.00", "TRY")}
 *   icon="payments"
 *   iconColor="success"
 *   trend={{ value: 12, direction: "up", label: "Düne göre" }}
 * />
 */
export function StatCard({ label, value, icon, iconColor = "primary", trend, loading, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-surface-light dark:bg-surface-dark",
        "border border-border-light dark:border-border-dark",
        "rounded-xl p-6 flex flex-col gap-2 shadow-sm",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-500 text-text-secondary-light dark:text-text-secondary-dark">
          {label}
        </span>
        <span className={cn("p-2 rounded-lg", iconBg[iconColor])}>
          <span className="material-symbols-outlined text-[22px]">{icon}</span>
        </span>
      </div>

      {loading ? (
        <div className="animate-pulse mt-2">
          <div className="h-7 w-28 bg-border-light dark:bg-border-dark rounded" />
        </div>
      ) : (
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-2xl font-800 text-text-main-light dark:text-text-main-dark">
            {value}
          </span>
          {trend && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 text-xs font-500 px-2 py-0.5 rounded-full",
                trendColor[trend.direction],
              )}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                {trendIcon[trend.direction]}
              </span>
              {trend.value}%
            </span>
          )}
        </div>
      )}

      {trend?.label && (
        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">
          {trend.label}
        </p>
      )}
    </div>
  )
}
