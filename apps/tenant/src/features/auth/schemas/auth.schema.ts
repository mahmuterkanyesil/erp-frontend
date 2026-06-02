import { z } from "zod"

export const loginSchema = z.object({
  tenant_id: z
    .string()
    .min(1, "Firma kodu zorunludur")
    .max(50, "Firma kodu çok uzun")
    .regex(/^[a-z0-9_]+$/, "Firma kodu yalnızca küçük harf, rakam ve alt çizgi içerebilir"),
  email: z
    .string()
    .min(1, "E-posta zorunludur")
    .email("Geçerli bir e-posta girin"),
  password: z
    .string()
    .min(1, "Şifre zorunludur"),
})

export type LoginFormValues = z.infer<typeof loginSchema>
