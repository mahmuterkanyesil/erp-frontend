import { useState } from "react"
import { useParams, useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import {
  Button,
  Card,
  Modal,
  PageHeader,
  PermissionGate,
  FormSkeleton,
  Select,
} from "@erp/ui"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRawMaterial, useUpdatePreferredSupplier } from "@/features/purchasing"
import {
  updatePreferredSupplierSchema,
  type UpdatePreferredSupplierValues,
} from "@/features/purchasing/schemas/purchasing.schema"

const EMPTY_SUPPLIERS = [{ value: "", label: "—" }]

export function MaterialDetailPage() {
  const { materialId } = useParams({ from: "/protected/purchasing/materials/$materialId" })
  const navigate = useNavigate()
  const { t } = useTranslation("purchasing")
  const { t: tc } = useTranslation("common")
  const [showSupplier, setShowSupplier] = useState(false)

  const { data: material, isLoading } = useRawMaterial(materialId)
  const { mutate, isPending } = useUpdatePreferredSupplier(materialId, () =>
    setShowSupplier(false),
  )

  const { handleSubmit, setValue, watch } = useForm<UpdatePreferredSupplierValues>({
    resolver: zodResolver(updatePreferredSupplierSchema),
  })

  if (isLoading) return <FormSkeleton />
  if (!material) return null

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
          <PermissionGate permission="purchasing:update">
            <Button variant="secondary" leftIcon="store" onClick={() => setShowSupplier(true)}>
              {t("updateSupplier")}
            </Button>
          </PermissionGate>
        }
      />

      <Card>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
              {t("sku")}
            </span>
            <span className="text-sm font-500 text-text-main-light dark:text-text-main-dark">
              {material.sku}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
              {t("materialType")}
            </span>
            <span className="text-sm text-text-main-light dark:text-text-main-dark">
              {t(`type_${material.material_type}`)}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
              {t("unit")}
            </span>
            <span className="text-sm text-text-main-light dark:text-text-main-dark">
              {material.unit}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
              {t("currentStock")}
            </span>
            <span className="text-sm font-500 text-text-main-light dark:text-text-main-dark">
              {material.current_stock ?? "—"}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
              {t("minStockLevel")}
            </span>
            <span className="text-sm text-text-main-light dark:text-text-main-dark">
              {material.min_stock_level ?? "—"}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
              {t("preferredSupplier")}
            </span>
            <span className="text-sm text-text-main-light dark:text-text-main-dark">
              {material.preferred_supplier_id ?? "—"}
            </span>
          </div>
        </div>

        {material.description && (
          <div className="mt-4 pt-4 border-t border-border-light dark:border-border-dark">
            <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark block mb-1">
              {t("description")}
            </span>
            <p className="text-sm text-text-main-light dark:text-text-main-dark">
              {material.description}
            </p>
          </div>
        )}
      </Card>

      <Modal open={showSupplier} onClose={() => setShowSupplier(false)} title={t("updateSupplier")}>
        <form onSubmit={handleSubmit((values) => mutate(values))} className="flex flex-col gap-4">
          <Select
            label={t("preferredSupplier")}
            options={EMPTY_SUPPLIERS}
            value={watch("supplier_id") ?? ""}
            onChange={(e) => setValue("supplier_id", e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowSupplier(false)}>
              {tc("cancel")}
            </Button>
            <Button type="submit" loading={isPending}>
              {tc("save")}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
