import { z } from "zod"

export const customerSchema = z.object({
  company_name: z.string().min(1),
  tax_number: z.string().optional(),
  tax_office: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  segment: z.enum(["A", "B", "C"]).optional(),
  credit_limit: z.string().optional(),
  payment_term_days: z.coerce.number().int().min(0).optional(),
  notes: z.string().optional(),
})

export type CustomerFormValues = z.infer<typeof customerSchema>
