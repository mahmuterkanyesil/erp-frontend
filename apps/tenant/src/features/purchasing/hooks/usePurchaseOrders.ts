import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { purchasingService } from "@erp/api-client"
import type {
  CreatePurchaseOrderRequest,
  AddPurchaseOrderLineRequest,
  CreateGoodsReceiptRequest,
} from "@erp/api-client"

export const purchaseOrderKeys = {
  all: ["purchasing", "orders"] as const,
  list: (supplierId?: string) => [...purchaseOrderKeys.all, "list", supplierId] as const,
  detail: (id: string) => [...purchaseOrderKeys.all, "detail", id] as const,
}

export function usePurchaseOrders(supplierId?: string) {
  return useQuery({
    queryKey: purchaseOrderKeys.list(supplierId),
    queryFn: () => purchasingService.getOrders(supplierId),
    staleTime: 30_000,
  })
}

export function usePurchaseOrder(id: string) {
  return useQuery({
    queryKey: purchaseOrderKeys.detail(id),
    queryFn: () => purchasingService.getOrder(id),
    staleTime: 30_000,
    enabled: !!id,
  })
}

export function useCreatePurchaseOrder(onSuccess?: () => void) {
  const queryClient = useQueryClient()
  const { t } = useTranslation("purchasing")

  return useMutation({
    mutationFn: (body: CreatePurchaseOrderRequest) => purchasingService.createOrder(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.all })
      toast.success(t("successCreatedOrder"))
      onSuccess?.()
    },
    onError: () => {
      toast.error(t("title"))
    },
  })
}

export function useAddOrderLine(orderId: string, onSuccess?: () => void) {
  const queryClient = useQueryClient()
  const { t } = useTranslation("purchasing")

  return useMutation({
    mutationFn: (body: AddPurchaseOrderLineRequest) => purchasingService.addLine(orderId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.detail(orderId) })
      toast.success(t("successLineAdded"))
      onSuccess?.()
    },
    onError: () => {
      toast.error(t("title"))
    },
  })
}

export function useConfirmOrder(onSuccess?: () => void) {
  const queryClient = useQueryClient()
  const { t } = useTranslation("purchasing")

  return useMutation({
    mutationFn: (id: string) => purchasingService.confirmOrder(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.all })
      toast.success(t("successConfirmed"))
      onSuccess?.()
    },
    onError: () => {
      toast.error(t("title"))
    },
  })
}

export function useCancelOrder(onSuccess?: () => void) {
  const queryClient = useQueryClient()
  const { t } = useTranslation("purchasing")

  return useMutation({
    mutationFn: (id: string) => purchasingService.cancelOrder(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.all })
      toast.success(t("successCancelled"))
      onSuccess?.()
    },
    onError: () => {
      toast.error(t("title"))
    },
  })
}

export function useCreateReceipt(orderId: string, onSuccess?: () => void) {
  const queryClient = useQueryClient()
  const { t } = useTranslation("purchasing")

  return useMutation({
    mutationFn: (body: CreateGoodsReceiptRequest) => purchasingService.createReceipt(orderId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.detail(orderId) })
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.all })
      toast.success(t("successReceipt"))
      onSuccess?.()
    },
    onError: () => {
      toast.error(t("title"))
    },
  })
}
