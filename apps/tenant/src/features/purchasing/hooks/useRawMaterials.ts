import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { purchasingService } from "@erp/api-client"
import type {
  CreateRawMaterialRequest,
  UpdatePreferredSupplierRequest,
  ReplenishStockRequest,
  AdjustStockRequest,
  BulkCreateMaterialsRequest,
} from "@erp/api-client"

export const rawMaterialKeys = {
  all: ["purchasing", "materials"] as const,
  list: (params?: { type?: string }) =>
    [...rawMaterialKeys.all, "list", params] as const,
  detail: (id: string) => [...rawMaterialKeys.all, "detail", id] as const,
  stats: (id: string) => [...rawMaterialKeys.all, "stats", id] as const,
}

export function useRawMaterials(params?: { type?: string }) {
  return useQuery({
    queryKey: rawMaterialKeys.list(params),
    queryFn: () => purchasingService.getMaterials(params),
    staleTime: 30_000,
  })
}

export function useRawMaterial(id: string) {
  return useQuery({
    queryKey: rawMaterialKeys.detail(id),
    queryFn: () => purchasingService.getMaterial(id),
    staleTime: 30_000,
    enabled: !!id,
  })
}

export function useMaterialStats(id: string) {
  return useQuery({
    queryKey: rawMaterialKeys.stats(id),
    queryFn: () => purchasingService.getMaterialStats(id),
    staleTime: 30_000,
    enabled: !!id,
  })
}

export function useCreateRawMaterial(onSuccess?: () => void) {
  const queryClient = useQueryClient()
  const { t } = useTranslation("purchasing")

  return useMutation({
    mutationFn: (body: CreateRawMaterialRequest) => purchasingService.createMaterial(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rawMaterialKeys.all })
      toast.success(t("successCreatedMaterial"))
      onSuccess?.()
    },
    onError: () => {
      toast.error(t("title"))
    },
  })
}

export function useUpdatePreferredSupplier(materialId: string, onSuccess?: () => void) {
  const queryClient = useQueryClient()
  const { t } = useTranslation("purchasing")

  return useMutation({
    mutationFn: (body: UpdatePreferredSupplierRequest) =>
      purchasingService.updatePreferredSupplier(materialId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rawMaterialKeys.detail(materialId) })
      toast.success(t("successUpdatedSupplier"))
      onSuccess?.()
    },
    onError: () => {
      toast.error(t("title"))
    },
  })
}

export function useReplenishStock(materialId: string, onSuccess?: () => void) {
  const queryClient = useQueryClient()
  const { t } = useTranslation("purchasing")

  return useMutation({
    mutationFn: (body: ReplenishStockRequest) =>
      purchasingService.replenishStock(materialId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rawMaterialKeys.detail(materialId) })
      queryClient.invalidateQueries({ queryKey: rawMaterialKeys.stats(materialId) })
      toast.success(t("successReplenished"))
      onSuccess?.()
    },
    onError: () => {
      toast.error(t("title"))
    },
  })
}

export function useAdjustStock(materialId: string, onSuccess?: () => void) {
  const queryClient = useQueryClient()
  const { t } = useTranslation("purchasing")

  return useMutation({
    mutationFn: (body: AdjustStockRequest) =>
      purchasingService.adjustStock(materialId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rawMaterialKeys.detail(materialId) })
      queryClient.invalidateQueries({ queryKey: rawMaterialKeys.stats(materialId) })
      toast.success(t("successAdjusted"))
      onSuccess?.()
    },
    onError: () => {
      toast.error(t("title"))
    },
  })
}

export function useBulkCreateMaterials(onSuccess?: () => void) {
  const queryClient = useQueryClient()
  const { t } = useTranslation("purchasing")

  return useMutation({
    mutationFn: (body: BulkCreateMaterialsRequest) =>
      purchasingService.bulkCreateMaterials(body),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: rawMaterialKeys.all })
      if (result.errors.length > 0) {
        toast.warning(
          t("successBulkPartial", { count: result.created.length, errors: result.errors.length }),
        )
      } else {
        toast.success(t("successBulkCreated", { count: result.created.length }))
      }
      onSuccess?.()
    },
    onError: () => {
      toast.error(t("title"))
    },
  })
}
