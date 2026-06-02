import { type ReactNode } from "react"
import { cn } from "@erp/utils"

interface EmptyStateProps {
  icon?: string        // Material Symbol name
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

/**
 * Shown when a list or table has no data.
 *
 * @example
 * <EmptyState
 *   icon="shopping_cart"
 *   title={t("orders.empty")}
 *   description="Yeni sipariş oluşturmak için butona tıklayın."
 *   action={
 *     <PermissionGate permission="orders:create">
 *       <Button leftIcon="add">Yeni Sipariş</Button>
 *     </PermissionGate>
 *   }
 * />
 */
export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 py-16 px-6 text-center",
        className,
      )}
    >
      {icon && (
        <div className="flex items-center justify-center size-14 rounded-2xl bg-background-light dark:bg-background-dark">
          <span className="material-symbols-outlined text-[32px] text-text-secondary-light dark:text-text-secondary-dark">
            {icon}
          </span>
        </div>
      )}

      <div className="flex flex-col gap-1.5 max-w-sm">
        <p className="font-700 text-base text-text-main-light dark:text-text-main-dark">{title}</p>
        {description && (
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
