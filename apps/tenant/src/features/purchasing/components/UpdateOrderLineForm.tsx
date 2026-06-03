import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { Button, Input } from "@erp/ui"
import type { PurchaseOrderLine } from "@erp/api-client"
import { updateOrderLineSchema, type UpdateOrderLineValues } from "../schemas/purchasing.schema"

interface Props {
  line: PurchaseOrderLine
  onSubmit: (values: UpdateOrderLineValues) => void
  isLoading?: boolean
  onCancel?: () => void
}

export function UpdateOrderLineForm({ line, onSubmit, isLoading, onCancel }: Props) {
  const { t } = useTranslation("purchasing")
  const { t: tc } = useTranslation("common")

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateOrderLineValues>({
    resolver: zodResolver(updateOrderLineSchema),
    defaultValues: {
      quantity: line.ordered_qty_value,
      unit_price: line.unit_price_amount,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <p className="text-sm font-500 text-text-main-light dark:text-text-main-dark">
        {line.material_name}{" "}
        <span className="text-text-secondary-light dark:text-text-secondary-dark font-400">
          {line.material_code}
        </span>
      </p>
      <div className="grid grid-cols-2 gap-3">
        <Input
          label={`${t("quantity")} (${line.ordered_qty_unit})`}
          type="number"
          step="0.001"
          {...register("quantity")}
          error={errors.quantity?.message}
        />
        <Input
          label={`${t("unitPrice")} (${line.unit_price_currency})`}
          type="text"
          placeholder="0.00"
          {...register("unit_price")}
          error={errors.unit_price?.message}
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            {tc("cancel")}
          </Button>
        )}
        <Button type="submit" loading={isLoading}>
          {tc("save")}
        </Button>
      </div>
    </form>
  )
}
