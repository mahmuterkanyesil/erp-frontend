import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { Button, PageHeader, Card } from "@erp/ui"
import { useCreateCustomer, CustomerForm } from "@/features/customers"
import type { CustomerFormValues } from "@/features/customers"

export function NewCustomerPage() {
  const { t } = useTranslation("customers")
  const { t: tc } = useTranslation("common")
  const navigate = useNavigate()

  const createCustomer = useCreateCustomer((id) => {
    navigate({ to: "/customers/$customerId", params: { customerId: id } })
  })

  function handleSubmit(values: CustomerFormValues) {
    createCustomer.mutate({
      ...values,
      email: values.email || undefined,
      payment_term_days: values.payment_term_days ?? undefined,
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={t("newCustomer")}
        breadcrumbs={[
          { label: tc("nav.dashboard"), onClick: () => navigate({ to: "/" }) },
          { label: t("title"), onClick: () => navigate({ to: "/customers" }) },
          { label: t("newCustomer") },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => navigate({ to: "/customers" })}>
              {tc("cancel")}
            </Button>
            <Button
              type="submit"
              form="customer-form"
              loading={createCustomer.isPending}
            >
              {tc("save")}
            </Button>
          </div>
        }
      />

      <Card className="p-6">
        <CustomerForm onSubmit={handleSubmit} isPending={createCustomer.isPending} />
      </Card>
    </div>
  )
}
