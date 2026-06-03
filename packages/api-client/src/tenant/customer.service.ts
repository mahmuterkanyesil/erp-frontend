import { tenantHttp } from "../http"
import type {
  Customer,
  CreateCustomerRequest,
  UpdateCustomerRequest,
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
      .get<Customer[]>("/api/v1/customers/partners", {
        params: {
          role: "CUSTOMER",
          ...(params?.q ? { name: params.q } : {}),
          ...(params?.status && params.status !== "all" ? { status: params.status } : {}),
          limit: params?.limit ?? 20,
        },
      })
      .then((r) => r.data.map(toDisplayName)),

  getCustomer: (id: string): Promise<Customer> =>
    tenantHttp
      .get<Customer>(`/api/v1/customers/partners/${id}`)
      .then((r) => toDisplayName(r.data)),

  createCustomer: async (body: CreateCustomerRequest): Promise<Customer> => {
    const { segment, credit_amount, credit_currency, payment_term_days, discount_rate, ...partnerFields } = body
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
    await tenantHttp.post(`/api/v1/customers/partners/${created.id}/roles/customer`, {
      ...(credit_amount ? { credit_amount, credit_currency: credit_currency ?? "TRY" } : {}),
      ...(payment_term_days !== undefined ? { payment_term_days } : {}),
      ...(discount_rate ? { discount_rate } : {}),
      ...(segment ? { segment } : {}),
    })
    return customerService.getCustomer(created.id)
  },

  updateCustomer: (id: string, body: UpdateCustomerRequest): Promise<void> =>
    tenantHttp.put(`/api/v1/customers/partners/${id}`, body).then(() => undefined),

  getCustomerOrders: (id: string): Promise<CustomerOrderSummary[]> =>
    tenantHttp
      .get<CustomerOrderSummary[]>("/api/v1/orders", { params: { customer_id: id } })
      .then((r) => r.data),

  getCustomerAddresses: (id: string): Promise<CustomerAddress[]> =>
    tenantHttp
      .get<CustomerAddress[]>(`/api/v1/customers/partners/${id}/addresses`)
      .then((r) => r.data),

  getCustomerAccount: (id: string): Promise<AccountingAccount | null> =>
    tenantHttp
      .get<AccountingAccount>("/api/v1/accounting/accounts", { params: { partner_id: id } })
      .then((r) => r.data ?? null)
      .catch(() => null),
}
