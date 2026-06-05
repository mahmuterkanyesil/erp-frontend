import { z } from "zod"

export const customerSchema = z
  .object({
    partner_type: z.enum(["company", "individual"]),
    company_name: z.string().optional(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    tax_number: z.string().optional(),
    tax_office: z.string().optional(),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().optional(),
    segment: z.enum(["A", "B", "C"]).optional(),
    credit_amount: z.string().optional(),
    credit_currency: z.string().optional(),
    payment_term_days: z.coerce.number().int().min(0).optional(),
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

export type CustomerFormValues = z.infer<typeof customerSchema>
