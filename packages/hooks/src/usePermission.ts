import { useAuthStore } from "./stores/auth.store"

/**
 * Returns true if the current user has the given permission string.
 *
 * @example
 * const canCreate = usePermission("orders:create")
 */
export function usePermission(permission: string): boolean {
  return useAuthStore((state) => (state.permissions ?? []).includes(permission))
}

/**
 * Returns true if the current user has ALL of the given permissions.
 */
export function usePermissions(permissions: string[]): boolean {
  return useAuthStore((state) =>
    permissions.every((p) => (state.permissions ?? []).includes(p)),
  )
}
