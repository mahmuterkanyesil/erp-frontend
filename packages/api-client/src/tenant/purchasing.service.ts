import { tenantHttp } from "../http"
import type {
  PurchaseOrder,
  CreatePurchaseOrderRequest,
  UpdatePurchaseOrderRequest,
  AddPurchaseOrderLineRequest,
  CreateGoodsReceiptRequest,
  RawMaterial,
  CreateRawMaterialRequest,
  UpdateRawMaterialRequest,
  UpdatePreferredSupplierRequest,
} from "../types"

export const purchasingService = {
  createOrder: (body: CreatePurchaseOrderRequest): Promise<void> =>
    tenantHttp.post("/api/v1/purchasing/orders", body).then(() => undefined),

  updateOrder: (id: string, body: UpdatePurchaseOrderRequest): Promise<void> =>
    tenantHttp.patch(`/api/v1/purchasing/orders/${id}`, body).then(() => undefined),

  getOrders: (params?: { supplier_id?: string }): Promise<PurchaseOrder[]> =>
    tenantHttp
      .get<PurchaseOrder[]>("/api/v1/purchasing/orders", {
        params: {
          ...(params?.supplier_id ? { supplier_id: params.supplier_id } : {}),
        },
      })
      .then((r) => r.data),

  getOrder: (id: string): Promise<PurchaseOrder> =>
    tenantHttp.get<PurchaseOrder>(`/api/v1/purchasing/orders/${id}`).then((r) => r.data),

  addLine: (orderId: string, body: AddPurchaseOrderLineRequest): Promise<void> =>
    tenantHttp.post(`/api/v1/purchasing/orders/${orderId}/lines`, body).then(() => undefined),

  confirmOrder: (id: string, body?: { reason?: string }): Promise<void> =>
    tenantHttp.post(`/api/v1/purchasing/orders/${id}/confirm`, body ?? {}).then(() => undefined),

  cancelOrder: (id: string, reason?: string): Promise<void> =>
    tenantHttp
      .post(`/api/v1/purchasing/orders/${id}/cancel`, reason ? { reason } : {})
      .then(() => undefined),

  createReceipt: (id: string, body: CreateGoodsReceiptRequest): Promise<void> =>
    tenantHttp
      .post(`/api/v1/purchasing/orders/${id}/receipts`, body)
      .then(() => undefined),

  createMaterial: (body: CreateRawMaterialRequest): Promise<void> =>
    tenantHttp.post("/api/v1/purchasing/materials", body).then(() => undefined),

  updateMaterial: (id: string, body: UpdateRawMaterialRequest): Promise<void> =>
    tenantHttp.patch(`/api/v1/purchasing/materials/${id}`, body).then(() => undefined),

  getMaterials: (): Promise<RawMaterial[]> =>
    tenantHttp.get<RawMaterial[]>("/api/v1/purchasing/materials").then((r) => r.data),

  getMaterial: (id: string): Promise<RawMaterial> =>
    tenantHttp.get<RawMaterial>(`/api/v1/purchasing/materials/${id}`).then((r) => r.data),

  updatePreferredSupplier: (id: string, body: UpdatePreferredSupplierRequest): Promise<void> =>
    tenantHttp
      .patch(`/api/v1/purchasing/materials/${id}/supplier`, body)
      .then(() => undefined),
}
