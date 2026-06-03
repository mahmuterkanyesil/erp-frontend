import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { cn } from "@erp/utils"
import { Button, Card, Modal, PageHeader, PermissionGate } from "@erp/ui"
import type { MaterialType } from "@erp/api-client"
import {
  useRawMaterials,
  useCreateRawMaterial,
  useBulkCreateMaterials,
  RawMaterialTable,
  RawMaterialForm,
  BulkCreateForm,
} from "@/features/purchasing"
import type { CreateRawMaterialValues } from "@/features/purchasing"

type TypeFilter = "all" | MaterialType

const TYPE_FILTERS: TypeFilter[] = [
  "all",
  "plastic_granule",
  "additive",
  "packaging",
  "semi_finished",
  "other",
]

export function MaterialsPage() {
  const navigate = useNavigate()
  const { t } = useTranslation("purchasing")
  const { t: tc } = useTranslation("common")

  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all")
  const [showCreate, setShowCreate] = useState(false)
  const [showBulk, setShowBulk] = useState(false)

  const { data = [], isLoading } = useRawMaterials(
    typeFilter !== "all" ? { type: typeFilter } : undefined,
  )
  const { mutate: createMaterial, isPending: isCreating } = useCreateRawMaterial(() =>
    setShowCreate(false),
  )
  const { mutate: bulkCreate, isPending: isBulking } = useBulkCreateMaterials(() =>
    setShowBulk(false),
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("materialsTab")}
        breadcrumbs={[
          { label: tc("nav.dashboard"), onClick: () => navigate({ to: "/" }) },
          { label: t("title"), onClick: () => navigate({ to: "/purchasing" }) },
          { label: t("materialsTab") },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <PermissionGate permission="purchasing:create">
              <Button variant="secondary" leftIcon="upload" onClick={() => setShowBulk(true)}>
                {t("bulkCreate")}
              </Button>
            </PermissionGate>
            <PermissionGate permission="purchasing:create">
              <Button leftIcon="add" onClick={() => setShowCreate(true)}>
                {t("newMaterial")}
              </Button>
            </PermissionGate>
          </div>
        }
      />

      {/* Type filter chips */}
      <div className="flex flex-wrap gap-2">
        {TYPE_FILTERS.map((type) => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-500 transition-colors",
              typeFilter === type
                ? "bg-primary text-white"
                : "bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-text-secondary-light dark:text-text-secondary-dark hover:border-primary hover:text-primary",
            )}
          >
            {type === "all" ? t("allTypes") : t(`type_${type}`)}
          </button>
        ))}
      </div>

      <Card>
        <RawMaterialTable
          data={data}
          loading={isLoading}
          onRowClick={(row) =>
            navigate({ to: "/purchasing/materials/$materialId", params: { materialId: row.id } })
          }
        />
      </Card>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title={t("newMaterial")}>
        <RawMaterialForm
          onSubmit={(values: CreateRawMaterialValues) => createMaterial(values)}
          isLoading={isCreating}
          onCancel={() => setShowCreate(false)}
        />
      </Modal>

      <Modal open={showBulk} onClose={() => setShowBulk(false)} title={t("bulkCreate")}>
        <BulkCreateForm
          onSubmit={(materials) => bulkCreate({ materials })}
          isLoading={isBulking}
          onCancel={() => setShowBulk(false)}
        />
      </Modal>
    </div>
  )
}
