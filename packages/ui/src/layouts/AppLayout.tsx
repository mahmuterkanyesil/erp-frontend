import { useEffect, type ReactNode } from "react"
import { cn } from "@erp/utils"
import { useUIStore } from "@erp/hooks"
import { DesktopSidebar, MobileDrawer } from "./Sidebar"
import { Header } from "./Header"
import type { NavGroup } from "./navConfig"

interface AppLayoutProps {
  /** Navigation groups for the sidebar */
  nav: NavGroup[]
  /** Current active path — used to highlight nav items */
  currentPath: string
  /** Called when a nav item is clicked */
  onNavigate: (path: string) => void
  /** Optional search handler for the header */
  onSearch?: (query: string) => void
  /** Page content */
  children: ReactNode
  className?: string
}

/**
 * Main application shell.
 * - Desktop (md+): fixed sidebar (w-64) + sticky header + scrollable content
 * - Mobile (<md): sticky header + off-canvas sidebar drawer + scrollable content
 *
 * Usage:
 * ```tsx
 * <AppLayout nav={TENANT_NAV} currentPath={pathname} onNavigate={navigate}>
 *   <Outlet />
 * </AppLayout>
 * ```
 */
export function AppLayout({
  nav,
  currentPath,
  onNavigate,
  onSearch,
  children,
  className,
}: AppLayoutProps) {
  const { sidebarOpen, setSidebarOpen, toggleSidebar } = useUIStore()

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false)
  }, [currentPath, setSidebarOpen])

  const handleNavigate = (path: string) => {
    onNavigate(path)
    setSidebarOpen(false)
  }

  const sidebarProps = {
    nav,
    currentPath,
    onNavigate: handleNavigate,
  }

  return (
    <div className={cn("flex h-screen overflow-hidden bg-background-light dark:bg-background-dark", className)}>
      {/* Desktop Sidebar */}
      <DesktopSidebar {...sidebarProps} />

      {/* Mobile Drawer */}
      <MobileDrawer
        {...sidebarProps}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header
          onMenuClick={toggleSidebar}
          onSearch={onSearch}
        />

        {/* Scrollable content */}
        <main
          className="flex-1 overflow-y-auto"
          id="main-content"
        >
          <div className="px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

// ─── Auth Layout ──────────────────────────────────────────────────────────────

interface AuthLayoutProps {
  children: ReactNode
}

/**
 * Minimal full-screen layout for login and public pages.
 * Centered content with gradient background.
 */
export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-4">
      {/* Subtle grid pattern background */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, #137fec 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-md">{children}</div>
    </div>
  )
}
