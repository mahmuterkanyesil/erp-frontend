import { useQuery } from "@tanstack/react-query"
import { warehouseService } from "@erp/api-client"

export const warehouseKeys = {
  all: ["warehouses"] as const,
  list: () => [...warehouseKeys.all, "list"] as const,
}

export function useWarehouses() {
  return useQuery({
    queryKey: warehouseKeys.list(),
    queryFn: () => warehouseService.getWarehouses(),
    staleTime: 60_000,
  })
}
