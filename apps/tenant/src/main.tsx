import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider, createRouter } from "@tanstack/react-router"
import { Toaster } from "sonner"

// Init i18n (side effect: sets up language detection + RTL)
import "@erp/i18n"

// Init axios interceptors with auth store
import { setupTenantInterceptors } from "@erp/api-client"
import { useAuthStore } from "@erp/hooks"
import { authService } from "@erp/api-client"

import "./globals.css"

// Route tree (will be populated as pages are built)
import { routeTree } from "./routeTree"

// ─── Query Client ─────────────────────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.response?.status >= 400 && error?.response?.status < 500) return false
        return failureCount < 2
      },
    },
  },
})

// ─── Axios interceptors ───────────────────────────────────────────────────────
setupTenantInterceptors(
  () => useAuthStore.getState().accessToken,
  () => useAuthStore.getState().clearAuth(),
  async () => {
    const refreshToken = useAuthStore.getState().getStoredRefreshToken()
    const tenantId = useAuthStore.getState().getStoredTenantId()
    if (!refreshToken || !tenantId) return null

    try {
      const res = await authService.refresh({ tenant_id: tenantId, refresh_token: refreshToken })
      useAuthStore.getState().setAuth({
        user: res.user,
        accessToken: res.access_token,
        refreshToken: res.refresh_token,
      })
      return res.access_token
    } catch {
      return null
    }
  },
  () => useAuthStore.getState().tenantId,
)

// ─── Router ──────────────────────────────────────────────────────────────────
const router = createRouter({ routeTree, context: { queryClient } })

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

// ─── Silent auth bootstrap ────────────────────────────────────────────────────
async function bootstrap() {
  const refreshToken = useAuthStore.getState().getStoredRefreshToken()
  const tenantId = useAuthStore.getState().getStoredTenantId()

  if (refreshToken && tenantId) {
    try {
      const res = await authService.refresh({ tenant_id: tenantId, refresh_token: refreshToken })
      useAuthStore.getState().setAuth({
        user: res.user,
        accessToken: res.access_token,
        refreshToken: res.refresh_token,
      })
      const raw = await authService.getPermissions(res.user.id)
      const perms = Array.isArray(raw) ? [...new Set(raw.map((p) => p.toLowerCase()))] : []
      useAuthStore.getState().setPermissions(perms)
    } catch {
      useAuthStore.getState().clearAuth()
    }
  }

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster position="top-end" richColors closeButton />
      </QueryClientProvider>
    </StrictMode>,
  )
}

bootstrap()
