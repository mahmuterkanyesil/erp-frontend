import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "@erp/i18n"
import { AuthLayout, LanguageSwitcher } from "@erp/ui"
import { loginSchema, type LoginFormValues } from "../features/auth/schemas/auth.schema"
import { useLogin } from "../features/auth/hooks/useLogin"

export function LoginPage() {
  const { t } = useTranslation("auth")
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { tenant_id: "", email: "", password: "" },
  })

  // On success: navigate to dashboard
  // Using window.location for now — will use TanStack Router once routes are built
  const { mutate: login, isPending } = useLogin(() => {
    window.location.href = "/"
  })

  const onSubmit = (values: LoginFormValues) => login(values)

  return (
    <AuthLayout>
      {/* Language switcher top-right */}
      <div className="absolute top-6 end-6">
        <LanguageSwitcher />
      </div>

      {/* Card */}
      <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-border-light dark:border-border-dark shadow-xl p-8 flex flex-col gap-7">

        {/* Logo + title */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center justify-center size-14 rounded-2xl bg-primary/10">
            <span className="material-symbols-outlined text-primary text-[32px]">grid_view</span>
          </div>
          <div>
            <h1 className="text-2xl font-800 text-text-main-light dark:text-text-main-dark tracking-tight">
              Plastik ERP
            </h1>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
              {t("loginSubtitle")}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>

          {/* Tenant ID */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-500 text-text-main-light dark:text-text-main-dark">
              {t("tenantId")} <span className="text-danger">*</span>
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute start-3 text-[20px] text-text-secondary-light dark:text-text-secondary-dark pointer-events-none">
                domain
              </span>
              <input
                {...register("tenant_id")}
                type="text"
                placeholder="ornek_firma"
                autoComplete="organization"
                autoCapitalize="none"
                className="w-full ps-9 pe-3 py-2.5 rounded-lg border text-sm font-display bg-surface-light dark:bg-surface-dark border-border-light dark:border-border-dark text-text-main-light dark:text-text-main-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
              />
            </div>
            {errors.tenant_id && (
              <p className="text-xs text-danger flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">error</span>
                {errors.tenant_id.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-500 text-text-main-light dark:text-text-main-dark">
              {t("email")} <span className="text-danger">*</span>
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute start-3 text-[20px] text-text-secondary-light dark:text-text-secondary-dark pointer-events-none">
                mail
              </span>
              <input
                {...register("email")}
                type="email"
                placeholder="ad@firma.com"
                autoComplete="email"
                className="w-full ps-9 pe-3 py-2.5 rounded-lg border text-sm font-display bg-surface-light dark:bg-surface-dark border-border-light dark:border-border-dark text-text-main-light dark:text-text-main-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
              />
            </div>
            {errors.email && (
              <p className="text-xs text-danger flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">error</span>
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-500 text-text-main-light dark:text-text-main-dark">
              {t("password")} <span className="text-danger">*</span>
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute start-3 text-[20px] text-text-secondary-light dark:text-text-secondary-dark pointer-events-none">
                lock
              </span>
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full ps-9 pe-10 py-2.5 rounded-lg border text-sm font-display bg-surface-light dark:bg-surface-dark border-border-light dark:border-border-dark text-text-main-light dark:text-text-main-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute end-3 text-text-secondary-light dark:text-text-secondary-dark hover:text-primary transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-danger flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">error</span>
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
          >
            {isPending ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">
                  progress_activity
                </span>
                <span>Giriş yapılıyor...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">login</span>
                <span>{t("login")}</span>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-text-secondary-light dark:text-text-secondary-dark">
          © {new Date().getFullYear()} Plastik ERP. Tüm hakları saklıdır.
        </p>
      </div>
    </AuthLayout>
  )
}
