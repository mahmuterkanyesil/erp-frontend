import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react"
import { cn } from "@erp/utils"

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline"
export type ButtonSize = "sm" | "md" | "lg"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  leftIcon?: string   // Material Symbol name
  rightIcon?: string  // Material Symbol name
  children?: ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:   "bg-primary hover:bg-primary-dark text-white shadow-sm",
  secondary: "bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-text-main-light dark:text-text-main-dark hover:bg-background-light dark:hover:bg-background-dark",
  ghost:     "text-text-secondary-light dark:text-text-secondary-dark hover:bg-background-light dark:hover:bg-background-dark",
  danger:    "bg-danger hover:bg-red-700 text-white shadow-sm",
  outline:   "border border-primary text-primary hover:bg-primary-light",
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs gap-1.5",
  md: "px-4 py-2 text-sm gap-2",
  lg: "px-5 py-2.5 text-base gap-2.5",
}

const iconSizeClasses: Record<ButtonSize, string> = {
  sm: "text-[16px]",
  md: "text-[18px]",
  lg: "text-[20px]",
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      leftIcon,
      rightIcon,
      children,
      className,
      disabled,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          // Base
          "inline-flex items-center justify-center font-display font-700 rounded-lg",
          "transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          // Variant + size
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {loading ? (
          <span className={cn("material-symbols-outlined animate-spin", iconSizeClasses[size])}>
            progress_activity
          </span>
        ) : leftIcon ? (
          <span className={cn("material-symbols-outlined", iconSizeClasses[size])}>{leftIcon}</span>
        ) : null}

        {children && <span>{children}</span>}

        {!loading && rightIcon && (
          <span className={cn("material-symbols-outlined", iconSizeClasses[size])}>{rightIcon}</span>
        )}
      </button>
    )
  },
)

Button.displayName = "Button"
