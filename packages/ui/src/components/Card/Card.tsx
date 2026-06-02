import { type ReactNode } from "react"
import { cn } from "@erp/utils"

interface CardProps {
  children: ReactNode
  className?: string
  padding?: "none" | "sm" | "md" | "lg"
}

const paddingClasses = {
  none: "",
  sm:   "p-4",
  md:   "p-6",
  lg:   "p-8",
}

export function Card({ children, className, padding = "md" }: CardProps) {
  return (
    <div
      className={cn(
        "bg-surface-light dark:bg-surface-dark",
        "border border-border-light dark:border-border-dark",
        "rounded-lg shadow-sm",
        paddingClasses[padding],
        className,
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center justify-between mb-4", className)}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h3 className={cn("text-text-main-light dark:text-text-main-dark font-700 text-base", className)}>
      {children}
    </h3>
  )
}
