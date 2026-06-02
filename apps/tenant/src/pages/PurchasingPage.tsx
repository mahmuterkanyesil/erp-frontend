import { useNavigate, useSearch } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { cn } from "@erp/utils"
import { Button, PageHeader, PermissionGate } from "@erp/ui"
import { usePurchaseOrders, PurchaseOrderTable } from "@/features/purchasing"
import type { PurchaseOrder, PurchaseOrderStatus } from "@erp/api-client"

type StatusFilter = PurchaseOrderStatus | "all"

const STATUS_FILTERS: StatusFilter[] = [
  "all",
  "draft",
  "confirmed",
  "partially_received",
  "received",
  "cancelled",
]

const activeChipClass: Record<StatusFilter, string> = {
  all:                "bg-primary text-white",
  draft:              "bg-border-light dark:bg-border-dark text-text-main-light dark:text-text-main-dark",
  confirmed:          "bg-info text-white",
  partially_received: "bg-warning text-white",
  received:           "bg-success text-white",
  cancelled:          "bg-danger text-white",
}

export function PurchasingPage() {
  const { t } = useTranslation("purchasing")
  const { t: tc } = useTranslation("common")
  const navigate = useNavigate()
  const { status = "all" } = useSearch({ from: "/protected/purchasing" })

  const { data = [], isLoading } = usePurchaseOrders(
    status !== "all" ? { status } : undefined,
  )

  function handleRowClick(row: PurchaseOrder) {
    navigate({ to: "/purchasing/$orderId", params: { orderId: row.id } })
  }

  function handleStatusChange(next: StatusFilter) {
    navigate({
      to: "/purchasing",
      search: next === "all" ? {} : { status: next },
      replace: true,
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={t("title")}
        breadcrumbs={[
          { label: tc("nav.dashboard"), onClick: () => navigate({ to: "/" }) },
          { label: t("title") },
        ]}
        actions={
          <PermissionGate permission="purchasing:create">
            <Button leftIcon="add" onClick={() => navigate({ to: "/purchasing/new" })}>
              {t("newOrder")}
            </Button>
          </PermissionGate>
        }
      />

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((s) => {
          const isActive = s === "all" ? !status || status === "all" : status === s
          return (
            <button
              key={s}
              onClick={() => handleStatusChange(s)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-500 transition-colors border",
                isActive
                  ? cn(activeChipClass[s], "border-transparent")
                  : "border-border-light dark:border-border-dark text-text-secondary-light dark:text-text-secondary-dark bg-surface-light dark:bg-surface-dark hover:border-primary hover:text-primary",
              )}
            >
              {s === "all" ? t("filterAll") : t(`status_${s}`)}
            </button>
          )
        })}
      </div>

      <PurchaseOrderTable data={data} loading={isLoading} onRowClick={handleRowClick} />
    </div>
  )
}
