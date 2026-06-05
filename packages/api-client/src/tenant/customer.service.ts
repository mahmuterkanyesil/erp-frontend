import { tenantHttp } from "../http"
import type {
  Customer,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  UpdateCustomerRoleRequest,
  CustomerAddress,
  CustomerOrderSummary,
  AccountingAccount,
} from "../types"

function toDisplayName(p: Omit<Customer, "name">): Customer {
  const name =
    p.company_name ||
    [p.first_name, p.last_name].filter(Boolean).join(" ") ||
    p.email ||
    p.id
  return { ...p, name } as Customer
}

export const customerService = {
  getCustomers: (params?: { q?: string; status?: string; limit?: number }): Promise<Customer[]> =>
    tenantHttp
      .get<Customer[]>("/api/v1/customers", {
        params: {
          role: "customer",
          ...(params?.q ? { name: params.q } : {}),
          ...(params?.status && params.status !== "all" ? { status: params.status } : {}),
          limit: params?.limit ?? 20,
        },
      })
      .then((r) => r.data.map(toDisplayName)),

  getCustomer: (id: string): Promise<Customer> =>
    tenantHttp
      .get<Customer>(`/api/v1/customers/${id}`)
      .then((r) => toDisplayName(r.data)),

  createCustomer: async (body: CreateCustomerRequest): Promise<Customer> => {
    const { segment, credit_amount, credit_currency, payment_term_days, discount_rate, ...partnerFields } = body
    const { data: created } = await tenantHttp.post<{ id: string }>("/api/v1/customers", {
      partner_type: partnerFields.partner_type ?? "company",
      company_name: partnerFields.company_name,
      first_name: partnerFields.first_name,
      last_name: partnerFields.last_name,
      tax_number: partnerFields.tax_number,
      tax_office: partnerFields.tax_office,
      email: partnerFields.email,
      phone: partnerFields.phone,
    })
    await tenantHttp.post(`/api/v1/customers/${created.id}/customer-role`, {
      ...(credit_amount ? { credit_amount, credit_currency: credit_currency ?? "TRY" } : {}),
      ...(payment_term_days !== undefined ? { payment_term_days } : {}),
      ...(discount_rate ? { discount_rate } : {}),
      ...(segment ? { segment } : {}),
    })
    return customerService.getCustomer(created.id)
  },

  updateCustomer: (id: string, body: UpdateCustomerRequest): Promise<void> =>
    tenantHttp.patch(`/api/v1/customers/${id}`, body).then(() => undefined),

  getCustomerOrders: (id: string): Promise<CustomerOrderSummary[]> =>
    tenantHttp
      .get<CustomerOrderSummary[]>("/api/v1/orders", { params: { customer_id: id } })
      .then((r) => r.data),

  getCustomerDefaultAddress: (id: string): Promise<CustomerAddress | null> =>
    tenantHttp
      .get<CustomerAddress>(`/api/v1/customers/${id}/addresses/default`)
      .then((r) => r.data)
      .catch(() => null),

  updateCustomerRole: (id: string, body: UpdateCustomerRoleRequest): Promise<void> =>
    tenantHttp.patch(`/api/v1/customers/${id}/customer-role`, body).then(() => undefined),

  getCustomerAccount: (id: string): Promise<AccountingAccount | null> =>
    tenantHttp
      .get<AccountingAccount>("/api/v1/accounting/accounts", { params: { partner_id: id } })
      .then((r) => r.data ?? null)
      .catch(() => null),
}
