import { useState } from "react"
import { useNavigate, useParams } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { cn } from "@erp/utils"
import { Button, PageHeader, Card, PermissionGate, Modal, TableSkeleton, EmptyState, Spinner } from "@erp/ui"
import { useLocaleFormat } from "@erp/hooks"
import {
  useCustomer, useCustomerOrders, useCustomerDefaultAddress, useCustomerAccount,
  useUpdateCustomer, useUpdateCustomerRole,
  CustomerStatusBadge, CustomerForm,
} from "@/features/customers"
import type { CustomerFormValues } from "@/features/customers"

type TabKey = "orders" | "account" | "addresses"

export function CustomerDetailPage() {
  const { customerId } = useParams({ from: "/protected/customers/$customerId" })
  const { t } = useTranslation("customers")
  const { t: tc } = useTranslation("common")
  const navigate = useNavigate()
  const { formatDate, formatCurrency } = useLocaleFormat()
  const [activeTab, setActiveTab] = useState<TabKey>("orders")
  const [editOpen, setEditOpen] = useState(false)

  const { data: customer, isLoading } = useCustomer(customerId)
  const { data: orders = [], isLoading: ordersLoading } = useCustomerOrders(customerId)
  const { data: defaultAddress, isLoading: addressesLoading } = useCustomerDefaultAddress(customerId)
  const { data: account, isLoading: accountLoading } = useCustomerAccount(customerId)

  const updateCustomer = useUpdateCustomer(customerId)
  const updateCustomerRole = useUpdateCustomerRole(customerId, () => setEditOpen(false))

  function handleEditSubmit(values: CustomerFormValues) {
    updateCustomer.mutate({
      company_name: values.company_name,
      tax_number: values.tax_number || undefined,
      tax_office: values.tax_office || undefined,
      email: values.email || undefined,
      phone: values.phone || undefined,
      notes: values.notes || undefined,
    })
    updateCustomerRole.mutate({
      segment: values.segment,
      payment_term_days: values.payment_term_days,
      credit_amount: values.credit_limit || undefined,
    })
  }

  const tabs: { key: TabKey; label: string }[] = [
    { key: "orders", label: t("ordersTab") },
    { key: "account", label: t("accountTab") },
    { key: "addresses", label: t("addressesTab") },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    )
  }

  if (!customer) return null

  const primaryBalance = account?.balances?.[0]

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={customer.name}
        breadcrumbs={[
          { label: tc("nav.dashboard"), onClick: () => navigate({ to: "/" }) },
          { label: t("title"), onClick: () => navigate({ to: "/customers" }) },
          { label: customer.name },
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
                {customer.name}
              </span>
              <CustomerStatusBadge status={customer.status} />
            </div>

            <div className="flex flex-col gap-3 text-sm">
              {customer.email && (
                <div className="flex items-center gap-2 text-text-secondary-light dark:text-text-secondary-dark">
                  <span className="material-symbols-outlined text-[18px]">mail</span>
                  {customer.email}
                </div>
              )}
              {customer.phone && (
                <div className="flex items-center gap-2 text-text-secondary-light dark:text-text-secondary-dark">
                  <span className="material-symbols-outlined text-[18px]">call</span>
                  {customer.phone}
                </div>
              )}
              {customer.tax_number && (
                <div className="flex items-center gap-2 text-text-secondary-light dark:text-text-secondary-dark">
                  <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                  {customer.tax_number}
                  {customer.tax_office ? ` — ${customer.tax_office}` : ""}
                </div>
              )}
            </div>

            {(customer.segment || customer.credit_limit || customer.payment_term_days !== undefined) && (
              <div className="mt-4 pt-4 border-t border-border-light dark:border-border-dark grid grid-cols-2 gap-3">
                {customer.segment && (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                      {t("segment")}
                    </span>
                    <span className="text-sm font-500 text-text-main-light dark:text-text-main-dark">
                      {t(`segment_${customer.segment}`)}
                    </span>
                  </div>
                )}
                {customer.credit_limit && (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                      {t("creditLimit")}
                    </span>
                    <span className="text-sm font-500 text-text-main-light dark:text-text-main-dark">
                      {formatCurrency(customer.credit_limit, "TRY")}
                    </span>
                  </div>
                )}
                {customer.payment_term_days !== undefined && (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                      {t("paymentTermDays")}
                    </span>
                    <span className="text-sm font-500 text-text-main-light dark:text-text-main-dark">
                      {customer.payment_term_days}
                    </span>
                  </div>
                )}
              </div>
            )}

            {customer.notes && (
              <div className="mt-4 pt-4 border-t border-border-light dark:border-border-dark">
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mb-1">
                  {tc("notes")}
                </p>
                <p className="text-sm text-text-main-light dark:text-text-main-dark whitespace-pre-wrap">
                  {customer.notes}
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
                  <div
                    key={order.id}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-500 text-primary">#{order.id.slice(-8)}</span>
                      <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-border-light dark:bg-border-dark text-text-secondary-light dark:text-text-secondary-dark">
                      {order.status}
                    </span>
                  </div>
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

            {activeTab === "addresses" && (
              addressesLoading ? <TableSkeleton /> :
              !defaultAddress ? <EmptyState title={t("noAddresses")} /> :
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3 p-3 rounded-lg border border-border-light dark:border-border-dark">
                  <div className="flex flex-col gap-0.5 text-sm text-text-main-light dark:text-text-main-dark">
                    {defaultAddress.label && (
                      <span className="text-xs font-500 text-text-secondary-light dark:text-text-secondary-dark">
                        {defaultAddress.label}
                      </span>
                    )}
                    {defaultAddress.street && <span>{defaultAddress.street}</span>}
                    <span>
                      {[defaultAddress.district, defaultAddress.city, defaultAddress.postal_code].filter(Boolean).join(", ")}
                    </span>
                    {defaultAddress.country && <span>{defaultAddress.country}</span>}
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-500 shrink-0">
                    {t("defaultAddress")}
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
        title={t("editCustomer")}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditOpen(false)}>{tc("cancel")}</Button>
            <Button type="submit" form="customer-edit-form" loading={updateCustomer.isPending || updateCustomerRole.isPending}>
              {tc("save")}
            </Button>
          </>
        }
      >
        <CustomerForm
          customer={customer}
          onSubmit={handleEditSubmit}
          isPending={updateCustomer.isPending}
          formId="customer-edit-form"
        />
      </Modal>
    </div>
  )
}
