import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { Button, PageHeader, Card } from "@erp/ui"
import { useCreateSupplier, SupplierForm } from "@/features/suppliers"
import type { SupplierFormValues } from "@/features/suppliers"

export function NewSupplierPage() {
  const { t } = useTranslation("suppliers")
  const { t: tc } = useTranslation("common")
  const navigate = useNavigate()

  const createSupplier = useCreateSupplier((id) => {
    navigate({ to: "/suppliers/$supplierId", params: { supplierId: id } })
  })

  function handleSubmit(values: SupplierFormValues) {
    createSupplier.mutate({
      ...values,
      email: values.email || undefined,
      payment_term_days: values.payment_term_days ?? undefined,
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={t("newSupplier")}
        breadcrumbs={[
          { label: tc("nav.dashboard"), onClick: () => navigate({ to: "/" }) },
          { label: t("title"), onClick: () => navigate({ to: "/suppliers" }) },
          { label: t("newSupplier") },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => navigate({ to: "/suppliers" })}>
              {tc("cancel")}
            </Button>
            <Button
              type="submit"
              form="supplier-form"
              loading={createSupplier.isPending}
            >
              {tc("save")}
            </Button>
          </div>
        }
      />

      <Card className="p-6">
        <SupplierForm onSubmit={handleSubmit} isPending={createSupplier.isPending} />
      </Card>
    </div>
  )
}
