import { tenantHttp } from "../http"
import type { Warehouse } from "../types"

export const warehouseService = {
  getWarehouses: (params?: { status?: string }): Promise<Warehouse[]> =>
    tenantHttp
      .get<Warehouse[]>("/api/v1/warehouses", {
        params: {
          ...(params?.status && params.status !== "all" ? { status: params.status } : {}),
        },
      })
      .then((r) => r.data),

  getWarehouse: (id: string): Promise<Warehouse> =>
    tenantHttp.get<Warehouse>(`/api/v1/warehouses/${id}`).then((r) => r.data),
}
