import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { Button, Input, Select } from "@erp/ui"
import type { SelectOption } from "@erp/ui"
import {
  createPurchaseOrderSchema,
  type CreatePurchaseOrderValues,
} from "../schemas/purchasing.schema"

interface Props {
  suppliers: SelectOption[]
  warehouses: SelectOption[]
  onSubmit: (values: CreatePurchaseOrderValues) => void
  isLoading?: boolean
  onCancel?: () => void
}

export function PurchaseOrderForm({ suppliers, warehouses, onSubmit, isLoading, onCancel }: Props) {
  const { t } = useTranslation("purchasing")
  const { t: tc } = useTranslation("common")

  const sourceOptions: SelectOption[] = [
    { value: "MANUAL", label: t("source_MANUAL") },
    { value: "ORDER", label: t("source_ORDER") },
  ]

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreatePurchaseOrderValues>({
    resolver: zodResolver(createPurchaseOrderSchema),
    defaultValues: { source: "MANUAL" },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label={t("supplier")}
          options={suppliers}
          value={watch("supplier_id") ?? ""}
          onChange={(e) => setValue("supplier_id", e.target.value)}
          error={errors.supplier_id?.message}
        />
        <Select
          label={t("warehouse")}
          options={warehouses}
          value={watch("warehouse_id") ?? ""}
          onChange={(e) => setValue("warehouse_id", e.target.value)}
          error={errors.warehouse_id?.message}
        />
        <Select
          label={t("source")}
          options={sourceOptions}
          value={watch("source")}
          onChange={(e) => setValue("source", e.target.value as "MANUAL" | "ORDER")}
          error={errors.source?.message}
        />
        <Input
          label={t("expectedDate")}
          type="date"
          {...register("expected_at")}
          error={errors.expected_at?.message}
        />
      </div>
      <Input
        label={tc("notes")}
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
          {tc("create")}
        </Button>
      </div>
    </form>
  )
}
