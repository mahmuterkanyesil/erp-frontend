import { type ReactNode } from "react"
import { usePermission } from "@erp/hooks"

interface PermissionGateProps {
  /** Permission string in "module:action" format, e.g. "orders:create" */
  permission: string
  children: ReactNode
  /** Rendered when the user lacks the permission. Defaults to null. */
  fallback?: ReactNode
}

/**
 * Renders children only when the current user has the required permission.
 * Use this for all permission-gated UI elements — buttons, menu items, forms.
 *
 * @example
 * <PermissionGate permission="orders:create">
 *   <Button>Yeni Sipariş</Button>
 * </PermissionGate>
 */
export function PermissionGate({ permission, children, fallback = null }: PermissionGateProps) {
  const can = usePermission(permission)
  return can ? <>{children}</> : <>{fallback}</>
}
