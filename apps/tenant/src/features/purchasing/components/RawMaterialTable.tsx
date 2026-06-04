import { useTranslation } from "react-i18next"
import { DataTable } from "@erp/ui"
import type { Column } from "@erp/ui"
import type { RawMaterial } from "@erp/api-client"

interface Props {
  data: RawMaterial[]
  loading?: boolean
  onRowClick?: (row: RawMaterial) => void
}

export function RawMaterialTable({ data, loading, onRowClick }: Props) {
  const { t } = useTranslation("purchasing")

  const columns: Column<RawMaterial>[] = [
    {
      key: "name",
      header: t("material"),
      cell: (row) => (
        <div>
          <span className="font-500 text-sm text-text-main-light dark:text-text-main-dark">
            {row.name}
          </span>
          <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
            {row.code}
          </div>
        </div>
      ),
    },
    {
      key: "material_type",
      header: t("materialType"),
      cell: (row) => (
        <span className="text-sm text-text-main-light dark:text-text-main-dark">
          {t(`type_${row.material_type}`)}
        </span>
      ),
    },
    {
      key: "unit",
      header: t("unit"),
      cell: (row) => (
        <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
          {row.unit}
        </span>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={data}
      keyExtractor={(row) => row.id}
      loading={loading}
      emptyTitle={t("emptyMaterials")}
      onRowClick={onRowClick}
      mobileCard={(row) => (
        <div className="flex items-start justify-between gap-3 p-4 bg-surface-light dark:bg-surface-dark rounded-lg border border-border-light dark:border-border-dark">
          <div className="flex flex-col gap-1">
            <span className="font-500 text-sm text-text-main-light dark:text-text-main-dark">
              {row.name}
            </span>
            <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
              {row.code} · {t(`type_${row.material_type}`)}
            </span>
          </div>
          <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark shrink-0">
            {row.unit}
          </span>
        </div>
      )}
    />
  )
}
