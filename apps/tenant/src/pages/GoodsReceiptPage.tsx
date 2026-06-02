import { useParams, useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { Card, PageHeader, FormSkeleton } from "@erp/ui"
import { usePurchaseOrder, useCreateReceipt, GoodsReceiptForm } from "@/features/purchasing"
import type { GoodsReceiptValues } from "@/features/purchasing"

export function GoodsReceiptPage() {
  const { orderId } = useParams({ from: "/protected/purchasing/$orderId/receipt" })
  const navigate = useNavigate()
  const { t } = useTranslation("purchasing")
  const { t: tc } = useTranslation("common")

  const { data: order, isLoading } = usePurchaseOrder(orderId)
  const { mutate, isPending } = useCreateReceipt(orderId, () => {
    navigate({ to: "/purchasing/$orderId", params: { orderId } })
  })

  if (isLoading) return <FormSkeleton />
  if (!order) return null

  function handleSubmit(values: GoodsReceiptValues) {
    mutate(values)
  }

  return (
    <div>
      <PageHeader
        title={t("goodsReceipt")}
        breadcrumbs={[
          { label: tc("nav.dashboard"), onClick: () => navigate({ to: "/" }) },
          { label: t("title"), onClick: () => navigate({ to: "/purchasing" }) },
          {
            label: `#${order.id.slice(-8)}`,
            onClick: () => navigate({ to: "/purchasing/$orderId", params: { orderId } }),
          },
          { label: t("goodsReceipt") },
        ]}
      />
      <Card className="max-w-2xl">
        <GoodsReceiptForm
          orderLines={order.lines}
          onSubmit={handleSubmit}
          isLoading={isPending}
          onCancel={() => navigate({ to: "/purchasing/$orderId", params: { orderId } })}
        />
      </Card>
    </div>
  )
}
