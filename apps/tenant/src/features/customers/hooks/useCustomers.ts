import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { customerService } from "@erp/api-client"
import type { CreateCustomerRequest, UpdateCustomerRequest, UpdateCustomerRoleRequest } from "@erp/api-client"

export const customerKeys = {
  all: ["customers"] as const,
  list: (params?: { q?: string; status?: string }) =>
    [...customerKeys.all, "list", params] as const,
  detail: (id: string) => [...customerKeys.all, "detail", id] as const,
  orders: (id: string) => [...customerKeys.all, "orders", id] as const,
  addresses: (id: string) => [...customerKeys.all, "addresses", id] as const,
  account: (id: string) => [...customerKeys.all, "account", id] as const,
}

export function useCustomers(params?: { q?: string; status?: string }) {
  return useQuery({
    queryKey: customerKeys.list(params),
    queryFn: () => customerService.getCustomers(params),
    staleTime: 30_000,
  })
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => customerService.getCustomer(id),
    staleTime: 30_000,
    enabled: !!id,
  })
}

export function useCustomerOrders(id: string) {
  return useQuery({
    queryKey: customerKeys.orders(id),
    queryFn: () => customerService.getCustomerOrders(id),
    staleTime: 30_000,
    enabled: !!id,
  })
}

export function useCustomerDefaultAddress(id: string) {
  return useQuery({
    queryKey: customerKeys.addresses(id),
    queryFn: () => customerService.getCustomerDefaultAddress(id),
    staleTime: 30_000,
    enabled: !!id,
  })
}

export function useCustomerAccount(id: string) {
  return useQuery({
    queryKey: customerKeys.account(id),
    queryFn: () => customerService.getCustomerAccount(id),
    staleTime: 30_000,
    enabled: !!id,
  })
}

export function useCreateCustomer(onSuccess?: (id: string) => void) {
  const queryClient = useQueryClient()
  const { t } = useTranslation("customers")

  return useMutation({
    mutationFn: (body: CreateCustomerRequest) => customerService.createCustomer(body),
    onSuccess: (customer) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.all })
      toast.success(t("successCreated"))
      onSuccess?.(customer.id)
    },
    onError: () => {
      toast.error(t("title"))
    },
  })
}

export function useUpdateCustomerRole(id: string, onSuccess?: () => void) {
  const queryClient = useQueryClient()
  const { t } = useTranslation("customers")

  return useMutation({
    mutationFn: (body: UpdateCustomerRoleRequest) => customerService.updateCustomerRole(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(id) })
      toast.success(t("successUpdated"))
      onSuccess?.()
    },
    onError: () => {
      toast.error(t("title"))
    },
  })
}

export function useUpdateCustomer(id: string, onSuccess?: () => void) {
  const queryClient = useQueryClient()
  const { t } = useTranslation("customers")

  return useMutation({
    mutationFn: (body: UpdateCustomerRequest) => customerService.updateCustomer(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: customerKeys.all })
      toast.success(t("successUpdated"))
      onSuccess?.()
    },
    onError: () => {
      toast.error(t("title"))
    },
  })
}

