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
          name: supplier.name,
          tax_number: supplier.tax_number ?? "",
          tax_office: supplier.tax_office ?? "",
          email: supplier.email ?? "",
          phone: supplier.phone ?? "",
          payment_term_days: supplier.payment_term_days,
          billing_street: supplier.billing_street ?? "",
          billing_district: supplier.billing_district ?? "",
          billing_city: supplier.billing_city ?? "",
          billing_postal_code: supplier.billing_postal_code ?? "",
          billing_country: supplier.billing_country ?? "",
          notes: supplier.notes ?? "",
        }
      : defaultValues,
  })

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Input
            label={t("name")}
            required
            error={errors.name?.message}
            disabled={isPending}
            {...register("name")}
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
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-sm font-500 text-text-main-light dark:text-text-main-dark border-b border-border-light dark:border-border-dark pb-2">
          {t("address")}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Input label={t("street")} disabled={isPending} {...register("billing_street")} />
          </div>
          <Input label={t("district")} disabled={isPending} {...register("billing_district")} />
          <Input label={t("city")} disabled={isPending} {...register("billing_city")} />
          <Input label={t("postalCode")} disabled={isPending} {...register("billing_postal_code")} />
          <Input label={t("country")} disabled={isPending} {...register("billing_country")} />
        </div>
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
