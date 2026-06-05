import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { Card, PageHeader } from "@erp/ui"
import { PurchaseOrderForm, useCreatePurchaseOrder, useWarehouses } from "@/features/purchasing"
import type { CreatePurchaseOrderValues } from "@/features/purchasing"
import { useSuppliers } from "@/features/suppliers"

export function NewPurchaseOrderPage() {
  const { t } = useTranslation("purchasing")
  const { t: tc } = useTranslation("common")
  const navigate = useNavigate()

  const { data: suppliers = [] } = useSuppliers()
  const { data: warehouses = [] } = useWarehouses()

  const { mutate, isPending } = useCreatePurchaseOrder(() => {
    navigate({ to: "/purchasing" })
  })

  const supplierOptions = suppliers.map((s) => ({ value: s.id, label: s.name }))
  const warehouseOptions = warehouses.map((w) => ({
    value: w.id,
    label: w.code ? `${w.name} (${w.code})` : w.name,
  }))

  function handleSubmit(values: CreatePurchaseOrderValues) {
    mutate(values)
  }

  return (
    <div>
      <PageHeader
        title={t("newOrder")}
        breadcrumbs={[
          { label: tc("nav.dashboard"), onClick: () => navigate({ to: "/" }) },
          { label: t("title"), onClick: () => navigate({ to: "/purchasing" }) },
          { label: t("newOrder") },
        ]}
      />
      <Card className="max-w-2xl">
        <PurchaseOrderForm
          suppliers={supplierOptions}
          warehouses={warehouseOptions}
          onSubmit={handleSubmit}
          isLoading={isPending}
          onCancel={() => navigate({ to: "/purchasing" })}
        />
      </Card>
    </div>
  )
}
