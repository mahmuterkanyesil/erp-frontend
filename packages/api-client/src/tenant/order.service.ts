import { tenantHttp } from "../http"
import type { Order } from "../types"

export const orderService = {
  listPending: (): Promise<Order[]> =>
    tenantHttp.get<Order[]>("/api/v1/orders/pending").then((r) => r.data),

  get: (id: string): Promise<Order> =>
    tenantHttp.get<Order>(`/api/v1/orders/${id}`).then((r) => r.data),

  create: (body: unknown): Promise<void> =>
    tenantHttp.post("/api/v1/orders", body).then(() => undefined),

  confirm: (id: string): Promise<void> =>
    tenantHttp.post(`/api/v1/orders/${id}/confirm`).then(() => undefined),

  cancel: (id: string, reason: string): Promise<void> =>
    tenantHttp.post(`/api/v1/orders/${id}/cancel`, { reason }).then(() => undefined),
}
