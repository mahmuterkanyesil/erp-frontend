import { tenantHttp } from "../http"
import type { LoginRequest, LoginResponse, RefreshTokenRequest, PermissionsResponse } from "../types"

export const authService = {
  login: (body: LoginRequest): Promise<LoginResponse> =>
    tenantHttp
      .post<LoginResponse>("/api/v1/auth/login", body, {
        headers: { "X-Tenant-ID": body.tenant_id },
      })
      .then((r) => r.data),

  refresh: (body: RefreshTokenRequest): Promise<LoginResponse> =>
    tenantHttp
      .post<LoginResponse>("/api/v1/auth/refresh", body, {
        headers: { "X-Tenant-ID": body.tenant_id },
      })
      .then((r) => r.data),

  getPermissions: (userId: string): Promise<string[]> =>
    tenantHttp
      .get<PermissionsResponse>(`/api/v1/users/${userId}/permissions`)
      .then((r) => r.data.permissions ?? []),
}
