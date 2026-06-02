// HTTP clients
export { tenantHttp, platformHttp, setupTenantInterceptors } from "./http"

// Error utilities
export { extractErrorMessage, getErrorStatus } from "./errors"

// Types
export type {
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  UserResult,
  PermissionsResponse,
  ApiError,
  PaginationParams,
  Order,
  OrderStatus,
  OrderLine,
  StockItem,
  Product,
  ProductVariant,
  Customer,
  Supplier,
  Warehouse,
  AccountingAccount,
} from "./types"

// Tenant services
export { authService } from "./tenant/auth.service"
export { orderService } from "./tenant/order.service"
