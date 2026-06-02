// ─── Components ───────────────────────────────────────────────────────────────
export { Button } from "./components/Button/Button"
export type { ButtonVariant, ButtonSize } from "./components/Button/Button"

export { Badge } from "./components/Badge/Badge"
export type { BadgeColor } from "./components/Badge/Badge"

export { Card, CardHeader, CardTitle } from "./components/Card/Card"

export { Input, Textarea } from "./components/Input/Input"
export { Select } from "./components/Select/Select"
export type { SelectOption } from "./components/Select/Select"

export { Spinner } from "./components/Spinner/Spinner"
export {
  Skeleton,
  TableSkeleton,
  CardGridSkeleton,
  FormSkeleton,
} from "./components/Skeleton/Skeleton"

export { EmptyState } from "./components/EmptyState/EmptyState"
export { Modal, ConfirmModal } from "./components/Modal/Modal"
export { DataTable } from "./components/Table/DataTable"
export type { Column } from "./components/Table/DataTable"
export { Pagination } from "./components/Pagination/Pagination"
export { PageHeader } from "./components/PageHeader/PageHeader"
export { StatCard } from "./components/StatCard/StatCard"
export { PermissionGate } from "./components/PermissionGate/PermissionGate"
export { LanguageSwitcher } from "./components/LanguageSwitcher/LanguageSwitcher"

// ─── Layouts ──────────────────────────────────────────────────────────────────
export { AppLayout, AuthLayout } from "./layouts/AppLayout"
export { DesktopSidebar, MobileDrawer } from "./layouts/Sidebar"
export { Header } from "./layouts/Header"
export { TENANT_NAV, PLATFORM_NAV } from "./layouts/navConfig"
export type { NavGroup, NavItem } from "./layouts/navConfig"
