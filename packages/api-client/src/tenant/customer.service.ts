import { tenantHttp } from "../http"
import type {
  Customer,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  CustomerAddress,
  CustomerOrderSummary,
  AccountingAccount,
} from "../types"

export const customerService = {
  getCustomers: (params?: { q?: string; status?: string; limit?: number }): Promise<Customer[]> =>
    tenantHttp
      .get<Customer[]>("/api/v1/customers", {
        params: {
          ...(params?.q ? { q: params.q } : {}),
          ...(params?.status && params.status !== "all" ? { status: params.status } : {}),
          limit: params?.limit ?? 20,
        },
      })
      .then((r) => r.data),

  getCustomer: (id: string): Promise<Customer> =>
    tenantHttp.get<Customer>(`/api/v1/customers/${id}`).then((r) => r.data),

  createCustomer: (body: CreateCustomerRequest): Promise<Customer> =>
    tenantHttp.post<Customer>("/api/v1/customers", body).then((r) => r.data),

  updateCustomer: (id: string, body: UpdateCustomerRequest): Promise<Customer> =>
    tenantHttp.patch<Customer>(`/api/v1/customers/${id}`, body).then((r) => r.data),

  blacklistCustomer: (id: string): Promise<Customer> =>
    tenantHttp.post<Customer>(`/api/v1/customers/${id}/blacklist`).then((r) => r.data),

  getCustomerOrders: (id: string): Promise<CustomerOrderSummary[]> =>
    tenantHttp.get<CustomerOrderSummary[]>(`/api/v1/customers/${id}/orders`).then((r) => r.data),

  getCustomerAddresses: (id: string): Promise<CustomerAddress[]> =>
    tenantHttp.get<CustomerAddress[]>(`/api/v1/customers/${id}/addresses`).then((r) => r.data),

  getCustomerAccount: (id: string): Promise<AccountingAccount | null> =>
    tenantHttp
      .get<AccountingAccount[]>("/api/v1/accounting/accounts", { params: { partner_id: id } })
      .then((r) => r.data?.[0] ?? null),
}
