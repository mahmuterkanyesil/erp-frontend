import { tenantHttp } from "../http"
import type { LoginRequest, LoginResponse, RefreshTokenRequest } from "../types"

export const authService = {
  login: (body: LoginRequest): Promise<LoginResponse> =>
    tenantHttp
      .post<LoginResponse>("/api/v1/auth/login", body, {
        headers: { "X-Tenant-ID": body.tenant_id },
      })
      .then((r) => r.data),

  refresh: (body: RefreshTokenRequest): Promise<LoginResponse> =>
    tenantHttp.post<LoginResponse>("/api/v1/auth/refresh", body).then((r) => r.data),

  getPermissions: (userId: string): Promise<string[]> =>
    tenantHttp
      .get<string[]>(`/api/v1/users/${userId}/permissions`)
      .then((r) => r.data),
}
