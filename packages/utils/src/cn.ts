import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility for merging Tailwind CSS classes conditionally.
 * Combines clsx and tailwind-merge to avoid class conflicts.
 *
 * @example
 * cn("px-4 py-2", isActive && "bg-primary text-white", variant === "ghost" && "bg-transparent")
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
