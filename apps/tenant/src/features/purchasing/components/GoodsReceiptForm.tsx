import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { Button, Input } from "@erp/ui"
import type { PurchaseOrderLine } from "@erp/api-client"
import { goodsReceiptSchema, type GoodsReceiptValues } from "../schemas/purchasing.schema"

interface Props {
  orderLines: PurchaseOrderLine[]
  onSubmit: (values: GoodsReceiptValues) => void
  isLoading?: boolean
  onCancel?: () => void
}

export function GoodsReceiptForm({ orderLines, onSubmit, isLoading, onCancel }: Props) {
  const { t } = useTranslation("purchasing")
  const { t: tc } = useTranslation("common")

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GoodsReceiptValues>({
    resolver: zodResolver(goodsReceiptSchema),
    defaultValues: {
      notes: "",
      lines: orderLines.map((l) => ({
        order_line_id: l.id,
        material_id: l.material_id,
        quantity: l.quantity - l.received_quantity,
        unit: l.unit,
      })),
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        {orderLines.map((line, idx) => (
          <div
            key={line.id}
            className="p-3 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-surface-dark"
          >
            <p className="text-sm font-500 text-text-main-light dark:text-text-main-dark mb-2">
              {line.material_name ?? line.material_id}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label={t("quantity")}
                type="number"
                step="0.001"
                {...register(`lines.${idx}.quantity`)}
                error={
                  (errors.lines?.[idx] as { quantity?: { message?: string } })?.quantity?.message
                }
              />
              <Input
                label={t("unit")}
                {...register(`lines.${idx}.unit`)}
                error={
                  (errors.lines?.[idx] as { unit?: { message?: string } })?.unit?.message
                }
              />
            </div>
            <input type="hidden" {...register(`lines.${idx}.order_line_id`)} />
            <input type="hidden" {...register(`lines.${idx}.material_id`)} />
          </div>
        ))}
      </div>
      <Input
        label={t("receiptNotes")}
        {...register("notes")}
        error={errors.notes?.message}
      />
      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            {tc("cancel")}
          </Button>
        )}
        <Button type="submit" loading={isLoading}>
          {t("goodsReceipt")}
        </Button>
      </div>
    </form>
  )
}
