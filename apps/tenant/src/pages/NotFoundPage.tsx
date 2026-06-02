import { useTranslation } from "@erp/i18n"
import { Link } from "@tanstack/react-router"

export function NotFoundPage() {
  const { t } = useTranslation("common")

  return (
    <main className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-6">
      <div className="text-center flex flex-col items-center gap-6 max-w-md">
        <div className="flex items-center justify-center size-20 rounded-full bg-info/10">
          <span className="material-symbols-outlined text-info text-[40px]">search_off</span>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-5xl font-[800] text-text-main-light dark:text-text-main-dark">404</p>
          <h1 className="text-xl font-[700] text-text-main-light dark:text-text-main-dark">
            {t("notFound")}
          </h1>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
            {t("notFoundMessage")}
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-[700] transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">dashboard</span>
          {t("backToDashboard")}
        </Link>
      </div>
    </main>
  )
}
