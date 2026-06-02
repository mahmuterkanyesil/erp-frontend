import { useState, type ReactNode } from "react"
import { cn } from "@erp/utils"
import { useUIStore } from "@erp/hooks"
import { useTranslation } from "@erp/i18n"
import { LanguageSwitcher } from "../components/LanguageSwitcher/LanguageSwitcher"

interface HeaderProps {
  /** Called when the hamburger button is clicked */
  onMenuClick: () => void
  /** Optional search handler */
  onSearch?: (query: string) => void
  /** Extra items to render in the right side */
  extraActions?: ReactNode
  className?: string
}

/**
 * Sticky top header — 64px height.
 * Contains: hamburger (mobile), search bar, theme toggle, language switcher, notifications.
 */
export function Header({ onMenuClick, onSearch, extraActions, className }: HeaderProps) {
  const { theme, setTheme } = useUIStore()
  const { t } = useTranslation("common")
  const [searchQuery, setSearchQuery] = useState("")
  const [hasNotification] = useState(true) // placeholder

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : theme === "light" ? "system" : "dark")
  }

  const themeIcon =
    theme === "dark" ? "dark_mode" : theme === "light" ? "light_mode" : "brightness_auto"

  return (
    <header
      className={cn(
        "sticky top-0 z-30 h-16 shrink-0",
        "bg-surface-light dark:bg-surface-dark",
        "border-b border-border-light dark:border-border-dark",
        "flex items-center justify-between px-4 md:px-6 gap-3",
        className,
      )}
    >
      {/* Left: hamburger + search */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Hamburger — mobile only */}
        <button
          type="button"
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg text-text-secondary-light dark:text-text-secondary-dark hover:bg-background-light dark:hover:bg-background-dark transition-colors"
          aria-label="Menüyü aç"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>

        {/* Search bar */}
        {onSearch && (
          <div className="hidden sm:flex items-center gap-2 bg-background-light dark:bg-background-dark rounded-lg px-3 py-2 w-64 lg:w-80 focus-within:ring-2 focus-within:ring-primary/40 transition-all">
            <span className="material-symbols-outlined text-[18px] text-text-secondary-light dark:text-text-secondary-dark shrink-0">
              search
            </span>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                onSearch(e.target.value)
              }}
              placeholder={t("search")}
              className="bg-transparent border-none text-sm w-full focus:ring-0 text-text-main-light dark:text-text-main-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark"
            />
          </div>
        )}
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1 shrink-0">
        {extraActions}

        {/* Notification bell */}
        <button
          type="button"
          className="relative p-2 rounded-lg text-text-secondary-light dark:text-text-secondary-dark hover:bg-background-light dark:hover:bg-background-dark transition-colors"
          aria-label="Bildirimler"
        >
          <span className="material-symbols-outlined text-[22px]">notifications</span>
          {hasNotification && (
            <span className="absolute top-2 end-2 size-2 rounded-full bg-danger border-2 border-surface-light dark:border-surface-dark" />
          )}
        </button>

        {/* Theme toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-lg text-text-secondary-light dark:text-text-secondary-dark hover:bg-background-light dark:hover:bg-background-dark transition-colors"
          aria-label="Tema değiştir"
          title={theme}
        >
          <span className="material-symbols-outlined text-[22px]">{themeIcon}</span>
        </button>

        {/* Language switcher */}
        <LanguageSwitcher />
      </div>
    </header>
  )
}
