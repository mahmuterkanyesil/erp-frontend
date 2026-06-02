import { tenantHttp } from "../http"
import type { Order } from "../types"

export const orderService = {
  list: (): Promise<Order[]> =>
    tenantHttp.get<Order[]>("/api/v1/orders").then((r) => r.data),

  get: (id: string): Promise<Order> =>
    tenantHttp.get<Order>(`/api/v1/orders/${id}`).then((r) => r.data),

  create: (body: unknown): Promise<Order> =>
    tenantHttp.post<Order>("/api/v1/orders", body).then((r) => r.data),

  approve: (id: string): Promise<void> =>
    tenantHttp.post(`/api/v1/orders/${id}/approve`).then(() => undefined),

  reject: (id: string, reason: string): Promise<void> =>
    tenantHttp.post(`/api/v1/orders/${id}/reject`, { reason }).then(() => undefined),

  cancel: (id: string, reason: string): Promise<void> =>
    tenantHttp.post(`/api/v1/orders/${id}/cancel`, { reason }).then(() => undefined),
}
