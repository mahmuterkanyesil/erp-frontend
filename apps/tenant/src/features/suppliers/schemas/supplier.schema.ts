import { z } from "zod"

export const supplierSchema = z.object({
  name: z.string().min(1),
  tax_number: z.string().optional(),
  tax_office: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  payment_term_days: z.coerce.number().int().min(0).optional(),
  billing_street: z.string().optional(),
  billing_district: z.string().optional(),
  billing_city: z.string().optional(),
  billing_postal_code: z.string().optional(),
  billing_country: z.string().optional(),
  notes: z.string().optional(),
})

export type SupplierFormValues = z.infer<typeof supplierSchema>
