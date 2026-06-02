import { create } from "zustand"

export type Theme = "light" | "dark" | "system"
export type Language = "tr" | "en" | "ar"
export type Direction = "ltr" | "rtl"

const THEME_KEY = "erp-theme"
const LANGUAGE_KEY = "erp-language"

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light"
  return (localStorage.getItem(THEME_KEY) as Theme) ?? "system"
}

function getInitialLanguage(): Language {
  if (typeof window === "undefined") return "tr"
  return (localStorage.getItem(LANGUAGE_KEY) as Language) ?? "tr"
}

function resolveDirection(lang: Language): Direction {
  return lang === "ar" ? "rtl" : "ltr"
}

function applyTheme(theme: Theme): void {
  const html = document.documentElement
  if (theme === "system") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    html.classList.toggle("dark", prefersDark)
  } else {
    html.classList.toggle("dark", theme === "dark")
  }
}

function applyDirection(lang: Language): void {
  const dir = resolveDirection(lang)
  document.documentElement.setAttribute("dir", dir)
  document.documentElement.setAttribute("lang", lang)
}

interface UIStore {
  // State
  sidebarOpen: boolean
  theme: Theme
  language: Language
  dir: Direction

  // Actions
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setTheme: (theme: Theme) => void
  setLanguage: (lang: Language) => void
}

export const useUIStore = create<UIStore>((set, _get) => ({
  sidebarOpen: false,
  theme: getInitialTheme(),
  language: getInitialLanguage(),
  dir: resolveDirection(getInitialLanguage()),

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  setTheme: (theme) => {
    localStorage.setItem(THEME_KEY, theme)
    applyTheme(theme)
    set({ theme })
  },

  setLanguage: (lang) => {
    localStorage.setItem(LANGUAGE_KEY, lang)
    applyDirection(lang)
    set({ language: lang, dir: resolveDirection(lang) })
  },
}))

// Apply persisted preferences on module load (client side only)
if (typeof window !== "undefined") {
  applyTheme(getInitialTheme())
  applyDirection(getInitialLanguage())
}
