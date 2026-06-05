import { z } from "zod"

export const supplierSchema = z
  .object({
    partner_type: z.enum(["company", "individual"]),
    company_name: z.string().optional(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    tax_number: z.string().optional(),
    tax_office: z.string().optional(),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().optional(),
    payment_term_days: z.coerce.number().int().min(0).optional(),
    lead_time_days: z.coerce.number().int().min(0).optional(),
    currency: z.string().optional(),
    notes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.partner_type === "company" && !data.company_name) {
      ctx.addIssue({ code: "custom", message: "Company name is required", path: ["company_name"] })
    }
    if (data.partner_type === "individual" && !data.first_name) {
      ctx.addIssue({ code: "custom", message: "First name is required for individual partners", path: ["first_name"] })
    }
  })

export type SupplierFormValues = z.infer<typeof supplierSchema>
