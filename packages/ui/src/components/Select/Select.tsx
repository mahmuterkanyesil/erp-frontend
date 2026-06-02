import { forwardRef, type SelectHTMLAttributes } from "react"
import { cn } from "@erp/utils"

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
  options: SelectOption[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, placeholder, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-")

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-500 text-text-main-light dark:text-text-main-dark"
          >
            {label}
            {props.required && <span className="text-danger ms-1">*</span>}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={inputId}
            className={cn(
              "w-full rounded-lg border font-display text-sm appearance-none",
              "bg-surface-light dark:bg-surface-dark",
              "border-border-light dark:border-border-dark",
              "text-text-main-light dark:text-text-main-dark",
              "px-3 py-2 pe-9",
              "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "transition-colors duration-150",
              error && "border-danger focus:ring-danger/40 focus:border-danger",
              className,
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Chevron icon — pointer-events-none so clicks pass through */}
          <span className="material-symbols-outlined absolute end-3 top-1/2 -translate-y-1/2 text-[20px] text-text-secondary-light dark:text-text-secondary-dark pointer-events-none">
            expand_more
          </span>
        </div>

        {error && (
          <p className="text-xs text-danger flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">error</span>
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">{hint}</p>
        )}
      </div>
    )
  },
)
Select.displayName = "Select"
