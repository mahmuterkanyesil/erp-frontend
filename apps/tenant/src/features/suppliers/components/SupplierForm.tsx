import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { Input, Textarea } from "@erp/ui"
import type { Supplier } from "@erp/api-client"
import { supplierSchema } from "../schemas/supplier.schema"
import type { SupplierFormValues } from "../schemas/supplier.schema"

interface Props {
  defaultValues?: Partial<SupplierFormValues>
  supplier?: Supplier
  onSubmit: (values: SupplierFormValues) => void
  isPending?: boolean
  formId?: string
}

export function SupplierForm({ defaultValues, supplier, onSubmit, isPending, formId = "supplier-form" }: Props) {
  const { t } = useTranslation("suppliers")
  const { t: tc } = useTranslation("common")

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: supplier
      ? {
          company_name: supplier.company_name ?? supplier.name,
          tax_number: supplier.tax_number ?? "",
          tax_office: supplier.tax_office ?? "",
          email: supplier.email ?? "",
          phone: supplier.phone ?? "",
          payment_term_days: supplier.payment_term_days,
          lead_time_days: supplier.lead_time_days,
          currency: supplier.currency ?? "",
          notes: supplier.notes ?? "",
        }
      : defaultValues,
  })

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Input
            label={t("companyName")}
            required
            error={errors.company_name?.message}
            disabled={isPending}
            {...register("company_name")}
          />
        </div>
        <Input
          label={t("taxNumber")}
          error={errors.tax_number?.message}
          disabled={isPending}
          {...register("tax_number")}
        />
        <Input
          label={t("taxOffice")}
          error={errors.tax_office?.message}
          disabled={isPending}
          {...register("tax_office")}
        />
        <Input
          label={t("email")}
          type="email"
          leftIcon="mail"
          error={errors.email?.message}
          disabled={isPending}
          {...register("email")}
        />
        <Input
          label={t("phone")}
          type="tel"
          leftIcon="call"
          error={errors.phone?.message}
          disabled={isPending}
          {...register("phone")}
        />
        <Input
          label={t("paymentTermDays")}
          type="number"
          min={0}
          error={errors.payment_term_days?.message}
          disabled={isPending}
          {...register("payment_term_days")}
        />
        <Input
          label={t("leadTimeDays")}
          type="number"
          min={0}
          error={errors.lead_time_days?.message}
          disabled={isPending}
          {...register("lead_time_days")}
        />
        <Input
          label={t("currency")}
          error={errors.currency?.message}
          disabled={isPending}
          {...register("currency")}
        />
      </div>

      <Textarea
        label={tc("notes")}
        rows={3}
        disabled={isPending}
        {...register("notes")}
      />
    </form>
  )
}
