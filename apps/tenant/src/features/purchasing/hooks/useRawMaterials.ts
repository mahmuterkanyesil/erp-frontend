import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { purchasingService } from "@erp/api-client"
import type {
  CreateRawMaterialRequest,
  UpdatePreferredSupplierRequest,
} from "@erp/api-client"

export const rawMaterialKeys = {
  all: ["purchasing", "materials"] as const,
  list: () => [...rawMaterialKeys.all, "list"] as const,
  detail: (id: string) => [...rawMaterialKeys.all, "detail", id] as const,
}

export function useRawMaterials() {
  return useQuery({
    queryKey: rawMaterialKeys.list(),
    queryFn: () => purchasingService.getMaterials(),
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

