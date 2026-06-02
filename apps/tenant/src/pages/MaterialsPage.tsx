import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { Button, Card, Modal, PageHeader, PermissionGate } from "@erp/ui"
import { useCreateRawMaterial, RawMaterialForm } from "@/features/purchasing"
import type { CreateRawMaterialValues } from "@/features/purchasing"

export function MaterialsPage() {
  const navigate = useNavigate()
  const { t } = useTranslation("purchasing")
  const { t: tc } = useTranslation("common")
  const [showCreate, setShowCreate] = useState(false)

  const { mutate, isPending } = useCreateRawMaterial(() => setShowCreate(false))

  function handleSubmit(values: CreateRawMaterialValues) {
    mutate(values)
  }

  return (
    <div>
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

      <Card>
        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark py-4 text-center">
          {t("emptyMaterials")}
        </p>
      </Card>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title={t("newMaterial")}>
        <RawMaterialForm
          onSubmit={handleSubmit}
          isLoading={isPending}
          onCancel={() => setShowCreate(false)}
        />
      </Modal>
    </div>
  )
}
