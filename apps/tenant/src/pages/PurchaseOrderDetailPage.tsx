import { useState } from "react"
import { useParams, useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { cn } from "@erp/utils"
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  Modal,
  ConfirmModal,
  PageHeader,
  PermissionGate,
  FormSkeleton,
} from "@erp/ui"
import { useLocaleFormat } from "@erp/hooks"
import {
  usePurchaseOrder,
  useConfirmOrder,
  useCancelOrder,
  useAddOrderLine,
  useUpdatePurchaseOrder,
  useWarehouses,
  PurchaseOrderStatusBadge,
  AddLineForm,
  PurchaseOrderForm,
} from "@/features/purchasing"
import type { AddOrderLineValues, CreatePurchaseOrderValues } from "@/features/purchasing"
import { useSuppliers } from "@/features/suppliers"
import type { PurchaseOrderStatus } from "@erp/api-client"

const TIMELINE_STEPS: PurchaseOrderStatus[] = [
  "draft",
  "confirmed",
  "partially_received",
  "received",
]

const EMPTY_MATERIALS = [{ value: "", label: "—" }]

export function PurchaseOrderDetailPage() {
  const { orderId } = useParams({ from: "/protected/purchasing/$orderId" })
  const navigate = useNavigate()
  const { t } = useTranslation("purchasing")
  const { t: tc } = useTranslation("common")
  const { formatDate } = useLocaleFormat()

  const [showEdit, setShowEdit] = useState(false)
  const [showAddLine, setShowAddLine] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showCancel, setShowCancel] = useState(false)
  const [cancelReason, setCancelReason] = useState("")

  const { data: order, isLoading } = usePurchaseOrder(orderId)
  const { mutate: confirmOrder, isPending: isConfirming } = useConfirmOrder()
  const { mutate: cancelOrder, isPending: isCancelling } = useCancelOrder()
  const { mutate: addLine, isPending: isAddingLine } = useAddOrderLine(orderId, () =>
    setShowAddLine(false),
  )
  const { mutate: updateOrder, isPending: isUpdating } = useUpdatePurchaseOrder(orderId, () =>
    setShowEdit(false),
  )
  const { data: suppliers = [] } = useSuppliers()
  const { data: warehouses = [] } = useWarehouses()

  const supplierOptions = suppliers.map((s) => ({ value: s.id, label: s.name }))
  const warehouseOptions = warehouses.map((w) => ({
    value: w.id,
    label: w.code ? `${w.name} (${w.code})` : w.name,
  }))

  if (isLoading) return <FormSkeleton />
  if (!order) return null

  const canModify = order.status === "draft"
  const canConfirm = order.status === "draft"
  const canCancel = order.status === "draft" || order.status === "confirmed"
  const canReceipt = order.status === "confirmed" || order.status === "partially_received"
  const isCancelled = order.status === "cancelled"
  const currentStep = TIMELINE_STEPS.indexOf(order.status as PurchaseOrderStatus)

  function handleCancelSubmit() {
    if (!cancelReason.trim()) return
    cancelOrder({ id: orderId, reason: cancelReason })
    setShowCancel(false)
    setCancelReason("")
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`#${order.id.slice(-8)}`}
        breadcrumbs={[
          { label: tc("nav.dashboard"), onClick: () => navigate({ to: "/" }) },
          { label: t("title"), onClick: () => navigate({ to: "/purchasing" }) },
          { label: `#${order.id.slice(-8)}` },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {canModify && (
              <PermissionGate permission="purchasing:create">
                <Button variant="ghost" leftIcon="edit" onClick={() => setShowEdit(true)}>
                  {t("editOrder")}
                </Button>
              </PermissionGate>
            )}
            {canReceipt && (
              <PermissionGate permission="purchasing:create">
                <Button
                  variant="secondary"
                  leftIcon="inventory"
                  onClick={() =>
                    navigate({ to: "/purchasing/$orderId/receipt", params: { orderId } })
                  }
                >
                  {t("goodsReceipt")}
                </Button>
              </PermissionGate>
            )}
            {canConfirm && (
              <PermissionGate permission="purchasing:approve">
                <Button leftIcon="check_circle" onClick={() => setShowConfirm(true)}>
                  {t("confirm")}
                </Button>
              </PermissionGate>
            )}
            {canCancel && (
              <PermissionGate permission="purchasing:approve">
                <Button variant="danger" leftIcon="cancel" onClick={() => setShowCancel(true)}>
                  {t("cancel")}
                </Button>
              </PermissionGate>
            )}
          </div>
        }
      />

      {isCancelled ? (
        <Card>
          <div className="flex items-center gap-3 py-2">
            <span className="material-symbols-outlined text-[24px] text-danger">cancel</span>
            <span className="text-sm font-500 text-danger">{t("status_cancelled")}</span>
          </div>
        </Card>
      ) : (
        <Card>
          <p className="text-xs font-500 text-text-secondary-light dark:text-text-secondary-dark mb-4">
            {t("orderProcess")}
          </p>
          <div className="flex items-start">
            {TIMELINE_STEPS.map((step, idx) => {
              const isCompleted = idx < currentStep
              const isCurrent = idx === currentStep
              return (
                <div key={step} className="flex-1 flex flex-col items-center relative">
                  {idx < TIMELINE_STEPS.length - 1 && (
                    <div
                      className={cn(
                        "absolute top-4 start-1/2 w-full h-0.5",
                        isCompleted || isCurrent
                          ? "bg-primary"
                          : "bg-border-light dark:bg-border-dark",
                      )}
                    />
                  )}
                  <div
                    className={cn(
                      "relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-700 mb-2",
                      isCompleted
                        ? "bg-primary text-white"
                        : isCurrent
                          ? "bg-primary text-white ring-4 ring-primary/20"
                          : "bg-border-light dark:bg-border-dark text-text-secondary-light dark:text-text-secondary-dark",
                    )}
                  >
                    {isCompleted ? (
                      <span className="material-symbols-outlined text-[16px]">check</span>
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-xs text-center leading-tight",
                      isCurrent
                        ? "text-primary font-500"
                        : isCompleted
                          ? "text-text-main-light dark:text-text-main-dark"
                          : "text-text-secondary-light dark:text-text-secondary-dark",
                    )}
                  >
                    {t(`status_${step}`)}
                  </span>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("summaryCard")}</CardTitle>
            </CardHeader>
            <div className="flex flex-col gap-3 mt-2">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                  {tc("status")}
                </span>
                <PurchaseOrderStatusBadge status={order.status} />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                  {t("supplier")}
                </span>
                <span className="text-sm font-500 text-text-main-light dark:text-text-main-dark">
                  {order.supplier_name ?? order.supplier_id}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                  {t("warehouse")}
                </span>
                <span className="text-sm text-text-main-light dark:text-text-main-dark">
                  {order.warehouse_name ?? order.warehouse_id}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                  {t("source")}
                </span>
                <span className="text-sm text-text-main-light dark:text-text-main-dark">
                  {t(`source_${order.source.toUpperCase()}`)}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                  {t("expectedDate")}
                </span>
                <span className="text-sm text-text-main-light dark:text-text-main-dark">
                  {formatDate(order.expected_at)}
                </span>
              </div>
              {order.notes && (
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                    {tc("notes")}
                  </span>
                  <span className="text-sm text-text-main-light dark:text-text-main-dark">
                    {order.notes}
                  </span>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{t("lines")}</CardTitle>
              {canModify && (
                <PermissionGate permission="purchasing:create">
                  <Button size="sm" leftIcon="add" onClick={() => setShowAddLine(true)}>
                    {t("addLine")}
                  </Button>
                </PermissionGate>
              )}
            </CardHeader>
            {(order.lines ?? []).length === 0 ? (
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark py-4 text-center">
                {tc("noData")}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border-light dark:border-border-dark">
                      <th className="text-start py-2 pe-4 font-500 text-text-secondary-light dark:text-text-secondary-dark">
                        {t("material")}
                      </th>
                      <th className="text-end py-2 pe-4 font-500 text-text-secondary-light dark:text-text-secondary-dark">
                        {t("quantity")}
                      </th>
                      <th className="text-end py-2 pe-4 font-500 text-text-secondary-light dark:text-text-secondary-dark hidden md:table-cell">
                        {t("unitPrice")}
                      </th>
                      <th className="text-end py-2 pe-4 font-500 text-text-secondary-light dark:text-text-secondary-dark">
                        {t("totalPrice")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(order.lines ?? []).map((line) => (
                      <tr
                        key={line.id}
                        className="border-b border-border-light dark:border-border-dark last:border-0"
                      >
                        <td className="py-3 pe-4 text-text-main-light dark:text-text-main-dark">
                          {line.material_name ?? line.material_id}
                        </td>
                        <td className="py-3 pe-4 text-end text-text-main-light dark:text-text-main-dark">
                          {line.ordered_qty_value} {line.ordered_qty_unit}
                        </td>
                        <td className="py-3 pe-4 text-end text-text-secondary-light dark:text-text-secondary-dark hidden md:table-cell">
                          {line.unit_price_amount} {line.unit_price_currency}
                        </td>
                        <td className="py-3 pe-4 text-end font-500 text-text-main-light dark:text-text-main-dark">
                          {(line.ordered_qty_value * parseFloat(line.unit_price_amount)).toFixed(2)}{" "}
                          {line.unit_price_currency}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>

      <Modal open={showAddLine} onClose={() => setShowAddLine(false)} title={t("addLine")}>
        <AddLineForm
          materials={EMPTY_MATERIALS}
          onSubmit={(values: AddOrderLineValues) => addLine(values)}
          isLoading={isAddingLine}
          onCancel={() => setShowAddLine(false)}
        />
      </Modal>

      <ConfirmModal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => {
          confirmOrder(orderId)
          setShowConfirm(false)
        }}
        title={t("confirmTitle")}
        loading={isConfirming}
      />

      <Modal open={showEdit} onClose={() => setShowEdit(false)} title={t("editOrder")}>
        <PurchaseOrderForm
          suppliers={supplierOptions}
          warehouses={warehouseOptions}
          defaultValues={{
            supplier_id: order.supplier_id,
            warehouse_id: order.warehouse_id,
            source: order.source.toUpperCase() as "MANUAL" | "ORDER",
            expected_date: order.expected_at?.slice(0, 10),
            notes: order.notes ?? undefined,
          }}
          submitLabel={tc("save")}
          onSubmit={(values: CreatePurchaseOrderValues) => updateOrder(values)}
          isLoading={isUpdating}
          onCancel={() => setShowEdit(false)}
        />
      </Modal>

      <Modal
        open={showCancel}
        onClose={() => {
          setShowCancel(false)
          setCancelReason("")
        }}
        title={t("cancelTitle")}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-500 text-text-main-light dark:text-text-main-dark">
              {t("cancelReason")}
            </label>
            <textarea
              className={cn(
                "w-full rounded-lg border px-3 py-2 text-sm resize-none",
                "bg-background-light dark:bg-surface-dark",
                "text-text-main-light dark:text-text-main-dark",
                "border-border-light dark:border-border-dark",
                "placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark",
                "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary",
              )}
              rows={3}
              placeholder={t("cancelReasonPlaceholder")}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowCancel(false)
                setCancelReason("")
              }}
            >
              {tc("cancel")}
            </Button>
            <Button
              type="button"
              variant="danger"
              disabled={!cancelReason.trim()}
              loading={isCancelling}
              onClick={handleCancelSubmit}
            >
              {t("cancel")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
