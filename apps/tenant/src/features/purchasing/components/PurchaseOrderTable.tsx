import { useTranslation } from "react-i18next"
import { DataTable } from "@erp/ui"
import type { Column } from "@erp/ui"
import type { PurchaseOrder } from "@erp/api-client"
import { PurchaseOrderStatusBadge } from "./PurchaseOrderStatusBadge"

interface Props {
  data: PurchaseOrder[]
  loading?: boolean
  onRowClick?: (row: PurchaseOrder) => void
}

export function PurchaseOrderTable({ data, loading, onRowClick }: Props) {
  const { t } = useTranslation("purchasing")
  const { t: tc } = useTranslation("common")

  const columns: Column<PurchaseOrder>[] = [
    {
      key: "id",
      header: "ID",
      cell: (row) => (
        <span className="font-500 text-primary text-sm">#{row.id.slice(-8)}</span>
      ),
    },
    {
      key: "supplier",
      header: t("supplier"),
      cell: (row) => (
        <span className="text-sm text-text-main-light dark:text-text-main-dark">
          {row.supplier_name ?? row.supplier_id}
        </span>
      ),
    },
    {
      key: "status",
      header: tc("status"),
      cell: (row) => <PurchaseOrderStatusBadge status={row.status} />,
    },
    {
      key: "expected_date",
      header: t("expectedDate"),
      hideBelow: "md",
      cell: (row) => (
        <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
          {new Date(row.expected_date).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "total",
      header: tc("total"),
      align: "end",
      cell: (row) => (
        <span className="text-sm font-500">
          {row.total_amount} {row.currency}
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
      emptyTitle={t("empty")}
      onRowClick={onRowClick}
      mobileCard={(row) => (
        <div className="flex items-start justify-between gap-3 p-4 bg-surface-light dark:bg-surface-dark rounded-lg border border-border-light dark:border-border-dark">
          <div className="flex flex-col gap-1">
            <span className="font-500 text-primary text-sm">#{row.id.slice(-8)}</span>
            <span className="text-sm text-text-main-light dark:text-text-main-dark">
              {row.supplier_name ?? row.supplier_id}
            </span>
            <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
              {new Date(row.expected_date).toLocaleDateString()}
            </span>
          </div>
          <div className="flex flex-col items-end gap-2">
            <PurchaseOrderStatusBadge status={row.status} />
            <span className="text-sm font-500">
              {row.total_amount} {row.currency}
            </span>
          </div>
        </div>
      )}
    />
  )
}
