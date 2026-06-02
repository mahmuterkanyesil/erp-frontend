import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { Button, Input, Select } from "@erp/ui"
import type { SelectOption } from "@erp/ui"
import { addOrderLineSchema, type AddOrderLineValues } from "../schemas/purchasing.schema"

interface Props {
  materials: SelectOption[]
  onSubmit: (values: AddOrderLineValues) => void
  isLoading?: boolean
  onCancel?: () => void
}

const unitOptions: SelectOption[] = [
  { value: "kg", label: "kg" },
  { value: "g", label: "g" },
  { value: "adet", label: "Adet" },
  { value: "lt", label: "Litre" },
  { value: "m", label: "Metre" },
]

export function AddLineForm({ materials, onSubmit, isLoading, onCancel }: Props) {
  const { t } = useTranslation("purchasing")
  const { t: tc } = useTranslation("common")

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddOrderLineValues>({
    resolver: zodResolver(addOrderLineSchema),
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Select
        label={t("material")}
        options={materials}
        value={watch("material_id") ?? ""}
        onChange={(e) => setValue("material_id", e.target.value)}
        error={errors.material_id?.message}
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          label={t("quantity")}
          type="number"
          step="0.001"
          {...register("quantity")}
          error={errors.quantity?.message}
        />
        <Select
          label={t("unit")}
          options={unitOptions}
          value={watch("unit") ?? ""}
          onChange={(e) => setValue("unit", e.target.value)}
          error={errors.unit?.message}
        />
      </div>
      <Input
        label={t("unitPrice")}
        placeholder="0.00"
        {...register("unit_price")}
        error={errors.unit_price?.message}
      />
      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            {tc("cancel")}
          </Button>
        )}
        <Button type="submit" loading={isLoading}>
          {t("addLine")}
        </Button>
      </div>
    </form>
  )
}
