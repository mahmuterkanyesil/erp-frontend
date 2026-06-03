import { tenantHttp } from "../http"
import type {
  Supplier,
  CreateSupplierRequest,
  UpdateSupplierRequest,
  SupplierPerformance,
  AccountingAccount,
  PurchaseOrder,
} from "../types"

export const supplierService = {
  getSuppliers: (params?: { q?: string; status?: string; limit?: number }): Promise<Supplier[]> =>
    tenantHttp
      .get<Supplier[]>("/api/v1/purchasing/suppliers", {
        params: {
          ...(params?.q ? { q: params.q } : {}),
          ...(params?.status && params.status !== "all" ? { status: params.status } : {}),
          limit: params?.limit ?? 20,
        },
      })
      .then((r) => r.data),

  getSupplier: (id: string): Promise<Supplier> =>
    tenantHttp.get<Supplier>(`/api/v1/purchasing/suppliers/${id}`).then((r) => r.data),

  createSupplier: (body: CreateSupplierRequest): Promise<Supplier> =>
    tenantHttp.post<Supplier>("/api/v1/purchasing/suppliers", body).then((r) => r.data),

  updateSupplier: (id: string, body: UpdateSupplierRequest): Promise<Supplier> =>
    tenantHttp.patch<Supplier>(`/api/v1/purchasing/suppliers/${id}`, body).then((r) => r.data),

  getSupplierOrders: (id: string): Promise<PurchaseOrder[]> =>
    tenantHttp
      .get<PurchaseOrder[]>("/api/v1/purchasing/orders", { params: { supplier_id: id } })
      .then((r) => r.data),

  getSupplierAccount: (id: string): Promise<AccountingAccount | null> =>
    tenantHttp
      .get<AccountingAccount[]>("/api/v1/accounting/accounts", { params: { partner_id: id } })
      .then((r) => r.data?.[0] ?? null),

  getSupplierPerformance: (id: string): Promise<SupplierPerformance> =>
    tenantHttp
      .get<SupplierPerformance>(`/api/v1/purchasing/suppliers/${id}/performance`)
      .then((r) => r.data),
}
