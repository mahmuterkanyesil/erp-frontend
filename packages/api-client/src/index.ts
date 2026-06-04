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
  CustomerSegment,
  CustomerAddress,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  CustomerOrderSummary,
  PartnerType,
  Supplier,
  CreateSupplierRequest,
  UpdateSupplierRequest,
  Warehouse,
  AccountingBalance,
  AccountingAccount,
  PurchaseOrderStatus,
  PurchaseOrderLine,
  PurchaseOrder,
  CreatePurchaseOrderRequest,
  AddPurchaseOrderLineRequest,
  GoodsReceiptLine,
  CreateGoodsReceiptRequest,
  MaterialType,
  RawMaterial,
  CreateRawMaterialRequest,
  UpdatePreferredSupplierRequest,
  GoodsReceipt,
  GoodsReceiptLineItem,
} from "./types"

// Tenant services
export { authService } from "./tenant/auth.service"
export { orderService } from "./tenant/order.service"
export { purchasingService } from "./tenant/purchasing.service"
export { customerService } from "./tenant/customer.service"
export { supplierService } from "./tenant/supplier.service"
