import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Button, Input, Select } from "@erp/ui"
import type { SelectOption } from "@erp/ui"
import type { CreateRawMaterialRequest, MaterialType } from "@erp/api-client"

interface Props {
  onSubmit: (materials: CreateRawMaterialRequest[]) => void
  isLoading?: boolean
  onCancel?: () => void
}

const MATERIAL_TYPES: MaterialType[] = [
  "plastic_granule",
  "additive",
  "packaging",
  "semi_finished",
  "other",
]

interface RowState {
  name: string
  sku: string
  material_type: MaterialType
  unit: string
}

const EMPTY_ROW: RowState = { name: "", sku: "", material_type: "other", unit: "" }

export function BulkCreateForm({ onSubmit, isLoading, onCancel }: Props) {
  const { t } = useTranslation("purchasing")
  const { t: tc } = useTranslation("common")

  const [rows, setRows] = useState<RowState[]>([{ ...EMPTY_ROW }, { ...EMPTY_ROW }])

  const typeOptions: SelectOption[] = MATERIAL_TYPES.map((type) => ({
    value: type,
    label: t(`type_${type}`),
  }))

  function updateRow(idx: number, field: keyof RowState, value: string) {
    setRows((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, [field]: value } : row)),
    )
  }

  function addRow() {
    setRows((prev) => [...prev, { ...EMPTY_ROW }])
  }

  function removeRow(idx: number) {
    setRows((prev) => prev.filter((_, i) => i !== idx))
  }

  function handleSubmit() {
    const valid = rows.filter((r) => r.name.trim() && r.sku.trim() && r.unit.trim())
    if (valid.length === 0) return
    onSubmit(
      valid.map((r) => ({
        name: r.name.trim(),
        sku: r.sku.trim(),
        material_type: r.material_type,
        unit: r.unit.trim(),
      })),
    )
  }

  const hasValid = rows.some((r) => r.name.trim() && r.sku.trim() && r.unit.trim())

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pe-1">
        {rows.map((row, idx) => (
          <div
            key={idx}
            className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 items-start p-3 rounded-lg bg-background-light dark:bg-surface-dark border border-border-light dark:border-border-dark"
          >
            <Input
              label={idx === 0 ? t("material") : undefined}
              placeholder={t("material")}
              value={row.name}
              onChange={(e) => updateRow(idx, "name", e.target.value)}
            />
            <Input
              label={idx === 0 ? t("sku") : undefined}
              placeholder={t("sku")}
              value={row.sku}
              onChange={(e) => updateRow(idx, "sku", e.target.value)}
            />
            <Select
              label={idx === 0 ? t("materialType") : undefined}
              options={typeOptions}
              value={row.material_type}
              onChange={(e) => updateRow(idx, "material_type", e.target.value)}
            />
            <Input
              label={idx === 0 ? t("unit") : undefined}
              placeholder={t("unit")}
              value={row.unit}
              onChange={(e) => updateRow(idx, "unit", e.target.value)}
            />
            <div className={idx === 0 ? "pt-6" : ""}>
              <button
                type="button"
                onClick={() => removeRow(idx)}
                disabled={rows.length === 1}
                className="text-text-secondary-light dark:text-text-secondary-dark hover:text-danger disabled:opacity-30 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addRow}
        className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors self-start"
      >
        <span className="material-symbols-outlined text-[18px]">add</span>
        {t("bulkAddRow")}
      </button>

      <div className="flex justify-end gap-2 pt-2 border-t border-border-light dark:border-border-dark">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            {tc("cancel")}
          </Button>
        )}
        <Button type="button" disabled={!hasValid} loading={isLoading} onClick={handleSubmit}>
          {tc("create")}
        </Button>
      </div>
    </div>
  )
}
