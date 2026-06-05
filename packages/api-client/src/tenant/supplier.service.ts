import { tenantHttp } from "../http"
import type {
  Supplier,
  CreateSupplierRequest,
  UpdateSupplierRequest,
  UpdateSupplierRoleRequest,
  AccountingAccount,
  PurchaseOrder,
} from "../types"

function toDisplayName(p: Omit<Supplier, "name">): Supplier {
  const name =
    p.company_name ||
    [p.first_name, p.last_name].filter(Boolean).join(" ") ||
    p.email ||
    p.id
  return { ...p, name } as Supplier
}

export const supplierService = {
  getSuppliers: (params?: { q?: string; status?: string; limit?: number }): Promise<Supplier[]> =>
    tenantHttp
      .get<Supplier[]>("/api/v1/suppliers", {
        params: {
          ...(params?.q ? { name: params.q } : {}),
          ...(params?.status && params.status !== "all" ? { status: params.status } : {}),
          limit: params?.limit ?? 20,
        },
      })
      .then((r) => r.data.map(toDisplayName)),

  getSupplier: (id: string): Promise<Supplier> =>
    tenantHttp
      .get<Supplier>(`/api/v1/suppliers/${id}`)
      .then((r) => toDisplayName(r.data)),

  createSupplier: async (body: CreateSupplierRequest): Promise<Supplier> => {
    const { data: created } = await tenantHttp.post<{ id: string }>("/api/v1/suppliers", body)
    return supplierService.getSupplier(created.id)
  },

  updateSupplier: (id: string, body: UpdateSupplierRequest): Promise<void> =>
    tenantHttp.patch(`/api/v1/suppliers/${id}`, body).then(() => undefined),

  getSupplierOrders: (id: string): Promise<PurchaseOrder[]> =>
    tenantHttp
      .get<PurchaseOrder[]>("/api/v1/purchasing/orders", { params: { supplier_id: id } })
      .then((r) => r.data),

  updateSupplierRole: (id: string, body: UpdateSupplierRoleRequest): Promise<void> =>
    tenantHttp.patch(`/api/v1/suppliers/${id}/supplier-role`, body).then(() => undefined),

  getSupplierAccount: (id: string): Promise<AccountingAccount | null> =>
    tenantHttp
      .get<AccountingAccount>("/api/v1/accounting/accounts", { params: { partner_id: id } })
      .then((r) => r.data ?? null)
      .catch(() => null),
}
