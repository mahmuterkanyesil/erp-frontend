import type { QueryClient } from "@tanstack/react-query"
import { createRootRouteWithContext, createRoute, redirect } from "@tanstack/react-router"
import type { PurchaseOrderStatus } from "@erp/api-client"
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
import { CustomersPage } from "./pages/customers/CustomersPage"
import { NewCustomerPage } from "./pages/customers/NewCustomerPage"
import { CustomerDetailPage } from "./pages/customers/CustomerDetailPage"
import { SuppliersPage } from "./pages/suppliers/SuppliersPage"
import { NewSupplierPage } from "./pages/suppliers/NewSupplierPage"
import { SupplierDetailPage } from "./pages/suppliers/SupplierDetailPage"

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
  validateSearch: (search: Record<string, unknown>): { status?: PurchaseOrderStatus | "all" } => ({
    status: (search.status as PurchaseOrderStatus | "all") ?? "all",
  }),
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

// ─── Customers ────────────────────────────────────────────────────────────────
const customersRoute = createRoute({
  getParentRoute: () => protectedLayout,
  path: "/customers",
  component: CustomersPage,
})

const newCustomerRoute = createRoute({
  getParentRoute: () => protectedLayout,
  path: "/customers/new",
  component: NewCustomerPage,
})

const customerDetailRoute = createRoute({
  getParentRoute: () => protectedLayout,
  path: "/customers/$customerId",
  component: CustomerDetailPage,
})

// ─── Suppliers ────────────────────────────────────────────────────────────────
const suppliersRoute = createRoute({
  getParentRoute: () => protectedLayout,
  path: "/suppliers",
  component: SuppliersPage,
})

const newSupplierRoute = createRoute({
  getParentRoute: () => protectedLayout,
  path: "/suppliers/new",
  component: NewSupplierPage,
})

const supplierDetailRoute = createRoute({
  getParentRoute: () => protectedLayout,
  path: "/suppliers/$supplierId",
  component: SupplierDetailPage,
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
    customersRoute,
    newCustomerRoute,
    customerDetailRoute,
    suppliersRoute,
    newSupplierRoute,
    supplierDetailRoute,
  ]),
  loginRoute,
  forbiddenRoute,
  notFoundRoute,
])
