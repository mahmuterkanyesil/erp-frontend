import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { Button, Input, Select } from "@erp/ui"
import type { SelectOption } from "@erp/ui"
import { createRawMaterialSchema, type CreateRawMaterialValues } from "../schemas/purchasing.schema"

interface Props {
  onSubmit: (values: CreateRawMaterialValues) => void
  isLoading?: boolean
  onCancel?: () => void
}

export function RawMaterialForm({ onSubmit, isLoading, onCancel }: Props) {
  const { t } = useTranslation("purchasing")
  const { t: tc } = useTranslation("common")

  const materialTypeOptions: SelectOption[] = [
    { value: "plastic_granule", label: t("type_plastic_granule") },
    { value: "additive", label: t("type_additive") },
    { value: "packaging", label: t("type_packaging") },
    { value: "semi_finished", label: t("type_semi_finished") },
    { value: "other", label: t("type_other") },
  ]

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateRawMaterialValues>({
    resolver: zodResolver(createRawMaterialSchema),
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label={tc("name")}
          {...register("name")}
          error={errors.name?.message}
        />
        <Input
          label={t("sku")}
          {...register("code")}
          error={errors.code?.message}
        />
        <Select
          label={t("materialType")}
          options={materialTypeOptions}
          value={watch("material_type") ?? ""}
          onChange={(e) =>
            setValue("material_type", e.target.value as CreateRawMaterialValues["material_type"])
          }
          error={errors.material_type?.message}
        />
        <Input
          label={t("unit")}
          {...register("unit")}
          error={errors.unit?.message}
        />
      </div>
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
