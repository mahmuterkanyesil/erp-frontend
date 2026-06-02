/**
 * Shared DTO types mirroring the backend API responses.
 * All monetary amounts are decimal strings. All dates are RFC 3339.
 */

// ─── Auth ───────────────────────────────────────────────────────────────────

export interface LoginRequest {
  tenant_id: string
  email: string
  password: string
}

export interface UserResult {
  id: string
  tenant_id: string
  email: string
  first_name: string
  last_name: string
  role_ids: string[]
  access_level: "all" | "store"
  store_ids: string[]
  status: "active" | "locked"
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  user: UserResult
}

export interface RefreshTokenRequest {
  tenant_id: string
  refresh_token: string
}

export interface PermissionsResponse {
  permissions: string[]
}

// ─── Common ──────────────────────────────────────────────────────────────────

export interface ApiError {
  error: string
}

export interface PaginationParams {
  limit?: number
  offset?: number
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export type OrderStatus =
  | "draft"
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"

export interface OrderLine {
  id: string
  product_id: string
  variant_id?: string
  quantity: number
  unit: string
  unit_price: string
  total_price: string
  status: string
}

export interface Order {
  id: string
  tenant_id: string
  customer_id: string
  store_id?: string
  status: OrderStatus
  lines: OrderLine[]
  total_amount: string
  currency: string
  notes?: string
  created_at: string
  updated_at: string
}

// ─── Inventory ───────────────────────────────────────────────────────────────

export interface StockItem {
  id: string
  product_id: string
  warehouse_id: string
  quantity: number
  reserved_quantity: number
  available_quantity: number
  unit: string
  updated_at: string
}

// ─── Products / Catalog ──────────────────────────────────────────────────────

export interface Product {
  id: string
  name: string
  sku: string
  description?: string
  category?: string
  unit: string
  price: string
  currency: string
  status: "active" | "inactive"
  created_at: string
}

export interface ProductVariant {
  id: string
  product_id: string
  name: string
  sku: string
  attributes: Record<string, string>
  price: string
  currency: string
  status: "active" | "inactive"
}

// ─── Customers ───────────────────────────────────────────────────────────────

export interface Customer {
  id: string
  tenant_id: string
  name: string
  email?: string
  phone?: string
  billing_city?: string
  billing_country?: string
  status: "active" | "inactive"
  created_at: string
}

// ─── Suppliers ───────────────────────────────────────────────────────────────

export interface Supplier {
  id: string
  tenant_id: string
  name: string
  email?: string
  phone?: string
  status: "active" | "inactive"
  created_at: string
}

// ─── Warehouse ───────────────────────────────────────────────────────────────

export interface Warehouse {
  id: string
  tenant_id: string
  name: string
  address?: string
  status: "active" | "inactive"
}

// ─── Accounting ──────────────────────────────────────────────────────────────

export interface AccountingAccount {
  id: string
  partner_id: string
  partner_type: "customer" | "supplier"
  currency: string
  balance: string
  status: "active" | "frozen"
  created_at: string
}
