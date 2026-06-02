import { type ReactNode } from "react"
import { cn } from "@erp/utils"
import { useTranslation } from "@erp/i18n"
import { useAuthStore, useUIStore, usePermission } from "@erp/hooks"
import type { NavGroup, NavItem } from "./navConfig"

// ─── Types ────────────────────────────────────────────────────────────────────

interface SidebarProps {
  /** Navigation groups to render */
  nav: NavGroup[]
  /** Currently active path — used to highlight the active item */
  currentPath: string
  /** Called when a nav item is clicked (navigate + close mobile drawer) */
  onNavigate: (path: string) => void
  /** App logo/name area */
  logo?: ReactNode
}

// ─── Single nav item ─────────────────────────────────────────────────────────

function NavItemRow({
  item,
  active,
  onClick,
}: {
  item: NavItem
  active: boolean
  onClick: () => void
}) {
  const { t } = useTranslation("common")
  const hasPermission = usePermission(item.permission ?? "")
  const permitted = !item.permission || hasPermission

  if (!permitted) return null

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-start",
        active
          ? "bg-primary/10 text-primary font-700"
          : "text-text-secondary-light dark:text-text-secondary-dark hover:bg-background-light dark:hover:bg-background-dark font-500",
      )}
      aria-current={active ? "page" : undefined}
    >
      <span
        className={cn(
          "material-symbols-outlined text-[22px] shrink-0",
          active && "icon-filled",
        )}
      >
        {item.icon}
      </span>

      <span className="flex-1 truncate">{t(item.labelKey as any)}</span>

      {item.badge != null && item.badge > 0 && (
        <span className="shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-white text-[10px] font-700 flex items-center justify-center">
          {item.badge > 99 ? "99+" : item.badge}
        </span>
      )}
    </button>
  )
}

// ─── Sidebar content (shared between desktop + mobile) ───────────────────────

function SidebarContent({
  nav,
  currentPath,
  onNavigate,
  logo,
}: SidebarProps) {
  const { t } = useTranslation("common")
  const user = useAuthStore((s) => s.user)
  const clearAuth = useAuthStore((s) => s.clearAuth)

  return (
    <div className="flex flex-col h-full">
      {/* Logo / app name */}
      <div className="px-4 py-5 border-b border-border-light dark:border-border-dark shrink-0">
        {logo ?? (
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-9 rounded-lg bg-primary/10">
              <span className="material-symbols-outlined text-primary text-[22px]">grid_view</span>
            </div>
            <div>
              <p className="text-sm font-800 text-text-main-light dark:text-text-main-dark leading-tight">
                Plastik ERP
              </p>
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark leading-tight">
                {user?.tenant_id ?? ""}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-5" aria-label="Ana menü">
        {nav.map((group) => (
          <div key={group.groupKey} className="flex flex-col gap-0.5">
            <p className="px-3 mb-1.5 text-[10px] font-700 uppercase tracking-widest text-text-secondary-light dark:text-text-secondary-dark opacity-60">
              {t(group.labelKey as any)}
            </p>
            {group.items.map((item) => (
              <NavItemRow
                key={item.key}
                item={item}
                active={
                  item.path === "/"
                    ? currentPath === "/"
                    : currentPath.startsWith(item.path)
                }
                onClick={() => onNavigate(item.path)}
              />
            ))}
          </div>
        ))}
      </nav>

      {/* User row at bottom */}
      {user && (
        <div className="shrink-0 px-3 py-4 border-t border-border-light dark:border-border-dark">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
            {/* Avatar initials */}
            <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <span className="text-xs font-700 text-primary">
                {user.first_name?.[0]}{user.last_name?.[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-700 text-text-main-light dark:text-text-main-dark truncate">
                {user.first_name} {user.last_name}
              </p>
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark truncate">
                {user.email}
              </p>
            </div>
            {/* Logout */}
            <button
              type="button"
              onClick={clearAuth}
              title={t("auth.logout" as any)}
              className="p-1.5 rounded-lg text-text-secondary-light dark:text-text-secondary-dark hover:bg-background-light dark:hover:bg-background-dark hover:text-danger transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Desktop Sidebar ──────────────────────────────────────────────────────────

export function DesktopSidebar(props: SidebarProps) {
  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 bg-surface-light dark:bg-surface-dark border-e border-border-light dark:border-border-dark h-full">
      <SidebarContent {...props} />
    </aside>
  )
}

// ─── Mobile Drawer ────────────────────────────────────────────────────────────

interface MobileDrawerProps extends SidebarProps {
  open: boolean
  onClose: () => void
}

export function MobileDrawer({ open, onClose, ...props }: MobileDrawerProps) {
  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer panel */}
      <aside
        className={cn(
          "fixed inset-y-0 start-0 z-50 w-72 bg-surface-light dark:bg-surface-dark",
          "border-e border-border-light dark:border-border-dark",
          "transform transition-transform duration-300 ease-in-out md:hidden",
          open ? "translate-x-0" : "-translate-x-full",
          // RTL: flip translate direction
          "rtl:translate-x-full rtl:data-[open=true]:translate-x-0",
        )}
        data-open={open}
        aria-label="Navigasyon menüsü"
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 end-4 p-2 rounded-lg text-text-secondary-light dark:text-text-secondary-dark hover:bg-background-light dark:hover:bg-background-dark"
          aria-label="Menüyü kapat"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        <SidebarContent {...props} />
      </aside>
    </>
  )
}
