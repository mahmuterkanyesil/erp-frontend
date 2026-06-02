import { useEffect } from "react"
import { Outlet, useNavigate, useRouterState } from "@tanstack/react-router"
import { AppLayout, TENANT_NAV } from "@erp/ui"
import { useAuthStore } from "@erp/hooks"

export function ProtectedLayout() {
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isAuthenticated = useAuthStore((s) => s.user !== null && s.accessToken !== null)

  // Redirect to /login when auth is lost (e.g. logout from another tab)
  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: "/login" })
    }
  }, [isAuthenticated, navigate])

  if (!isAuthenticated) return null

  return (
    <AppLayout
      nav={TENANT_NAV}
      currentPath={pathname}
      onNavigate={(path) => navigate({ to: path as never })}
    >
      <Outlet />
    </AppLayout>
  )
}
