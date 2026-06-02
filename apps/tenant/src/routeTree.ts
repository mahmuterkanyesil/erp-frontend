import type { QueryClient } from "@tanstack/react-query"
import { createRootRouteWithContext, createRoute, redirect } from "@tanstack/react-router"
import { useAuthStore } from "@erp/hooks"

import { LoginPage } from "./pages/LoginPage"
import { ForbiddenPage } from "./pages/ForbiddenPage"
import { NotFoundPage } from "./pages/NotFoundPage"
import { DashboardPage } from "./pages/DashboardPage"
import { ProtectedLayout } from "./layouts/ProtectedLayout"
import { PurchasingPage } from "./pages/PurchasingPage"
import { NewPurchaseOrderPage } from "./pages/NewPurchaseOrderPage"
import { PurchaseOrderDetailPage } from "./pages/PurchaseOrderDetailPage"
import { GoodsReceiptPage } from "./pages/GoodsReceiptPage"
import { MaterialsPage } from "./pages/MaterialsPage"
import { MaterialDetailPage } from "./pages/MaterialDetailPage"

interface RouterContext {
  queryClient: QueryClient
}

// ─── Root ──────────────────────────────────────────────────────────────────
const rootRoute = createRootRouteWithContext<RouterContext>()({
  notFoundComponent: NotFoundPage,
})

// ─── Protected layout (auth guard) ────────────────────────────────────────
const protectedLayout = createRoute({
  getParentRoute: () => rootRoute,
  id: "protected",
  component: ProtectedLayout,
  beforeLoad: () => {
    if (!useAuthStore.getState().isAuthenticated()) {
      throw redirect({ to: "/login" })
    }
  },
})

// ─── Protected children ───────────────────────────────────────────────────
const dashboardRoute = createRoute({
  getParentRoute: () => protectedLayout,
  path: "/",
  component: DashboardPage,
})

// ─── Purchasing ───────────────────────────────────────────────────────────
const purchasingRoute = createRoute({
  getParentRoute: () => protectedLayout,
  path: "/purchasing",
  component: PurchasingPage,
})

const newPurchaseOrderRoute = createRoute({
  getParentRoute: () => protectedLayout,
  path: "/purchasing/new",
  component: NewPurchaseOrderPage,
})

const purchasingMaterialsRoute = createRoute({
  getParentRoute: () => protectedLayout,
  path: "/purchasing/materials",
  component: MaterialsPage,
})

const purchasingMaterialDetailRoute = createRoute({
  getParentRoute: () => protectedLayout,
  path: "/purchasing/materials/$materialId",
  component: MaterialDetailPage,
})

const purchaseOrderDetailRoute = createRoute({
  getParentRoute: () => protectedLayout,
  path: "/purchasing/$orderId",
  component: PurchaseOrderDetailPage,
})

const goodsReceiptRoute = createRoute({
  getParentRoute: () => protectedLayout,
  path: "/purchasing/$orderId/receipt",
  component: GoodsReceiptPage,
})

// ─── Public routes ────────────────────────────────────────────────────────
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
  beforeLoad: () => {
    if (useAuthStore.getState().isAuthenticated()) {
      throw redirect({ to: "/" })
    }
  },
})

const forbiddenRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/403",
  component: ForbiddenPage,
})

const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/404",
  component: NotFoundPage,
})

// ─── Tree ──────────────────────────────────────────────────────────────────
export const routeTree = rootRoute.addChildren([
  protectedLayout.addChildren([
    dashboardRoute,
    purchasingRoute,
    newPurchaseOrderRoute,
    purchasingMaterialsRoute,
    purchasingMaterialDetailRoute,
    purchaseOrderDetailRoute,
    goodsReceiptRoute,
  ]),
  loginRoute,
  forbiddenRoute,
  notFoundRoute,
])
