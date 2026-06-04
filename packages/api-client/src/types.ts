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
  tenantID: string
  email: string
  firstName: string
  lastName: string
  roleIDs: string[]
  accessLevel: string
  storeIDs: string[]
  status: string
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
  total: number
  reserved: number
  available: number
  unit: string
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

// ─── Customers (Partner model) ───────────────────────────────────────────────

export type PartnerType = "COMPANY" | "INDIVIDUAL"
export type CustomerSegment = "A" | "B" | "C"

export interface CustomerAddress {
  id: string
  label?: string
  street?: string
  district?: string
  city?: string
  postal_code?: string
  country?: string
  is_default: boolean
}

export interface Customer {
  id: string
  tenant_id: string
  partner_type: PartnerType
  company_name?: string
  first_name?: string
  last_name?: string
  /** Computed display name: company_name or first+last name */
  name: string
  tax_number?: string
  tax_office?: string
  email?: string
  phone?: string
  status: "active" | "inactive"
  // Customer role fields (present when role data is available)
  segment?: CustomerSegment
  payment_term_days?: number
  credit_limit?: string
  notes?: string
}

export interface CreateCustomerRequest {
  // Partner fields
  partner_type?: PartnerType
  company_name?: string
  first_name?: string
  last_name?: string
  tax_number?: string
  tax_office?: string
  email?: string
  phone?: string
  // Customer role fields (used in 2nd step POST /roles/customer)
  segment?: CustomerSegment
  credit_amount?: string
  credit_currency?: string
  payment_term_days?: number
  discount_rate?: string
  notes?: string
}

export interface UpdateCustomerRequest {
  company_name?: string
  first_name?: string
  last_name?: string
  tax_number?: string
  tax_office?: string
  email?: string
  phone?: string
  notes?: string
}

// Orders from the Orders BC use camelCase fields
export interface CustomerOrderSummary {
  id: string
  status: string
  createdAt: string
}

// ─── Suppliers (Partner model) ───────────────────────────────────────────────

export interface Supplier {
  id: string
  tenant_id: string
  partner_type: PartnerType
  company_name?: string
  first_name?: string
  last_name?: string
  /** Computed display name: company_name or first+last name */
  name: string
  tax_number?: string
  tax_office?: string
  email?: string
  phone?: string
  status: "active" | "inactive"
  // Supplier role fields
  payment_term_days?: number
  lead_time_days?: number
  currency?: string
  notes?: string
}

export interface CreateSupplierRequest {
  // Partner fields
  partner_type?: PartnerType
  company_name?: string
  first_name?: string
  last_name?: string
  tax_number?: string
  tax_office?: string
  email?: string
  phone?: string
  // Supplier role fields (used in 2nd step POST /roles/supplier)
  payment_term_days?: number
  lead_time_days?: number
  currency?: string
  notes?: string
}

export interface UpdateSupplierRequest {
  company_name?: string
  first_name?: string
  last_name?: string
  tax_number?: string
  tax_office?: string
  email?: string
  phone?: string
  notes?: string
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

export interface AccountingBalance {
  currency: string
  total_debit: string
  total_credit: string
  net_balance: string
}

export interface AccountingAccount {
  id: string
  tenant_id: string
  partner_id: string
  account_type: "RECEIVABLE" | "PAYABLE"
  status: "active" | "frozen"
  created_at: string
  balances: AccountingBalance[]
}

// ─── Purchasing ───────────────────────────────────────────────────────────────

export type PurchaseOrderStatus =
  | "draft"
  | "confirmed"
  | "partially_received"
  | "received"
  | "cancelled"

export type MaterialType =
  | "plastic_granule"
  | "additive"
  | "packaging"
  | "semi_finished"
  | "other"


export interface PurchaseOrderLine {
  id: string
  material_id: string
  quantity: number
  unit: string
  unit_price_amount: string
  unit_price_currency: string
  status: string
}

export interface PurchaseOrder {
  id: string
  tenant_id: string
  supplier_id: string
  warehouse_id: string
  source: string
  source_ref?: string
  status: PurchaseOrderStatus
  expected_at: string
  lines: PurchaseOrderLine[]
  notes?: string
}

export interface CreatePurchaseOrderRequest {
  supplier_id: string
  warehouse_id: string
  source: string
  source_ref?: string
  expected_date: string
  notes?: string
}

export interface AddPurchaseOrderLineRequest {
  material_id: string
  quantity: number
  unit: string
  unit_price_amount: string
  unit_price_currency: string
}

export interface GoodsReceiptLine {
  order_line_id: string
  material_id: string
  quantity: number
  unit: string
}

export interface CreateGoodsReceiptRequest {
  lines: GoodsReceiptLine[]
  notes?: string
}

export interface GoodsReceiptLineItem {
  id: string
  order_line_id: string
  material_id: string
  material_name?: string
  quantity: number
  unit: string
}

export interface GoodsReceipt {
  id: string
  order_id: string
  received_at: string
  notes?: string
  lines: GoodsReceiptLineItem[]
}

export interface RawMaterial {
  id: string
  tenant_id: string
  name: string
  code: string
  material_type: string
  unit: string
  lead_time_days?: number
  min_order_qty?: number
  min_order_qty_unit?: string
  supplier_id?: string
  status: string
}

export interface CreateRawMaterialRequest {
  name: string
  code: string
  material_type: string
  unit: string
  lead_time_days?: number
  min_order_qty?: number
  min_order_qty_unit?: string
}

export interface UpdatePreferredSupplierRequest {
  supplier_id: string
}

