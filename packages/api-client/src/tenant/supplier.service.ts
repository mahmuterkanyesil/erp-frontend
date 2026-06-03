import { tenantHttp } from "../http"
import type {
  Supplier,
  CreateSupplierRequest,
  UpdateSupplierRequest,
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
      .get<Supplier[]>("/api/v1/customers/partners", {
        params: {
          role: "SUPPLIER",
          ...(params?.q ? { name: params.q } : {}),
          ...(params?.status && params.status !== "all" ? { status: params.status } : {}),
          limit: params?.limit ?? 20,
        },
      })
      .then((r) => r.data.map(toDisplayName)),

  getSupplier: (id: string): Promise<Supplier> =>
    tenantHttp
      .get<Supplier>(`/api/v1/customers/partners/${id}`)
      .then((r) => toDisplayName(r.data)),

  createSupplier: async (body: CreateSupplierRequest): Promise<Supplier> => {
    const { payment_term_days, lead_time_days, currency, ...partnerFields } = body
    const { data: created } = await tenantHttp.post<{ id: string }>("/api/v1/customers/partners", {
      partner_type: partnerFields.partner_type ?? "COMPANY",
      company_name: partnerFields.company_name,
      first_name: partnerFields.first_name,
      last_name: partnerFields.last_name,
      tax_number: partnerFields.tax_number,
      tax_office: partnerFields.tax_office,
      email: partnerFields.email,
      phone: partnerFields.phone,
    })
    await tenantHttp.post(`/api/v1/customers/partners/${created.id}/roles/supplier`, {
      ...(payment_term_days !== undefined ? { payment_term_days } : {}),
      ...(lead_time_days !== undefined ? { lead_time_days } : {}),
      ...(currency ? { currency } : {}),
    })
    return supplierService.getSupplier(created.id)
  },

  updateSupplier: (id: string, body: UpdateSupplierRequest): Promise<void> =>
    tenantHttp.put(`/api/v1/customers/partners/${id}`, body).then(() => undefined),

  getSupplierOrders: (id: string): Promise<PurchaseOrder[]> =>
    tenantHttp
      .get<PurchaseOrder[]>("/api/v1/purchasing/orders", { params: { supplier_id: id } })
      .then((r) => r.data),

  getSupplierAccount: (id: string): Promise<AccountingAccount | null> =>
    tenantHttp
      .get<AccountingAccount>("/api/v1/accounting/accounts", { params: { partner_id: id } })
      .then((r) => r.data ?? null)
      .catch(() => null),
}
