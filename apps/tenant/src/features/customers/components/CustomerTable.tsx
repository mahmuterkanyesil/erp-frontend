import { useTranslation } from "react-i18next"
import { DataTable } from "@erp/ui"
import type { Column } from "@erp/ui"
import type { Customer } from "@erp/api-client"
import { CustomerStatusBadge } from "./CustomerStatusBadge"

interface Props {
  data: Customer[]
  loading?: boolean
  onRowClick?: (row: Customer) => void
}

export function CustomerTable({ data, loading, onRowClick }: Props) {
  const { t } = useTranslation("customers")
  const { t: tc } = useTranslation("common")

  const columns: Column<Customer>[] = [
    {
      key: "name",
      header: t("companyName"),
      cell: (row) => (
        <span className="font-500 text-sm text-text-main-light dark:text-text-main-dark">
          {row.name}
        </span>
      ),
    },
    {
      key: "email",
      header: t("email"),
      hideBelow: "md",
      cell: (row) => (
        <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
          {row.email ?? "—"}
        </span>
      ),
    },
    {
      key: "phone",
      header: t("phone"),
      hideBelow: "md",
      cell: (row) => (
        <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
          {row.phone ?? "—"}
        </span>
      ),
    },
    {
      key: "status",
      header: tc("status"),
      cell: (row) => <CustomerStatusBadge status={row.status} />,
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
            <span className="font-500 text-sm text-text-main-light dark:text-text-main-dark">
              {row.name}
            </span>
            {row.email && (
              <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                {row.email}
              </span>
            )}
            {row.phone && (
              <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                {row.phone}
              </span>
            )}
          </div>
          <CustomerStatusBadge status={row.status} />
        </div>
      )}
    />
  )
}
