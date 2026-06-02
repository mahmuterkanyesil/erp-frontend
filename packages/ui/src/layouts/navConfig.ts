/**
 * Navigation structure for the Tenant ERP sidebar.
 * Each item maps to a route path and requires a permission to be visible.
 * Groups are rendered with a section label.
 */

export interface NavItem {
  key: string
  labelKey: string       // i18n key, e.g. "common.dashboard"
  icon: string           // Material Symbol name
  path: string
  permission?: string    // If set, hidden unless user has this permission
  badge?: number         // Optional notification count
}

export interface NavGroup {
  groupKey: string
  labelKey: string       // i18n section label
  items: NavItem[]
}

export const TENANT_NAV: NavGroup[] = [
  {
    groupKey: "general",
    labelKey: "nav.general",
    items: [
      { key: "dashboard",  labelKey: "nav.dashboard",  icon: "dashboard",      path: "/" },
      { key: "orders",     labelKey: "nav.orders",     icon: "shopping_cart",  path: "/orders",     permission: "orders:view" },
      { key: "sales",      labelKey: "nav.sales",      icon: "point_of_sale",  path: "/sales",      permission: "sales:view" },
      { key: "inventory",  labelKey: "nav.inventory",  icon: "inventory_2",    path: "/inventory",  permission: "inventory:view" },
      { key: "products",   labelKey: "nav.products",   icon: "category",       path: "/products",   permission: "catalog:view" },
    ],
  },
  {
    groupKey: "supply",
    labelKey: "nav.supply",
    items: [
      { key: "purchasing",  labelKey: "nav.purchasing",  icon: "local_shipping",  path: "/purchasing",  permission: "purchasing:view" },
      { key: "materials",   labelKey: "nav.materials",   icon: "factory",         path: "/purchasing/materials", permission: "purchasing:view" },
      { key: "suppliers",   labelKey: "nav.suppliers",   icon: "storefront",      path: "/suppliers",   permission: "customers:view" },
    ],
  },
  {
    groupKey: "crm",
    labelKey: "nav.crm",
    items: [
      { key: "customers",  labelKey: "nav.customers",  icon: "group",       path: "/customers",  permission: "customers:view" },
      { key: "warehouse",  labelKey: "nav.warehouse",  icon: "warehouse",   path: "/warehouses", permission: "warehouse:view" },
      { key: "returns",    labelKey: "nav.returns",    icon: "assignment_return", path: "/returns" },
    ],
  },
  {
    groupKey: "finance",
    labelKey: "nav.finance",
    items: [
      { key: "accounting",  labelKey: "nav.accounting",  icon: "account_balance",  path: "/accounting",  permission: "accounting:view" },
      { key: "payments",    labelKey: "nav.payments",    icon: "payments",          path: "/payments",    permission: "payments:view" },
    ],
  },
  {
    groupKey: "admin",
    labelKey: "nav.admin",
    items: [
      { key: "users",    labelKey: "nav.users",    icon: "manage_accounts",  path: "/users",    permission: "iam:view" },
      { key: "stores",   labelKey: "nav.stores",   icon: "store",            path: "/stores",   permission: "warehouse:view" },
      { key: "audit",    labelKey: "nav.audit",    icon: "history",          path: "/audit",    permission: "iam:view" },
      { key: "settings", labelKey: "nav.settings", icon: "settings",         path: "/settings" },
    ],
  },
]

export const PLATFORM_NAV: NavGroup[] = [
  {
    groupKey: "platform",
    labelKey: "nav.platform",
    items: [
      { key: "dashboard",       labelKey: "nav.dashboard",       icon: "dashboard",          path: "/" },
      { key: "tenants",         labelKey: "nav.tenants",         icon: "domain",             path: "/tenants" },
      { key: "subscriptions",   labelKey: "nav.subscriptions",   icon: "subscriptions",      path: "/subscriptions" },
      { key: "billing",         labelKey: "nav.billing",         icon: "receipt_long",       path: "/billing/invoices" },
      { key: "impersonation",   labelKey: "nav.impersonation",   icon: "switch_account",     path: "/impersonation" },
    ],
  },
]
