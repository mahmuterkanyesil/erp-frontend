import { create } from "zustand"
import type { UserResult } from "@erp/api-client"

const REFRESH_TOKEN_KEY = "erp-refresh-token"
const TENANT_ID_KEY = "erp-tenant-id"

interface AuthStore {
  // State
  user: UserResult | null
  permissions: string[]
  accessToken: string | null  // memory only — never persisted
  tenantId: string | null

  // Actions
  setAuth: (payload: { user: UserResult; accessToken: string; refreshToken: string }) => void
  setAccessToken: (token: string) => void
  setPermissions: (permissions: string[]) => void
  clearAuth: () => void

  // Helpers
  hasPermission: (permission: string) => boolean
  isAuthenticated: () => boolean

  // Persisted getters
  getStoredRefreshToken: () => string | null
  getStoredTenantId: () => string | null
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  permissions: [],
  accessToken: null,
  tenantId: null,

  setAuth: ({ user, accessToken, refreshToken }) => {
    // Persist refresh token and tenantId to localStorage
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    localStorage.setItem(TENANT_ID_KEY, user.tenantID)

    set({
      user,
      accessToken,
      tenantId: user.tenantID,
    })
  },

  setAccessToken: (token) => set({ accessToken: token }),

  setPermissions: (permissions) => set({ permissions }),

  clearAuth: () => {
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(TENANT_ID_KEY)
    set({ user: null, permissions: [], accessToken: null, tenantId: null })
  },

  hasPermission: (permission) => get().permissions.includes(permission),

  isAuthenticated: () => get().user !== null && get().accessToken !== null,

  getStoredRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  getStoredTenantId: () => localStorage.getItem(TENANT_ID_KEY),
}))
