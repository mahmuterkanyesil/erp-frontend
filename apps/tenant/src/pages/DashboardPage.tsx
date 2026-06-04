import { useTranslation } from "@erp/i18n"
import { PageHeader, StatCard } from "@erp/ui"
import { useAuthStore } from "@erp/hooks"

export function DashboardPage() {
  const { t } = useTranslation("dashboard")
  const user = useAuthStore((s) => s.user)

  const subtitle = user
    ? `${t("welcomePrefix")}, ${user.firstName} ${user.lastName}. ${t("welcomeSubtitle")}`
    : t("welcomeSubtitle")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("title")} subtitle={subtitle} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={t("stats.dailySales")}
          value="—"
          icon="payments"
          iconColor="success"
          trend={{ value: 0, direction: "neutral", label: t("trends.comparedToYesterday") }}
        />
        <StatCard
          label={t("stats.pendingOrders")}
          value="—"
          icon="shopping_bag"
          iconColor="info"
          trend={{ value: 0, direction: "neutral", label: t("trends.comparedToLastWeek") }}
        />
        <StatCard
          label={t("stats.criticalStock")}
          value="—"
          icon="inventory_2"
          iconColor="warning"
          trend={{ value: 0, direction: "neutral", label: t("trends.criticalLevel") }}
        />
        <StatCard
          label={t("stats.activeCustomers")}
          value="—"
          icon="group"
          iconColor="primary"
          trend={{ value: 0, direction: "neutral", label: t("trends.onlineCustomers") }}
        />
      </div>
    </div>
  )
}
