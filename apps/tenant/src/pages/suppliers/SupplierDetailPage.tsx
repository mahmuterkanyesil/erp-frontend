import { useState } from "react"
import { useNavigate, useParams } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { cn } from "@erp/utils"
import { Button, PageHeader, Card, PermissionGate, Modal, TableSkeleton, EmptyState, Spinner } from "@erp/ui"
import { useLocaleFormat } from "@erp/hooks"
import {
  useSupplier, useSupplierOrders, useSupplierAccount,
  useUpdateSupplier,
  SupplierStatusBadge, SupplierForm,
} from "@/features/suppliers"
import type { SupplierFormValues } from "@/features/suppliers"

type TabKey = "orders" | "account"

export function SupplierDetailPage() {
  const { supplierId } = useParams({ from: "/protected/suppliers/$supplierId" })
  const { t } = useTranslation("suppliers")
  const { t: tc } = useTranslation("common")
  const navigate = useNavigate()
  const { formatDate, formatCurrency } = useLocaleFormat()
  const [activeTab, setActiveTab] = useState<TabKey>("orders")
  const [editOpen, setEditOpen] = useState(false)

  const { data: supplier, isLoading } = useSupplier(supplierId)
  const { data: orders = [], isLoading: ordersLoading } = useSupplierOrders(supplierId)
  const { data: account, isLoading: accountLoading } = useSupplierAccount(supplierId)

  const updateSupplier = useUpdateSupplier(supplierId, () => setEditOpen(false))

  function handleEditSubmit(values: SupplierFormValues) {
    updateSupplier.mutate({
      company_name: values.company_name,
      tax_number: values.tax_number || undefined,
      tax_office: values.tax_office || undefined,
      email: values.email || undefined,
      phone: values.phone || undefined,
      notes: values.notes || undefined,
    })
  }

  const tabs: { key: TabKey; label: string }[] = [
    { key: "orders", label: t("ordersTab") },
    { key: "account", label: t("accountTab") },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    )
  }

  if (!supplier) return null

  const primaryBalance = account?.balances?.[0]

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={supplier.name}
        breadcrumbs={[
          { label: tc("nav.dashboard"), onClick: () => navigate({ to: "/" }) },
          { label: t("title"), onClick: () => navigate({ to: "/suppliers" }) },
          { label: supplier.name },
        ]}
        actions={
          <PermissionGate permission="customers:update">
            <Button variant="ghost" leftIcon="edit" onClick={() => setEditOpen(true)}>
              {tc("edit")}
            </Button>
          </PermissionGate>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {/* Left column — info card */}
        <div className="flex flex-col gap-4">
          <Card className="p-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <span className="text-lg font-700 text-text-main-light dark:text-text-main-dark">
                {supplier.name}
              </span>
              <SupplierStatusBadge status={supplier.status} />
            </div>

            <div className="flex flex-col gap-3 text-sm">
              {supplier.email && (
                <div className="flex items-center gap-2 text-text-secondary-light dark:text-text-secondary-dark">
                  <span className="material-symbols-outlined text-[18px]">mail</span>
                  {supplier.email}
                </div>
              )}
              {supplier.phone && (
                <div className="flex items-center gap-2 text-text-secondary-light dark:text-text-secondary-dark">
                  <span className="material-symbols-outlined text-[18px]">call</span>
                  {supplier.phone}
                </div>
              )}
              {supplier.tax_number && (
                <div className="flex items-center gap-2 text-text-secondary-light dark:text-text-secondary-dark">
                  <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                  {supplier.tax_number}
                  {supplier.tax_office ? ` — ${supplier.tax_office}` : ""}
                </div>
              )}
            </div>

            {supplier.payment_term_days !== undefined && (
              <div className="mt-4 pt-4 border-t border-border-light dark:border-border-dark">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                    {t("paymentTermDays")}
                  </span>
                  <span className="text-sm font-500 text-text-main-light dark:text-text-main-dark">
                    {supplier.payment_term_days}
                  </span>
                </div>
              </div>
            )}

            {supplier.notes && (
              <div className="mt-4 pt-4 border-t border-border-light dark:border-border-dark">
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mb-1">
                  {tc("notes")}
                </p>
                <p className="text-sm text-text-main-light dark:text-text-main-dark whitespace-pre-wrap">
                  {supplier.notes}
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Right column — tabs */}
        <div className="lg:col-span-2 flex flex-col">
          <div className="flex border-b border-border-light dark:border-border-dark">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "px-4 py-3 text-sm font-500 border-b-2 transition-colors whitespace-nowrap",
                  activeTab === tab.key
                    ? "border-primary text-primary"
                    : "border-transparent text-text-secondary-light dark:text-text-secondary-dark hover:text-text-main-light dark:hover:text-text-main-dark",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <Card className="rounded-t-none p-4">
            {activeTab === "orders" && (
              ordersLoading ? <TableSkeleton /> :
              orders.length === 0 ? <EmptyState title={t("noOrders")} /> :
              <div className="flex flex-col divide-y divide-border-light dark:divide-border-dark">
                {orders.map((order) => (
                  <button
                    key={order.id}
                    onClick={() => navigate({ to: "/purchasing/$orderId", params: { orderId: order.id } })}
                    className="flex items-center justify-between gap-3 py-3 hover:text-primary transition-colors text-start"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-500 text-primary">#{order.id.slice(-8)}</span>
                      <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                        {formatDate(order.expected_at)}
                      </span>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-border-light dark:bg-border-dark text-text-secondary-light dark:text-text-secondary-dark">
                      {order.status}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {activeTab === "account" && (
              accountLoading ? <Spinner /> :
              !account ? <EmptyState title={t("noAccount")} /> :
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark">
                  <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                    {t("balance")}
                  </span>
                  <span className="text-lg font-700 text-text-main-light dark:text-text-main-dark">
                    {primaryBalance
                      ? formatCurrency(primaryBalance.net_balance, primaryBalance.currency)
                      : "—"}
                  </span>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Edit modal */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title={t("editSupplier")}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditOpen(false)}>{tc("cancel")}</Button>
            <Button type="submit" form="supplier-edit-form" loading={updateSupplier.isPending}>
              {tc("save")}
            </Button>
          </>
        }
      >
        <SupplierForm
          supplier={supplier}
          onSubmit={handleEditSubmit}
          isPending={updateSupplier.isPending}
          formId="supplier-edit-form"
        />
      </Modal>
    </div>
  )
}
