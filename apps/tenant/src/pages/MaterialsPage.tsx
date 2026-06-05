import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { Button, Card, Modal, PageHeader, PermissionGate, Spinner } from "@erp/ui"
import {
  useRawMaterials,
  useCreateRawMaterial,
  RawMaterialForm,
  RawMaterialTable,
} from "@/features/purchasing"
import type { RawMaterial } from "@erp/api-client"
import type { CreateRawMaterialValues } from "@/features/purchasing"

export function MaterialsPage() {
  const navigate = useNavigate()
  const { t } = useTranslation("purchasing")
  const { t: tc } = useTranslation("common")

  const [showCreate, setShowCreate] = useState(false)

  const { data: materials = [], isLoading } = useRawMaterials()
  const { mutate: createMaterial, isPending: isCreating } = useCreateRawMaterial(() =>
    setShowCreate(false),
  )

  function handleRowClick(row: RawMaterial) {
    navigate({ to: "/purchasing/materials/$materialId", params: { materialId: row.id } })
  }

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
          <PermissionGate permission="purchasing:create">
            <Button leftIcon="add" onClick={() => setShowCreate(true)}>
              {t("newMaterial")}
            </Button>
          </PermissionGate>
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner />
        </div>
      ) : materials.length === 0 ? (
        <Card>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark py-4 text-center">
            {t("emptyMaterials")}
          </p>
        </Card>
      ) : (
        <RawMaterialTable data={materials} loading={isLoading} onRowClick={handleRowClick} />
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title={t("newMaterial")}>
        <RawMaterialForm
          onSubmit={(values: CreateRawMaterialValues) => createMaterial(values)}
          isLoading={isCreating}
          onCancel={() => setShowCreate(false)}
        />
      </Modal>
    </div>
  )
}
