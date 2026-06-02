import { useEffect, type ReactNode } from "react"
import { cn } from "@erp/utils"

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children: ReactNode
  /** Footer area — typically action buttons */
  footer?: ReactNode
  /** sm=480 | md=640 | lg=768 | xl=1024 */
  size?: "sm" | "md" | "lg" | "xl"
  /** Prevent close on overlay click */
  preventClose?: boolean
  className?: string
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
}

/**
 * Accessible modal dialog.
 * On mobile (<md) renders full-screen from bottom.
 * Closes on Escape key and overlay click.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  preventClose = false,
  className,
}: ModalProps) {
  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !preventClose) onClose()
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open, preventClose, onClose])

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [open])

  if (!open) return null

  return (
    // Overlay
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => !preventClose && onClose()}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={cn(
          // Base
          "relative w-full bg-surface-light dark:bg-surface-dark shadow-xl",
          "flex flex-col max-h-[90dvh] overflow-hidden",
          // Mobile: full-width sheet from bottom
          "rounded-t-2xl md:rounded-xl",
          // Desktop: centered with max-width
          "md:mx-4",
          sizeClasses[size],
          className,
        )}
      >
        {/* Header */}
        {(title || description) && (
          <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-border-light dark:border-border-dark shrink-0">
            <div className="flex flex-col gap-1">
              {title && (
                <h2
                  id="modal-title"
                  className="text-base font-700 text-text-main-light dark:text-text-main-dark"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 p-1.5 rounded-lg text-text-secondary-light dark:text-text-secondary-dark hover:bg-background-light dark:hover:bg-background-dark transition-colors"
              aria-label="Kapat"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="shrink-0 flex items-center justify-end gap-3 px-6 py-4 border-t border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

/** Simple confirm/alert dialog shortcut */
interface ConfirmModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  loading?: boolean
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Onayla",
  cancelLabel = "İptal",
  danger = false,
  loading = false,
}: ConfirmModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-500 rounded-lg border border-border-light dark:border-border-dark text-text-secondary-light dark:text-text-secondary-dark hover:bg-background-light dark:hover:bg-background-dark transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              "px-4 py-2 text-sm font-700 rounded-lg text-white transition-colors disabled:opacity-50",
              danger ? "bg-danger hover:bg-red-700" : "bg-primary hover:bg-primary-dark",
            )}
          >
            {loading ? (
              <span className="material-symbols-outlined text-[18px] animate-spin">
                progress_activity
              </span>
            ) : (
              confirmLabel
            )}
          </button>
        </>
      }
    >
      {/* Empty body — description shown in header */}
      <div />
    </Modal>
  )
}
