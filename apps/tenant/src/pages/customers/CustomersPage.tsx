import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { cn } from "@erp/utils"
import { Button, PageHeader, PermissionGate, Input } from "@erp/ui"
import { useDebounce } from "@erp/hooks"
import { useCustomers, CustomerTable } from "@/features/customers"
import type { Customer } from "@erp/api-client"

type StatusFilter = "all" | "active" | "inactive"

export function CustomersPage() {
  const { t } = useTranslation("customers")
  const { t: tc } = useTranslation("common")
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const debouncedSearch = useDebounce(search, 400)

  const { data = [], isLoading } = useCustomers({
    q: debouncedSearch || undefined,
    status: statusFilter,
  })

  function handleRowClick(row: Customer) {
    navigate({ to: "/customers/$customerId", params: { customerId: row.id } })
  }

  const filters: StatusFilter[] = ["all", "active", "inactive"]

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={t("title")}
        breadcrumbs={[
          { label: tc("nav.dashboard"), onClick: () => navigate({ to: "/" }) },
          { label: t("title") },
        ]}
        actions={
          <PermissionGate permission="customers:create">
            <Button leftIcon="add" onClick={() => navigate({ to: "/customers/new" })}>
              {t("newCustomer")}
            </Button>
          </PermissionGate>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 max-w-sm">
          <Input
            leftIcon="search"
            placeholder={t("searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-500 transition-colors border",
                statusFilter === f
                  ? "bg-primary text-white border-transparent"
                  : "border-border-light dark:border-border-dark text-text-secondary-light dark:text-text-secondary-dark bg-surface-light dark:bg-surface-dark hover:border-primary hover:text-primary",
              )}
            >
              {t(f === "all" ? "filterAll" : f === "active" ? "filterActive" : "filterInactive")}
            </button>
          ))}
        </div>
      </div>

      <CustomerTable data={data} loading={isLoading} onRowClick={handleRowClick} />
    </div>
  )
}
