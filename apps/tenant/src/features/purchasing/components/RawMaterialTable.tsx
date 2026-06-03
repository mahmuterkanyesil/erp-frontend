import { useTranslation } from "react-i18next"
import { cn } from "@erp/utils"
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
            {row.sku}
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
    {
      key: "current_stock",
      header: t("currentStock"),
      align: "end",
      cell: (row) => {
        const isBelowMin =
          row.min_stock_level != null &&
          row.current_stock != null &&
          row.current_stock < row.min_stock_level
        return (
          <div className="flex flex-col items-end gap-0.5">
            <span
              className={cn(
                "text-sm font-500",
                isBelowMin
                  ? "text-danger"
                  : "text-text-main-light dark:text-text-main-dark",
              )}
            >
              {row.current_stock ?? "—"} {row.unit}
            </span>
            {isBelowMin && (
              <span className="text-xs text-danger flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[14px]">warning</span>
                {t("belowMinWarning")}
              </span>
            )}
          </div>
        )
      },
    },
    {
      key: "min_stock_level",
      header: t("minStockLevel"),
      align: "end",
      hideBelow: "md",
      cell: (row) => (
        <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
          {row.min_stock_level ?? "—"}
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
      mobileCard={(row) => {
        const isBelowMin =
          row.min_stock_level != null &&
          row.current_stock != null &&
          row.current_stock < row.min_stock_level
        return (
          <div className="flex items-start justify-between gap-3 p-4 bg-surface-light dark:bg-surface-dark rounded-lg border border-border-light dark:border-border-dark">
            <div className="flex flex-col gap-1">
              <span className="font-500 text-sm text-text-main-light dark:text-text-main-dark">
                {row.name}
              </span>
              <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                {row.sku} · {t(`type_${row.material_type}`)}
              </span>
              {isBelowMin && (
                <span className="text-xs text-danger flex items-center gap-0.5 mt-0.5">
                  <span className="material-symbols-outlined text-[14px]">warning</span>
                  {t("belowMinWarning")}
                </span>
              )}
            </div>
            <span
              className={cn(
                "text-sm font-500 shrink-0",
                isBelowMin ? "text-danger" : "text-text-main-light dark:text-text-main-dark",
              )}
            >
              {row.current_stock ?? "—"} {row.unit}
            </span>
          </div>
        )
      }}
    />
  )
}
