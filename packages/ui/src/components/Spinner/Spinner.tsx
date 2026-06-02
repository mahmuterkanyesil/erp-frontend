import { cn } from "@erp/utils"

interface SpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeClasses = {
  sm: "text-[18px]",
  md: "text-[24px]",
  lg: "text-[32px]",
}

export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <span
      className={cn(
        "material-symbols-outlined animate-spin text-primary",
        sizeClasses[size],
        className,
      )}
      aria-label="Yükleniyor"
    >
      progress_activity
    </span>
  )
}
