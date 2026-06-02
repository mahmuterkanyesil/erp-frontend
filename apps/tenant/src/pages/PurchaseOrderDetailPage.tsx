import { useState } from "react"
import { useParams, useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
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
  PurchaseOrderStatusBadge,
  AddLineForm,
} from "@/features/purchasing"
import type { AddOrderLineValues } from "@/features/purchasing"

const EMPTY_MATERIALS = [{ value: "", label: "—" }]

export function PurchaseOrderDetailPage() {
  const { orderId } = useParams({ from: "/protected/purchasing/$orderId" })
  const navigate = useNavigate()
  const { t } = useTranslation("purchasing")
  const { t: tc } = useTranslation("common")

  const [showAddLine, setShowAddLine] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showCancel, setShowCancel] = useState(false)

  const { formatDate } = useLocaleFormat()
  const { data: order, isLoading } = usePurchaseOrder(orderId)
  const { mutate: confirmOrder, isPending: isConfirming } = useConfirmOrder()
  const { mutate: cancelOrder, isPending: isCancelling } = useCancelOrder()
  const { mutate: addLine, isPending: isAddingLine } = useAddOrderLine(orderId, () =>
    setShowAddLine(false),
  )

  if (isLoading) return <FormSkeleton />
  if (!order) return null

  const canModify = order.status === "draft"
  const canConfirm = order.status === "draft"
  const canCancel = order.status === "draft" || order.status === "confirmed"
  const canReceipt = order.status === "confirmed" || order.status === "partially_received"

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

      {/* Özet */}
      <Card>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
              {t("expectedDate")}
            </span>
            <span className="text-sm text-text-main-light dark:text-text-main-dark">
              {formatDate(order.expected_date)}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
              {t("totalAmount")}
            </span>
            <span className="text-sm font-700 text-text-main-light dark:text-text-main-dark">
              {order.total_amount} {order.currency}
            </span>
          </div>
        </div>
      </Card>

      {/* Satırlar */}
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

        {order.lines.length === 0 ? (
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
                  <th className="text-end py-2 font-500 text-text-secondary-light dark:text-text-secondary-dark">
                    {t("totalPrice")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {order.lines.map((line) => (
                  <tr
                    key={line.id}
                    className="border-b border-border-light dark:border-border-dark last:border-0"
                  >
                    <td className="py-3 pe-4 text-text-main-light dark:text-text-main-dark">
                      {line.material_name ?? line.material_id}
                    </td>
                    <td className="py-3 pe-4 text-end text-text-main-light dark:text-text-main-dark">
                      {line.quantity} {line.unit}
                    </td>
                    <td className="py-3 pe-4 text-end text-text-secondary-light dark:text-text-secondary-dark hidden md:table-cell">
                      {line.unit_price}
                    </td>
                    <td className="py-3 text-end font-500 text-text-main-light dark:text-text-main-dark">
                      {line.total_price}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

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

      <ConfirmModal
        open={showCancel}
        onClose={() => setShowCancel(false)}
        onConfirm={() => {
          cancelOrder(orderId)
          setShowCancel(false)
        }}
        title={t("cancelTitle")}
        danger
        loading={isCancelling}
      />
    </div>
  )
}
