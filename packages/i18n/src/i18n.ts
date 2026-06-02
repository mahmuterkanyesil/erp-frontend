import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import LanguageDetector from "i18next-browser-languagedetector"

// Eagerly import Turkish (default/fallback)
import trCommon from "./locales/tr/common.json"
import trAuth from "./locales/tr/auth.json"
import trErrors from "./locales/tr/errors.json"
import trOrders from "./locales/tr/orders.json"
import trInventory from "./locales/tr/inventory.json"
import trProducts from "./locales/tr/products.json"
import trSales from "./locales/tr/sales.json"
import trPurchasing from "./locales/tr/purchasing.json"
import trCustomers from "./locales/tr/customers.json"
import trWarehouse from "./locales/tr/warehouse.json"
import trAccounting from "./locales/tr/accounting.json"
import trUsers from "./locales/tr/users.json"
import trAudit from "./locales/tr/audit.json"

// English
import enCommon from "./locales/en/common.json"
import enAuth from "./locales/en/auth.json"
import enErrors from "./locales/en/errors.json"
import enOrders from "./locales/en/orders.json"
import enInventory from "./locales/en/inventory.json"
import enProducts from "./locales/en/products.json"
import enSales from "./locales/en/sales.json"
import enPurchasing from "./locales/en/purchasing.json"
import enCustomers from "./locales/en/customers.json"
import enWarehouse from "./locales/en/warehouse.json"
import enAccounting from "./locales/en/accounting.json"
import enUsers from "./locales/en/users.json"
import enAudit from "./locales/en/audit.json"

// Arabic
import arCommon from "./locales/ar/common.json"
import arAuth from "./locales/ar/auth.json"
import arErrors from "./locales/ar/errors.json"
import arOrders from "./locales/ar/orders.json"
import arInventory from "./locales/ar/inventory.json"
import arProducts from "./locales/ar/products.json"
import arSales from "./locales/ar/sales.json"
import arPurchasing from "./locales/ar/purchasing.json"
import arCustomers from "./locales/ar/customers.json"
import arWarehouse from "./locales/ar/warehouse.json"
import arAccounting from "./locales/ar/accounting.json"
import arUsers from "./locales/ar/users.json"
import arAudit from "./locales/ar/audit.json"

const resources = {
  tr: { common: trCommon, auth: trAuth, errors: trErrors, orders: trOrders, inventory: trInventory, products: trProducts, sales: trSales, purchasing: trPurchasing, customers: trCustomers, warehouse: trWarehouse, accounting: trAccounting, users: trUsers, audit: trAudit },
  en: { common: enCommon, auth: enAuth, errors: enErrors, orders: enOrders, inventory: enInventory, products: enProducts, sales: enSales, purchasing: enPurchasing, customers: enCustomers, warehouse: enWarehouse, accounting: enAccounting, users: enUsers, audit: enAudit },
  ar: { common: arCommon, auth: arAuth, errors: arErrors, orders: arOrders, inventory: arInventory, products: arProducts, sales: arSales, purchasing: arPurchasing, customers: arCustomers, warehouse: arWarehouse, accounting: arAccounting, users: arUsers, audit: arAudit },
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "tr",
    supportedLngs: ["tr", "en", "ar"],
    defaultNS: "common",
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "erp-language",
    },
  })

// Apply dir attribute on language change
i18n.on("languageChanged", (lng) => {
  if (typeof document !== "undefined") {
    const dir = lng === "ar" ? "rtl" : "ltr"
    document.documentElement.setAttribute("dir", dir)
    document.documentElement.setAttribute("lang", lng)
  }
})

export default i18n
