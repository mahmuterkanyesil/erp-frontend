import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { authService } from "@erp/api-client"
import { useAuthStore } from "@erp/hooks"
import type { LoginFormValues } from "../schemas/auth.schema"

/**
 * Handles the full login flow:
 * 1. POST /api/v1/auth/login
 * 2. Store tokens + user in auth store
 * 3. Fetch user permissions
 * 4. Redirect to dashboard
 */
export function useLogin(onSuccess: () => void) {
  const setAuth = useAuthStore((s) => s.setAuth)
  const setPermissions = useAuthStore((s) => s.setPermissions)

  return useMutation({
    mutationFn: async (values: LoginFormValues) => {
      // Step 1: login
      const res = await authService.login(values)

      // Step 2: store auth
      setAuth({
        user: res.user,
        accessToken: res.access_token,
        refreshToken: res.refresh_token,
      })

      // Step 3: fetch permissions
      const permissions = await authService.getPermissions(res.user.id)
      setPermissions(permissions)

      return res
    },
    onSuccess: () => {
      onSuccess()
    },
    onError: (error: any) => {
      const status = error?.response?.status
      if (status === 401) {
        toast.error("E-posta veya şifre hatalı")
      } else if (status === 403) {
        toast.error("Hesabınız kilitlenmiş. Yöneticinizle iletişime geçin.")
      } else {
        toast.error("Giriş yapılırken bir hata oluştu, lütfen tekrar deneyin")
      }
    },
  })
}
