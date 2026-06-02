import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react"
import { cn } from "@erp/utils"

// ─── Base styles ─────────────────────────────────────────────────────────────

const baseInput = [
  "w-full rounded-lg border font-display text-sm",
  "bg-surface-light dark:bg-surface-dark",
  "border-border-light dark:border-border-dark",
  "text-text-main-light dark:text-text-main-dark",
  "placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark",
  "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary",
  "disabled:opacity-50 disabled:cursor-not-allowed",
  "transition-colors duration-150",
].join(" ")

// ─── Input ────────────────────────────────────────────────────────────────────

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: string   // Material Symbol name
  rightIcon?: string
  onRightIconClick?: () => void
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, onRightIconClick, className, id, ...props }, ref) => {
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

        <div className="relative flex items-center">
          {leftIcon && (
            <span className="material-symbols-outlined absolute start-3 text-[20px] text-text-secondary-light dark:text-text-secondary-dark pointer-events-none">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              baseInput,
              "px-3 py-2",
              leftIcon && "ps-9",
              rightIcon && "pe-9",
              error && "border-danger focus:ring-danger/40 focus:border-danger",
              className,
            )}
            {...props}
          />

          {rightIcon && (
            <button
              type="button"
              onClick={onRightIconClick}
              className="absolute end-3 text-text-secondary-light dark:text-text-secondary-dark hover:text-primary transition-colors"
              tabIndex={-1}
            >
              <span className="material-symbols-outlined text-[20px]">{rightIcon}</span>
            </button>
          )}
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
Input.displayName = "Input"

// ─── Textarea ─────────────────────────────────────────────────────────────────

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
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

        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            baseInput,
            "px-3 py-2 resize-y min-h-[80px]",
            error && "border-danger focus:ring-danger/40 focus:border-danger",
            className,
          )}
          {...props}
        />

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
Textarea.displayName = "Textarea"
