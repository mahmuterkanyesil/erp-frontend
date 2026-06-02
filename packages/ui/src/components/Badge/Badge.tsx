import { type ReactNode } from "react"
import { cn } from "@erp/utils"

export type BadgeColor = "success" | "warning" | "danger" | "info" | "neutral" | "primary"

interface BadgeProps {
  color?: BadgeColor
  children: ReactNode
  className?: string
  dot?: boolean
}

const colorClasses: Record<BadgeColor, string> = {
  success: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  danger:  "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  info:    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  neutral: "bg-background-light text-text-secondary-light dark:bg-surface-dark dark:text-text-secondary-dark border border-border-light dark:border-border-dark",
  primary: "bg-primary-light text-primary dark:bg-primary/20 dark:text-primary",
}

const dotColorClasses: Record<BadgeColor, string> = {
  success: "bg-green-500",
  warning: "bg-yellow-500",
  danger:  "bg-red-500",
  info:    "bg-blue-500",
  neutral: "bg-text-secondary-light",
  primary: "bg-primary",
}

export function Badge({ color = "neutral", children, className, dot }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-500",
        colorClasses[color],
        className,
      )}
    >
      {dot && (
        <span className={cn("size-1.5 rounded-full shrink-0", dotColorClasses[color])} />
      )}
      {children}
    </span>
  )
}
