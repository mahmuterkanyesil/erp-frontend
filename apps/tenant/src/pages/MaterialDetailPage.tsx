import { useState } from "react"
import { useParams, useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { cn } from "@erp/utils"
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  Input,
  Modal,
  PageHeader,
  PermissionGate,
  FormSkeleton,
  Select,
} from "@erp/ui"
import { useLocaleFormat } from "@erp/hooks"
import {
  useRawMaterial,
  useMaterialStats,
  useUpdatePreferredSupplier,
  useReplenishStock,
  useAdjustStock,
} from "@/features/purchasing"
import {
  updatePreferredSupplierSchema,
  replenishStockSchema,
  adjustStockSchema,
  type UpdatePreferredSupplierValues,
  type ReplenishStockValues,
  type AdjustStockValues,
} from "@/features/purchasing/schemas/purchasing.schema"

const EMPTY_SUPPLIERS = [{ value: "", label: "—" }]

export function MaterialDetailPage() {
  const { materialId } = useParams({ from: "/protected/purchasing/materials/$materialId" })
  const navigate = useNavigate()
  const { t } = useTranslation("purchasing")
  const { t: tc } = useTranslation("common")
  const { formatDate } = useLocaleFormat()

  const [showSupplier, setShowSupplier] = useState(false)
  const [showReplenish, setShowReplenish] = useState(false)
  const [showAdjust, setShowAdjust] = useState(false)

  const { data: material, isLoading } = useRawMaterial(materialId)
  const { data: stats } = useMaterialStats(materialId)
  const { mutate: updateSupplier, isPending: isUpdatingSupplier } = useUpdatePreferredSupplier(
    materialId,
    () => setShowSupplier(false),
  )
  const { mutate: replenish, isPending: isReplenishing } = useReplenishStock(materialId, () =>
    setShowReplenish(false),
  )
  const { mutate: adjust, isPending: isAdjusting } = useAdjustStock(materialId, () =>
    setShowAdjust(false),
  )

  const supplierForm = useForm<UpdatePreferredSupplierValues>({
    resolver: zodResolver(updatePreferredSupplierSchema),
  })

  const replenishForm = useForm<ReplenishStockValues>({
    resolver: zodResolver(replenishStockSchema),
    defaultValues: { quantity: 0 },
  })

  const adjustForm = useForm<AdjustStockValues>({
    resolver: zodResolver(adjustStockSchema),
    defaultValues: { delta: 0, reason: "" },
  })

  if (isLoading) return <FormSkeleton />
  if (!material) return null

  const isBelowMin = stats?.is_below_min ?? false

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={material.name}
        breadcrumbs={[
          { label: tc("nav.dashboard"), onClick: () => navigate({ to: "/" }) },
          { label: t("title"), onClick: () => navigate({ to: "/purchasing" }) },
          { label: t("materialsTab"), onClick: () => navigate({ to: "/purchasing/materials" }) },
          { label: material.name },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <PermissionGate permission="purchasing:create">
              <Button variant="secondary" leftIcon="add_circle" onClick={() => setShowReplenish(true)}>
                {t("stockReplenish")}
              </Button>
            </PermissionGate>
            <PermissionGate permission="purchasing:update">
              <Button variant="secondary" leftIcon="tune" onClick={() => setShowAdjust(true)}>
                {t("stockAdjust")}
              </Button>
            </PermissionGate>
            <PermissionGate permission="purchasing:update">
              <Button variant="secondary" leftIcon="store" onClick={() => setShowSupplier(true)}>
                {t("updateSupplier")}
              </Button>
            </PermissionGate>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Detail card */}
        <div className="lg:col-span-2">
          <Card>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">{t("sku")}</span>
                <span className="text-sm font-500 text-text-main-light dark:text-text-main-dark">{material.sku}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">{t("materialType")}</span>
                <span className="text-sm text-text-main-light dark:text-text-main-dark">{t(`type_${material.material_type}`)}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">{t("unit")}</span>
                <span className="text-sm text-text-main-light dark:text-text-main-dark">{material.unit}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">{t("currentStock")}</span>
                <span className={cn("text-sm font-500", isBelowMin ? "text-danger" : "text-text-main-light dark:text-text-main-dark")}>
                  {material.current_stock ?? "—"} {material.unit}
                  {isBelowMin && <span className="ms-1 material-symbols-outlined text-[14px] align-middle">warning</span>}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">{t("minStockLevel")}</span>
                <span className="text-sm text-text-main-light dark:text-text-main-dark">{material.min_stock_level ?? "—"} {material.unit}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">{t("preferredSupplier")}</span>
                <span className="text-sm text-text-main-light dark:text-text-main-dark">{material.preferred_supplier_id ?? "—"}</span>
              </div>
            </div>
            {material.description && (
              <div className="mt-4 pt-4 border-t border-border-light dark:border-border-dark">
                <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark block mb-1">{t("description")}</span>
                <p className="text-sm text-text-main-light dark:text-text-main-dark">{material.description}</p>
              </div>
            )}
          </Card>
        </div>

        {/* Stats card */}
        {stats && (
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>{t("statsCard")}</CardTitle>
              </CardHeader>
              <div className="flex flex-col gap-3 mt-2">
                {isBelowMin && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-danger/10 border border-danger/20">
                    <span className="material-symbols-outlined text-[16px] text-danger">warning</span>
                    <span className="text-xs font-500 text-danger">{t("belowMinWarning")}</span>
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">{t("pendingOrdersCount")}</span>
                  <span className="text-sm font-500 text-text-main-light dark:text-text-main-dark">{stats.pending_orders_count}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">{t("pendingOrdersQty")}</span>
                  <span className="text-sm font-500 text-text-main-light dark:text-text-main-dark">{stats.pending_orders_qty} {material.unit}</span>
                </div>
                {stats.last_receipt_at && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">{t("lastReceipt")}</span>
                    <span className="text-sm text-text-main-light dark:text-text-main-dark">{formatDate(stats.last_receipt_at)}</span>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Update supplier modal */}
      <Modal open={showSupplier} onClose={() => setShowSupplier(false)} title={t("updateSupplier")}>
        <form onSubmit={supplierForm.handleSubmit((v) => updateSupplier(v))} className="flex flex-col gap-4">
          <Select
            label={t("preferredSupplier")}
            options={EMPTY_SUPPLIERS}
            value={supplierForm.watch("supplier_id") ?? ""}
            onChange={(e) => supplierForm.setValue("supplier_id", e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowSupplier(false)}>{tc("cancel")}</Button>
            <Button type="submit" loading={isUpdatingSupplier}>{tc("save")}</Button>
          </div>
        </form>
      </Modal>

      {/* Replenish stock modal */}
      <Modal open={showReplenish} onClose={() => setShowReplenish(false)} title={t("stockReplenish")}>
        <form onSubmit={replenishForm.handleSubmit((v) => replenish(v))} className="flex flex-col gap-4">
          <Input
            label={`${t("replenishQuantity")} (${material.unit})`}
            type="number"
            step="0.001"
            {...replenishForm.register("quantity")}
            error={replenishForm.formState.errors.quantity?.message}
          />
          <Input label={tc("notes")} {...replenishForm.register("notes")} />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowReplenish(false)}>{tc("cancel")}</Button>
            <Button type="submit" loading={isReplenishing}>{tc("save")}</Button>
          </div>
        </form>
      </Modal>

      {/* Adjust stock modal */}
      <Modal open={showAdjust} onClose={() => setShowAdjust(false)} title={t("stockAdjust")}>
        <form onSubmit={adjustForm.handleSubmit((v) => adjust(v))} className="flex flex-col gap-4">
          <Input
            label={`${t("adjustDelta")} (${material.unit})`}
            type="number"
            step="0.001"
            {...adjustForm.register("delta")}
            error={adjustForm.formState.errors.delta?.message}
          />
          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark -mt-2">{t("adjustDeltaHint")}</p>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-500 text-text-main-light dark:text-text-main-dark">{t("adjustReason")}</label>
            <textarea
              className="w-full rounded-lg border px-3 py-2 text-sm resize-none bg-background-light dark:bg-surface-dark text-text-main-light dark:text-text-main-dark border-border-light dark:border-border-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              rows={2}
              placeholder={t("adjustReasonPlaceholder")}
              {...adjustForm.register("reason")}
            />
            {adjustForm.formState.errors.reason && (
              <span className="text-xs text-danger">{adjustForm.formState.errors.reason.message}</span>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowAdjust(false)}>{tc("cancel")}</Button>
            <Button type="submit" loading={isAdjusting}>{tc("save")}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
