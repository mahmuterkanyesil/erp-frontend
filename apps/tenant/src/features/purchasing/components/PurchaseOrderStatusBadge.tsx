import { useTranslation } from "react-i18next"
import { Badge } from "@erp/ui"
import type { BadgeColor } from "@erp/ui"
import type { PurchaseOrderStatus } from "@erp/api-client"

const statusColor: Record<PurchaseOrderStatus, BadgeColor> = {
  draft: "neutral",
  confirmed: "info",
  partially_received: "warning",
  received: "success",
  cancelled: "danger",
}

interface Props {
  status: PurchaseOrderStatus
}

export function PurchaseOrderStatusBadge({ status }: Props) {
  const { t } = useTranslation("purchasing")
  return (
    <Badge color={statusColor[status]} dot>
      {t(`status_${status}`)}
    </Badge>
  )
}
