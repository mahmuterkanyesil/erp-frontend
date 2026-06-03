import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { supplierService } from "@erp/api-client"
import type { CreateSupplierRequest, UpdateSupplierRequest } from "@erp/api-client"

export const supplierKeys = {
  all: ["suppliers"] as const,
  list: (params?: { q?: string; status?: string }) =>
    [...supplierKeys.all, "list", params] as const,
  detail: (id: string) => [...supplierKeys.all, "detail", id] as const,
  orders: (id: string) => [...supplierKeys.all, "orders", id] as const,
  account: (id: string) => [...supplierKeys.all, "account", id] as const,
  performance: (id: string) => [...supplierKeys.all, "performance", id] as const,
}

export function useSuppliers(params?: { q?: string; status?: string }) {
  return useQuery({
    queryKey: supplierKeys.list(params),
    queryFn: () => supplierService.getSuppliers(params),
    staleTime: 30_000,
  })
}

export function useSupplier(id: string) {
  return useQuery({
    queryKey: supplierKeys.detail(id),
    queryFn: () => supplierService.getSupplier(id),
    staleTime: 30_000,
    enabled: !!id,
  })
}

export function useSupplierOrders(id: string) {
  return useQuery({
    queryKey: supplierKeys.orders(id),
    queryFn: () => supplierService.getSupplierOrders(id),
    staleTime: 30_000,
    enabled: !!id,
  })
}

export function useSupplierAccount(id: string) {
  return useQuery({
    queryKey: supplierKeys.account(id),
    queryFn: () => supplierService.getSupplierAccount(id),
    staleTime: 30_000,
    enabled: !!id,
  })
}

export function useSupplierPerformance(id: string) {
  return useQuery({
    queryKey: supplierKeys.performance(id),
    queryFn: () => supplierService.getSupplierPerformance(id),
    staleTime: 60_000,
    enabled: !!id,
  })
}

export function useCreateSupplier(onSuccess?: (id: string) => void) {
  const queryClient = useQueryClient()
  const { t } = useTranslation("suppliers")

  return useMutation({
    mutationFn: (body: CreateSupplierRequest) => supplierService.createSupplier(body),
    onSuccess: (supplier) => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.all })
      toast.success(t("successCreated"))
      onSuccess?.(supplier.id)
    },
    onError: () => {
      toast.error(t("title"))
    },
  })
}

export function useUpdateSupplier(id: string, onSuccess?: () => void) {
  const queryClient = useQueryClient()
  const { t } = useTranslation("suppliers")

  return useMutation({
    mutationFn: (body: UpdateSupplierRequest) => supplierService.updateSupplier(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: supplierKeys.all })
      toast.success(t("successUpdated"))
      onSuccess?.()
    },
    onError: () => {
      toast.error(t("title"))
    },
  })
}
