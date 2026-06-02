import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { Button, PageHeader, PermissionGate } from "@erp/ui"
import { usePurchaseOrders, PurchaseOrderTable } from "@/features/purchasing"
import type { PurchaseOrder } from "@erp/api-client"

export function PurchasingPage() {
  const { t } = useTranslation("purchasing")
  const { t: tc } = useTranslation("common")
  const navigate = useNavigate()

  const { data = [], isLoading } = usePurchaseOrders()

  function handleRowClick(row: PurchaseOrder) {
    navigate({ to: "/purchasing/$orderId", params: { orderId: row.id } })
  }

  return (
    <div>
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
      <PurchaseOrderTable data={data} loading={isLoading} onRowClick={handleRowClick} />
    </div>
  )
}
