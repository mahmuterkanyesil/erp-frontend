import { useTranslation } from "react-i18next"
import { Badge } from "@erp/ui"
import type { BadgeColor } from "@erp/ui"

const statusColor: Record<"active" | "inactive", BadgeColor> = {
  active: "success",
  inactive: "neutral",
}

interface Props {
  status: "active" | "inactive"
}

export function CustomerStatusBadge({ status }: Props) {
  const { t } = useTranslation("customers")
  return (
    <Badge color={statusColor[status]} dot>
      {t(`status_${status}`)}
    </Badge>
  )
}
