import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { Card, PageHeader } from "@erp/ui"
import { PurchaseOrderForm, useCreatePurchaseOrder } from "@/features/purchasing"
import type { CreatePurchaseOrderValues } from "@/features/purchasing"

// Supplier/warehouse seçenekleri — ilgili modüller tamamlandığında gerçek query ile değiştirilecek
const EMPTY_OPTIONS = [{ value: "", label: "—" }]

export function NewPurchaseOrderPage() {
  const { t } = useTranslation("purchasing")
  const { t: tc } = useTranslation("common")
  const navigate = useNavigate()

  const { mutate, isPending } = useCreatePurchaseOrder(() => {
    navigate({ to: "/purchasing" })
  })

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
          suppliers={EMPTY_OPTIONS}
          warehouses={EMPTY_OPTIONS}
          onSubmit={handleSubmit}
          isLoading={isPending}
          onCancel={() => navigate({ to: "/purchasing" })}
        />
      </Card>
    </div>
  )
}
