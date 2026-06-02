import { useState, useRef, useEffect } from "react"
import { useUIStore, type Language } from "@erp/hooks"
import { useTranslation } from "@erp/i18n"
import { cn } from "@erp/utils"

const LANGUAGES: { code: Language; label: string; nativeLabel: string; flag: string }[] = [
  { code: "tr", label: "Türkçe", nativeLabel: "Türkçe", flag: "🇹🇷" },
  { code: "en", label: "English", nativeLabel: "English", flag: "🇺🇸" },
  { code: "ar", label: "Arabic", nativeLabel: "العربية", flag: "🇸🇦" },
]

export function LanguageSwitcher() {
  const { language, setLanguage } = useUIStore()
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const current = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0]

  const handleSelect = (code: Language) => {
    setLanguage(code)
    i18n.changeLanguage(code)
    setOpen(false)
  }

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-500 text-text-secondary-light dark:text-text-secondary-dark hover:bg-background-light dark:hover:bg-background-dark transition-colors"
      >
        <span>{current.flag}</span>
        <span className="hidden sm:inline">{current.nativeLabel}</span>
        <span className="material-symbols-outlined text-[16px]">expand_more</span>
      </button>

      {open && (
        <div className="absolute end-0 top-full mt-1 w-40 rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-elevated-dark shadow-lg z-50 overflow-hidden">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-start",
                language === lang.code
                  ? "bg-primary-light text-primary font-700"
                  : "text-text-main-light dark:text-text-main-dark hover:bg-background-light dark:hover:bg-background-dark",
              )}
            >
              <span>{lang.flag}</span>
              <span>{lang.nativeLabel}</span>
              {language === lang.code && (
                <span className="material-symbols-outlined text-[16px] ms-auto">check</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
