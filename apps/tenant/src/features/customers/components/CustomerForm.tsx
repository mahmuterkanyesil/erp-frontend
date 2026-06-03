import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { Input, Textarea, Select } from "@erp/ui"
import type { Customer } from "@erp/api-client"
import { customerSchema } from "../schemas/customer.schema"
import type { CustomerFormValues } from "../schemas/customer.schema"

interface Props {
  defaultValues?: Partial<CustomerFormValues>
  customer?: Customer
  onSubmit: (values: CustomerFormValues) => void
  isPending?: boolean
  formId?: string
}

const SEGMENT_OPTIONS = [
  { value: "", label: "—" },
  { value: "A", label: "A" },
  { value: "B", label: "B" },
  { value: "C", label: "C" },
]

export function CustomerForm({ defaultValues, customer, onSubmit, isPending, formId = "customer-form" }: Props) {
  const { t } = useTranslation("customers")
  const { t: tc } = useTranslation("common")

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: customer
      ? {
          company_name: customer.company_name ?? customer.name,
          tax_number: customer.tax_number ?? "",
          tax_office: customer.tax_office ?? "",
          email: customer.email ?? "",
          phone: customer.phone ?? "",
          segment: customer.segment,
          credit_limit: customer.credit_limit ?? "",
          payment_term_days: customer.payment_term_days,
          notes: customer.notes ?? "",
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
        <Select
          label={t("segment")}
          options={SEGMENT_OPTIONS}
          disabled={isPending}
          {...register("segment")}
        />
        <Input
          label={t("creditLimit")}
          leftIcon="account_balance_wallet"
          error={errors.credit_limit?.message}
          disabled={isPending}
          {...register("credit_limit")}
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

      <Textarea
        label={tc("notes")}
        rows={3}
        disabled={isPending}
        {...register("notes")}
      />
    </form>
  )
}
