import { tenantHttp } from "../http"
import type {
  PurchaseOrder,
  CreatePurchaseOrderRequest,
  AddPurchaseOrderLineRequest,
  CreateGoodsReceiptRequest,
  RawMaterial,
  CreateRawMaterialRequest,
  UpdatePreferredSupplierRequest,
} from "../types"

export const purchasingService = {
  createOrder: (body: CreatePurchaseOrderRequest): Promise<PurchaseOrder> =>
    tenantHttp.post<PurchaseOrder>("/api/v1/purchasing/orders", body).then((r) => r.data),

  getOrders: (params?: { supplier_id?: string; status?: string }): Promise<PurchaseOrder[]> =>
    tenantHttp
      .get<PurchaseOrder[]>("/api/v1/purchasing/orders", {
        params: {
          ...(params?.supplier_id ? { supplier_id: params.supplier_id } : {}),
          ...(params?.status && params.status !== "all" ? { status: params.status } : {}),
        },
      })
      .then((r) => r.data),

  getOrder: (id: string): Promise<PurchaseOrder> =>
    tenantHttp.get<PurchaseOrder>(`/api/v1/purchasing/orders/${id}`).then((r) => r.data),

  addLine: (orderId: string, body: AddPurchaseOrderLineRequest): Promise<PurchaseOrder> =>
    tenantHttp.post<PurchaseOrder>(`/api/v1/purchasing/orders/${orderId}/lines`, body).then((r) => r.data),

  confirmOrder: (id: string): Promise<PurchaseOrder> =>
    tenantHttp.post<PurchaseOrder>(`/api/v1/purchasing/orders/${id}/confirm`).then((r) => r.data),

  cancelOrder: (id: string, reason?: string): Promise<PurchaseOrder> =>
    tenantHttp
      .post<PurchaseOrder>(`/api/v1/purchasing/orders/${id}/cancel`, reason ? { reason } : undefined)
      .then((r) => r.data),

  createReceipt: (id: string, body: CreateGoodsReceiptRequest): Promise<PurchaseOrder> =>
    tenantHttp
      .post<PurchaseOrder>(`/api/v1/purchasing/orders/${id}/receipts`, body)
      .then((r) => r.data),

  createMaterial: (body: CreateRawMaterialRequest): Promise<RawMaterial> =>
    tenantHttp.post<RawMaterial>("/api/v1/purchasing/materials", body).then((r) => r.data),

  getMaterial: (id: string): Promise<RawMaterial> =>
    tenantHttp.get<RawMaterial>(`/api/v1/purchasing/materials/${id}`).then((r) => r.data),

  updatePreferredSupplier: (id: string, body: UpdatePreferredSupplierRequest): Promise<RawMaterial> =>
    tenantHttp
      .patch<RawMaterial>(`/api/v1/purchasing/materials/${id}/supplier`, body)
      .then((r) => r.data),
}
