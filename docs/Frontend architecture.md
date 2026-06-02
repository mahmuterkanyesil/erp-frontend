# Plastik ERP — Frontend Mimari Dökümanı

> **Stack:** React 18 + TypeScript + Vite + TailwindCSS v4 + React Query + i18next  
> **Versiyon:** 1.0.0 | **Durum:** Planlama / Başlangıç

---

## İçindekiler

1. [Proje Genel Bakış](#1-proje-genel-bakış)
2. [Tasarım Sistemi & Kurallar](#2-tasarım-sistemi--kurallar)
3. [Klasör Yapısı](#3-klasör-yapısı)
4. [Durum Yönetimi](#4-durum-yönetimi)
5. [API Katmanı & Servis Yapısı](#5-api-katmanı--servis-yapısı)
6. [Auth & Permission Sistemi](#6-auth--permission-sistemi)
7. [Routing Yapısı](#7-routing-yapısı)
8. [Modüller & Sayfalar](#8-modüller--sayfalar)
9. [Bileşen Mimarisi](#9-bileşen-mimarisi)
10. [Çoklu Dil & RTL Desteği](#10-çoklu-dil--rtl-desteği)
11. [Kod Kuralları](#11-kod-kuralları)
12. [TODO Listesi](#12-todo-listesi)

---

## 1. Proje Genel Bakış

**Ürün:** Plastik üretim firmaları için çok kiracılı (multi-tenant) SaaS ERP.  
**Kullanıcı Tipleri:**
- **Platform Admin** → Tenant yönetimi, abonelik, faturalama (`http://localhost:8080`)
- **Tenant Kullanıcısı** → ERP operasyonları (stok, sipariş, satış…) (`http://localhost:8081`)

**İki ayrı uygulama** aynı repo içinde yaşar:
```
/apps/platform   → Platform Admin Panel
/apps/tenant     → Tenant ERP Panel
```

---

## 2. Tasarım Sistemi & Kurallar

### 2.1 Renk Paleti (Design Tokens)

Mockup'lardan konsolide edilmiş **kesin renk standardı:**

```ts
// tailwind.config.ts — tokens
colors: {
  primary: {
    DEFAULT: "#137fec",
    dark:    "#0f65bd",
    light:   "#e8f3fd",
  },
  background: {
    light: "#f6f7f8",
    dark:  "#101922",
  },
  surface: {
    light: "#ffffff",
    dark:  "#1a2632",
  },
  "surface-elevated": {
    light: "#ffffff",
    dark:  "#1e2936",
  },
  border: {
    light: "#e7edf3",
    dark:  "#2a3b4d",
  },
  text: {
    main: {
      light: "#0d141b",
      dark:  "#e2e8f0",
    },
    secondary: {
      light: "#4c739a",
      dark:  "#94a3b8",
    },
  },
  // Semantic renkler
  success: "#16a34a",
  warning: "#d97706",
  danger:  "#dc2626",
  info:    "#0369a1",
}
```

> ⚠️ **Kural:** Hardcoded hex kod kullanılmaz. Tüm renkler token üzerinden gelir.

### 2.2 Tipografi

```ts
fontFamily: {
  display: ["Manrope", "sans-serif"],
}
```

**Ağırlık skalası:**
| Kullanım | Weight |
|---|---|
| Body / normal metin | 400 |
| Label / nav item | 500 |
| Başlık / kart başlığı | 700 |
| Hero / sayfa başlığı | 800 |

### 2.3 İkonografi

- **Kütüphane:** Google Material Symbols Outlined  
- **Kullanım:** `<span className="material-symbols-outlined">{icon_name}</span>`
- **Aktif state:** `font-variation-settings: 'FILL' 1` (filled)
- **Boyut standardı:** 20px (small), 24px (default), 28px (large)

### 2.4 Border Radius Standardı

```ts
borderRadius: {
  DEFAULT: "0.25rem",  // 4px  — input, badge
  lg:      "0.5rem",   // 8px  — card
  xl:      "0.75rem",  // 12px — modal, panel
  "2xl":   "1rem",     // 16px — büyük card
  full:    "9999px",   // avatar, pill badge
}
```

### 2.5 Layout & Spacing

- **Sidebar genişliği:** 256px (w-64) — desktop
- **Header yüksekliği:** 64px (h-16) — sticky
- **Content max-width:** 1280px
- **İçerik padding:** px-6 py-4 (mobile), px-8 py-6 (tablet+), px-12 py-8 (desktop)
- **Card padding:** p-4 (sm), p-6 (default)
- **Grid:** 1 kolon (mobile) → 2 kolon (tablet) → 3-4 kolon (desktop)

### 2.6 Dark Mode

- Strateji: **`class` bazlı** (html elementine `dark` class eklenir)
- Tercih: OS tercihi + localStorage ile persist edilir
- Bileşenlerde: her zaman `dark:` prefix ile ikili renk tanımı

### 2.7 Responsive Breakpoint Stratejisi

```
sm:  640px   — geniş mobil
md:  768px   — tablet / sidebar görünür
lg:  1024px  — sidebar + içerik yan yana
xl:  1280px  — geniş desktop
2xl: 1536px  — ultra-wide
```

**Mobil-First:** Tüm stiller küçükten büyüğe yazılır.  
**Sidebar:** `md:` breakpoint'te görünür olur; mobilden hamburger menü açılır.

---

## 3. Klasör Yapısı

```
erp-frontend/
├── apps/
│   ├── platform/              # Platform Admin Uygulaması
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   ├── features/
│   │   │   └── main.tsx
│   │   └── vite.config.ts
│   └── tenant/                # Tenant ERP Uygulaması
│       ├── src/
│       │   ├── pages/
│       │   ├── features/
│       │   └── main.tsx
│       └── vite.config.ts
│
├── packages/
│   ├── ui/                    # Paylaşılan UI bileşen kütüphanesi
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Button/
│   │   │   │   ├── Input/
│   │   │   │   ├── Table/
│   │   │   │   ├── Modal/
│   │   │   │   ├── Badge/
│   │   │   │   ├── Card/
│   │   │   │   ├── Select/
│   │   │   │   ├── DatePicker/
│   │   │   │   ├── Toast/
│   │   │   │   ├── Sidebar/
│   │   │   │   ├── Header/
│   │   │   │   └── Pagination/
│   │   │   ├── layouts/
│   │   │   │   ├── AppLayout.tsx      # Sidebar + Header + content
│   │   │   │   ├── AuthLayout.tsx     # Login / reset sayfaları
│   │   │   │   └── FullscreenLayout.tsx
│   │   │   └── index.ts
│   │
│   ├── api-client/            # API istek katmanı (ikisi için ortak)
│   │   ├── src/
│   │   │   ├── tenant/        # Tenant API servisleri
│   │   │   ├── platform/      # Platform API servisleri
│   │   │   ├── http.ts        # Axios instance + interceptor
│   │   │   ├── auth.ts        # Token yönetimi
│   │   │   └── types.ts       # Ortak DTO tipleri
│   │
│   ├── hooks/                 # Paylaşılan React hooks
│   │   └── src/
│   │       ├── usePermission.ts
│   │       ├── useDebounce.ts
│   │       ├── usePagination.ts
│   │       └── useLocalStorage.ts
│   │
│   └── utils/                 # Yardımcı fonksiyonlar
│       └── src/
│           ├── currency.ts    # Para formatı (string ↔ display)
│           ├── date.ts        # RFC3339 parse/format
│           ├── cn.ts          # clsx + tailwind-merge
│           └── validators.ts
│
├── i18n/                      # Çoklu dil paketi
│   └── src/
│       ├── locales/
│       │   ├── tr/            # Türkçe (varsayılan)
│       │   ├── en/            # İngilizce
│       │   └── ar/            # Arapça (RTL)
│       ├── i18n.ts            # i18next konfigürasyonu
│       └── index.ts
│
├── package.json               # Monorepo root (pnpm workspaces)
├── pnpm-workspace.yaml
└── turbo.json                 # Turborepo build pipeline
```

---

## 4. Durum Yönetimi

### 4.1 Strateji

| Katman | Araç | Kullanım |
|---|---|---|
| Server state | **TanStack Query v5** | API verisi, cache, refetch |
| Global client state | **Zustand** | Auth, kullanıcı, permissions, UI prefs, **dil/yön** |
| Form state | **React Hook Form** | Tüm formlar |
| Form validation | **Zod** | Schema tabanlı doğrulama |
| URL state | **React Router v6** | Filtreler, sayfalama, arama |

### 4.2 Zustand Store'ları

```ts
// auth.store.ts
interface AuthStore {
  user: UserResult | null
  permissions: string[]
  tenantId: string | null
  accessToken: string | null   // memory'de
  setAuth(payload: LoginResponse): void
  clearAuth(): void
  hasPermission(perm: string): boolean
}

// ui.store.ts
interface UIStore {
  sidebarOpen: boolean
  theme: "light" | "dark" | "system"
  toggleSidebar(): void
  setTheme(t: Theme): void
}
```

### 4.3 TanStack Query Yapısı

```ts
// Query key factory örneği
export const orderKeys = {
  all: ["orders"] as const,
  list: (filters?: OrderFilters) => [...orderKeys.all, "list", filters],
  detail: (id: string) => [...orderKeys.all, "detail", id],
}

// Kullanım
const { data } = useQuery({
  queryKey: orderKeys.list(filters),
  queryFn: () => orderService.list(filters),
  staleTime: 30_000,
})
```

---

## 5. API Katmanı & Servis Yapısı

### 5.1 Axios Instance

```ts
// packages/api-client/src/http.ts
const tenantApi = axios.create({
  baseURL: import.meta.env.VITE_TENANT_API_URL, // http://localhost:8081
  headers: { "Content-Type": "application/json" },
})

// Request interceptor: token ekle
tenantApi.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Response interceptor: 401 → refresh → retry
tenantApi.interceptors.response.use(
  (r) => r,
  async (error) => {
    if (error.response?.status === 401) {
      // refresh token logic
    }
    return Promise.reject(error)
  }
)
```

### 5.2 Servis Katmanı Örneği

```ts
// packages/api-client/src/tenant/order.service.ts
export const orderService = {
  list: () =>
    tenantApi.get<Order[]>("/api/v1/orders").then(r => r.data),
  
  get: (id: string) =>
    tenantApi.get<Order>(`/api/v1/orders/${id}`).then(r => r.data),

  approve: (id: string) =>
    tenantApi.post(`/api/v1/orders/${id}/approve`).then(r => r.data),

  reject: (id: string, reason: string) =>
    tenantApi.post(`/api/v1/orders/${id}/reject`, { reason }).then(r => r.data),
}
```

### 5.3 Para Tutarı Kuralı

```ts
// utils/currency.ts
// Backend → Frontend: string "1250.50" → display "1.250,50 ₺"
// Frontend → Backend: user input → string "1250.50" (ASLA float)
export const formatCurrency = (value: string, currency = "TRY") => {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency", currency,
    minimumFractionDigits: 2,
  }).format(parseFloat(value))
}
```

### 5.4 Hata Yönetimi

```ts
// Merkezi hata handler
const handleApiError = (error: AxiosError) => {
  const msg = (error.response?.data as any)?.error ?? "Bir hata oluştu"
  
  switch (error.response?.status) {
    case 403: toast.error("Bu işlem için yetkiniz yok"); break
    case 422: toast.error(msg); break           // iş kuralı ihlali
    case 409: toast.error(msg); break           // durum çakışması
    case 410: toast.warning("Kaynak süresi doldu"); break
    case 429: toast.warning("Çok fazla istek, lütfen bekleyin"); break
    default:  toast.error("Bir hata oluştu, lütfen tekrar deneyin")
  }
}
```

---

## 6. Auth & Permission Sistemi

### 6.1 Token Yönetimi

- `access_token` (15 dk TTL) → **memory (Zustand store)**  
- `refresh_token` (7 gün TTL) → **httpOnly cookie** (ideal) veya **localStorage** (kabul edilebilir)
- Uygulama açılışında: localStorage'dan refresh token varsa → otomatik refresh → sessiz login

### 6.2 Permission Guard

```tsx
// packages/hooks/src/usePermission.ts
export const usePermission = (permission: string): boolean => {
  return useAuthStore(state => state.permissions.includes(permission))
}

// packages/ui/src/components/PermissionGate.tsx
interface Props {
  permission: string
  children: ReactNode
  fallback?: ReactNode
}
export const PermissionGate = ({ permission, children, fallback = null }: Props) => {
  const can = usePermission(permission)
  return can ? <>{children}</> : <>{fallback}</>
}

// Kullanım
<PermissionGate permission="orders:create">
  <Button onClick={handleCreate}>Sipariş Oluştur</Button>
</PermissionGate>
```

### 6.3 Route Guard

```tsx
// Korumalı route wrapper
const ProtectedRoute = ({ permission }: { permission?: string }) => {
  const { user } = useAuthStore()
  const can = usePermission(permission ?? "")
  
  if (!user) return <Navigate to="/login" replace />
  if (permission && !can) return <Navigate to="/403" replace />
  return <Outlet />
}
```

---

## 7. Routing Yapısı

### Tenant App (`/apps/tenant`)

```
/                         → Dashboard
/login                    → Giriş
/403                      → Yetkisiz
/404                      → Bulunamadı

/orders                   → Sipariş listesi
/orders/new               → Yeni sipariş
/orders/:id               → Sipariş detayı
/orders/:id/items         → Kalem yönetimi

/sales                    → Satış listesi
/sales/new                → Yeni satış
/sales/:id                → Satış detayı

/inventory                → Envanter listesi
/inventory/:id            → Envanter detayı
/inventory/low-stock      → Düşük stok uyarıları
/inventory/movements/new  → Stok hareketi oluştur

/products                 → Ürün listesi
/products/new             → Yeni ürün
/products/:id             → Ürün detayı
/products/:id/variants    → Varyant yönetimi
/products/recipes         → Reçeteler

/purchasing               → Satın alma listesi
/purchasing/new           → Yeni satın alma
/purchasing/:id           → Satın alma detayı
/purchasing/materials     → Hammadde yönetimi
/purchasing/materials/new → Yeni hammadde
/purchasing/materials/:id → Hammadde detayı

/customers                → Müşteri listesi
/customers/new            → Yeni müşteri
/customers/:id            → Müşteri detayı
/customers/:id/account    → Cari hesap

/suppliers                → Tedarikçi listesi
/suppliers/new            → Yeni tedarikçi
/suppliers/:id            → Tedarikçi detayı
/suppliers/:id/account    → Tedarikçi cari hesabı

/warehouses               → Depo listesi
/warehouses/new           → Yeni depo
/warehouses/:id           → Depo detayı
/warehouses/transfers     → Transfer listesi
/warehouses/transfers/new → Yeni transfer
/warehouses/transfers/:id → Transfer detayı

/accounting               → Muhasebe
/accounting/:accountId    → Hesap detayı

/payments                 → Ödemeler

/returns                  → İade talepleri
/returns/new              → Yeni iade talebi
/returns/:id              → İade detayı

/stores                   → Mağazalar (izinli kullanıcı)
/stores/new               → Yeni mağaza
/stores/:id               → Mağaza detayı

/users                    → Kullanıcı yönetimi
/users/new                → Yeni kullanıcı
/users/:id                → Kullanıcı detayı

/audit                    → Denetim kayıtları

/settings                 → Ayarlar
/profile                  → Kendi profilim
```

### Platform App (`/apps/platform`)

```
/                         → Platform dashboard
/login                    → Admin giriş

/tenants                  → Tenant listesi
/tenants/new              → Yeni tenant
/tenants/:id              → Tenant detayı

/packages                 → Abonelik paketleri
/subscriptions/:tenantId  → Abonelik yönetimi

/billing/invoices         → Faturalar
/billing/payments         → Ödemeler

/impersonation            → Impersonation başlat
/impersonation/history    → Geçmiş

/admins                   → Admin yönetimi
```

---

## 8. Modüller & Sayfalar

Her modül aşağıdaki yapıda implement edilir:

```
features/
  orders/
    ├── components/           # Modüle özgü bileşenler
    │   ├── OrderTable.tsx
    │   ├── OrderCard.tsx
    │   ├── OrderStatusBadge.tsx
    │   └── OrderForm.tsx
    ├── hooks/
    │   ├── useOrders.ts      # list query
    │   ├── useOrder.ts       # detail query
    │   └── useOrderMutations.ts  # create/approve/reject/cancel
    ├── services/
    │   └── order.service.ts  # API çağrıları
    ├── types/
    │   └── order.types.ts    # DTO + domain types
    ├── schemas/
    │   └── order.schema.ts   # Zod validation
    └── index.ts              # public exports
```

---

## 9. Bileşen Mimarisi

### 9.1 Temel Bileşenler (`packages/ui`)

**Button**
```tsx
// Varyantlar: primary | secondary | ghost | danger
// Boyutlar: sm | md | lg
// States: loading, disabled
<Button variant="primary" size="md" loading={isLoading}>
  Kaydet
</Button>
```

**Badge / StatusBadge**
```tsx
// Renk: success | warning | danger | info | neutral
// Sipariş durumları, stok durumu vb.
<StatusBadge status="confirmed" />
```

**DataTable**
```tsx
// Özellikler: sıralama, sayfalama, seçim, skeleton loading
// Responsive: mobilden tablo → kart listesi
<DataTable
  columns={columns}
  data={orders}
  loading={isLoading}
  onRowClick={(row) => navigate(`/orders/${row.id}`)}
/>
```

**PageHeader**
```tsx
// Breadcrumb + başlık + aksiyon butonları
<PageHeader
  title="Siparişler"
  breadcrumbs={[{ label: "Ana Sayfa", href: "/" }, { label: "Siparişler" }]}
  actions={<Button>Yeni Sipariş</Button>}
/>
```

**FilterBar**
```tsx
// Arama + filtre bileşeni
// URL state'e yansır
<FilterBar
  search={{ placeholder: "Sipariş ara..." }}
  filters={[
    { key: "status", label: "Durum", options: ORDER_STATUS_OPTIONS },
    { key: "dateRange", label: "Tarih", type: "dateRange" },
  ]}
/>
```

**StatCard**
```tsx
// Dashboard metrik kartı
<StatCard
  label="Toplam Sipariş"
  value={1240}
  icon="shopping_cart"
  trend={{ value: 12, direction: "up" }}
/>
```

### 9.2 Layout Bileşeni

```tsx
// AppLayout.tsx — tüm korumalı sayfalar bunu kullanır
<AppLayout>
  {/* Sidebar: desktop sabit, mobil drawer */}
  {/* Header: sticky, breadcrumb + user menu */}
  {/* Main: overflow-y-auto, padding */}
  <Outlet />
</AppLayout>
```

**Mobil Sidebar Davranışı:**
- `md:` breakpoint altında → kapalı (off-canvas drawer)
- Hamburger buton ile açılır
- Overlay tıklanınca kapanır
- Route değişince kapanır

---

## 10. Çoklu Dil & RTL Desteği

### 10.1 Desteklenen Diller

| Kod | Dil | Yön | Locale |
|---|---|---|---|
| `tr` | Türkçe | LTR | tr-TR |
| `en` | İngilizce | LTR | en-US |
| `ar` | Arapça | **RTL** | ar-SA |

### 10.2 Kütüphane

```
i18next              → çekirdek çeviri motoru
react-i18next        → React entegrasyonu (useTranslation, Trans)
i18next-browser-languagedetector  → tarayıcı dil tespiti
```

### 10.3 Klasör Yapısı

```
packages/
  i18n/
    src/
      locales/
        tr/
          common.json        # genel: kaydet, iptal, sil, evet, hayır...
          auth.json          # giriş, çıkış, şifre...
          orders.json        # sipariş modülü
          inventory.json     # stok modülü
          products.json      # ürün / katalog
          sales.json         # satış
          purchasing.json    # satın alma
          customers.json     # müşteri / tedarikçi
          warehouse.json     # depo / transfer
          accounting.json    # muhasebe / ödemeler
          users.json         # kullanıcı / rol
          audit.json         # denetim
          errors.json        # hata mesajları
        en/
          (aynı dosyalar)
        ar/
          (aynı dosyalar)
      i18n.ts                # i18next konfigürasyonu
      index.ts               # useTranslation re-export
```

### 10.4 i18next Konfigürasyonu

```ts
// packages/i18n/src/i18n.ts
import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import LanguageDetector from "i18next-browser-languagedetector"

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "tr",
    supportedLngs: ["tr", "en", "ar"],
    defaultNS: "common",
    ns: ["common", "auth", "orders", "inventory", "products",
         "sales", "purchasing", "customers", "warehouse",
         "accounting", "users", "audit", "errors"],

    // Lazy loading: her namespace ayrı yüklenir
    resources: undefined,
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json",
    },

    interpolation: {
      escapeValue: false, // React zaten XSS'e karşı korur
    },

    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "erp-language",
    },
  })

export default i18n
```

### 10.5 Kullanım Kuralları

```tsx
// ✅ Doğru — namespace belirt
const { t } = useTranslation("orders")
<Button>{t("create")}</Button>

// ✅ Değişkenli çeviri
t("stock.remaining", { count: 42, unit: "kg" })
// tr: "Kalan stok: 42 kg"
// en: "Remaining stock: 42 kg"
// ar: "المخزون المتبقي: 42 كغ"

// ✅ Tarih — locale'e göre format
import { format } from "date-fns"
import { tr, enUS, ar } from "date-fns/locale"
const localeMap = { tr, en: enUS, ar }

// ✅ Para — Intl API ile locale'e göre
new Intl.NumberFormat("ar-SA", { style: "currency", currency: "SAR" }).format(1250.50)

// ❌ Yanlış — hardcoded Türkçe metin
<Button>Kaydet</Button>
```

> ⚠️ **Kural:** Tüm kullanıcıya gösterilen metin `t()` ile gelir. Hardcoded string yasaktır.

### 10.6 RTL (Arapça) Desteği

Arapça seçildiğinde **tüm layout** sağdan sola döner. Bu iki mekanizma ile sağlanır:

**1 — `dir` attribute (HTML)**

```tsx
// i18n.ts change listener
i18n.on("languageChanged", (lng) => {
  const dir = lng === "ar" ? "rtl" : "ltr"
  document.documentElement.setAttribute("dir", dir)
  document.documentElement.setAttribute("lang", lng)
})
```

**2 — Tailwind RTL Utility Kuralları**

```tsx
// ❌ Yanlış — yön bağımlı fiziksel property
<div className="pl-4 mr-2 text-left border-l-2">

// ✅ Doğru — mantıksal (logical) property — RTL'de otomatik ters döner
<div className="ps-4 me-2 text-start border-s-2">
```

| Fiziksel (YASAK) | Mantıksal (ZORUNLU) | Anlamı |
|---|---|---|
| `pl-*` | `ps-*` | padding start |
| `pr-*` | `pe-*` | padding end |
| `ml-*` | `ms-*` | margin start |
| `mr-*` | `me-*` | margin end |
| `text-left` | `text-start` | metin hizalama |
| `text-right` | `text-end` | metin hizalama |
| `left-*` | `start-*` | konum |
| `right-*` | `end-*` | konum |
| `border-l-*` | `border-s-*` | kenarlık |
| `rounded-l-*` | `rounded-s-*` | köşe |

> ⚠️ **Kural:** `pl`, `pr`, `ml`, `mr`, `text-left`, `text-right`, `left-*`, `right-*` class'ları yalnızca gerçekten fiziksel konum gereken durumlarda kullanılır (ör: absolute positioned ikonlar). Her yerde mantıksal property tercih edilir.

**3 — İkon yön farkındalığı**

```tsx
// Bazı ikonlar RTL'de mirror edilmeli (ok, chevron gibi)
const ArrowIcon = () => (
  <span
    className="material-symbols-outlined"
    style={{ transform: i18n.dir() === "rtl" ? "scaleX(-1)" : "none" }}
  >
    arrow_forward
  </span>
)
```

**4 — Arapça Font Ek Yüklemesi**

Manrope Arapça karakter desteklemez. Arapça için fallback font eklenir:

```ts
// tailwind.config.ts
fontFamily: {
  display: ["Manrope", "Noto Sans Arabic", "sans-serif"],
}
```

```html
<!-- index.html -->
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;700;800&display=swap" rel="stylesheet" />
```

### 10.7 Dil Seçici Bileşeni

```tsx
// packages/ui/src/components/LanguageSwitcher.tsx
const LANGUAGES = [
  { code: "tr", label: "Türkçe", flag: "🇹🇷" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
]

// Header'a eklenir — dropdown şeklinde
```

### 10.8 Zustand UI Store Güncellemesi

```ts
// ui.store.ts
interface UIStore {
  sidebarOpen: boolean
  theme: "light" | "dark" | "system"
  language: "tr" | "en" | "ar"           // ← YENİ
  dir: "ltr" | "rtl"                      // ← YENİ (hesaplanan)
  toggleSidebar(): void
  setTheme(t: Theme): void
  setLanguage(lang: Language): void       // ← YENİ
}
```

---

## 11. Kod Kuralları

### 11.1 Genel

- **Dil:** TypeScript (strict mode, `noImplicitAny`)
- **Bileşen:** Fonksiyonel component + hooks (class component yok)
- **Stil:** TailwindCSS utility classes; `cn()` helper ile conditional
- **İsimlendirme:** PascalCase (component), camelCase (hook/func/var), UPPER_SNAKE (sabit)

### 11.2 Dosya İsimlendirme

```
ComponentName.tsx      — React bileşeni
useHookName.ts         — custom hook
service.name.ts        — API servisi
name.types.ts          — TypeScript tipleri
name.schema.ts         — Zod schema
name.utils.ts          — yardımcı fonksiyon
```

### 11.3 Import Sırası

```ts
// 1. React
import { useState, useEffect } from "react"

// 2. Üçüncü taraf
import { useQuery } from "@tanstack/react-query"

// 3. Monorepo packages
import { Button, DataTable } from "@erp/ui"
import { orderService } from "@erp/api-client"

// 4. Feature-içi absolute import
import { OrderStatusBadge } from "@/features/orders/components"

// 5. Relative import
import { useOrders } from "./hooks/useOrders"
```

### 11.4 Form Kuralı

```tsx
// React Hook Form + Zod
const schema = z.object({
  quantity: z.number().positive("Miktar pozitif olmalı"),
  warehouseId: z.string().min(1, "Depo seçiniz"),
})

const form = useForm<z.infer<typeof schema>>({
  resolver: zodResolver(schema),
})
```

### 11.5 Mutation Kuralı

```tsx
// Her mutation: loading + error + success toast
const mutation = useMutation({
  mutationFn: orderService.approve,
  onSuccess: () => {
    toast.success("Sipariş onaylandı")
    queryClient.invalidateQueries(orderKeys.all)
  },
  onError: handleApiError,
})
```

### 11.6 Responsive Zorunluluğu

- Tüm sayfalar `md:`, `lg:` breakpoint'lerde test edilir
- Tablo → mobilden kart görünümüne geçer
- Sidebar → mobilden drawer olur
- Form → tek kolon (mobil) → çift kolon (desktop)
- Modal → mobilden tam ekran olur

### 11.7 i18n Kuralı

- Her kullanıcıya gösterilen metin `t("namespace:key")` ile gelir — **hardcoded string yasaktır**
- RTL uyumu: fiziksel Tailwind property'ler (`pl`, `pr`, `ml`, `mr`, `text-left`, `text-right`) **yasak**; mantıksal olanlar (`ps`, `pe`, `ms`, `me`, `text-start`, `text-end`) **zorunlu**
- Tarih formatı: `useLocaleFormat().formatDate(date)` — locale'e göre otomatik
- Para formatı: `useLocaleFormat().formatCurrency(amount, currency)` — locale'e göre otomatik
- Yeni namespace eklenince tüm 3 dil dosyası aynı anda oluşturulur

---

## 12. TODO Listesi

### 🔴 Faz 1 — Temel Altyapı (Sprint 1-2)

#### Monorepo & Araçlar
- [ ] pnpm workspace + Turborepo kurulumu
- [ ] `packages/ui` — boş kütüphane scaffolding
- [ ] `packages/api-client` — boş servis scaffolding
- [ ] `packages/hooks` — boş hooks scaffolding
- [ ] `packages/utils` — `cn`, `currency`, `date` yardımcıları
- [ ] `packages/i18n` — boş i18n paketi scaffolding
- [ ] ESLint + Prettier + Husky + lint-staged konfigürasyonu
- [ ] TypeScript path aliases (`@erp/ui`, `@erp/api-client`, `@erp/i18n`, `@/`)
- [ ] Storybook kurulumu (`packages/ui` için)

#### Design Tokens
- [ ] `tailwind.config.ts` — tüm token'lar tanımlanır
- [ ] CSS variables (`--color-primary` vb.) global stylesheet
- [ ] Dark mode toggle (OS preference + localStorage persist)
- [ ] Custom scrollbar global CSS

#### Çoklu Dil & RTL (i18n)
- [ ] `packages/i18n` — i18next + react-i18next + LanguageDetector kurulumu
- [ ] `i18n.ts` konfigürasyonu — tr/en/ar, fallback: tr
- [ ] `locales/tr/` — tüm namespace JSON dosyaları (common, auth, orders, inventory, products, sales, purchasing, customers, warehouse, accounting, users, audit, errors)
- [ ] `locales/en/` — İngilizce çeviriler
- [ ] `locales/ar/` — Arapça çeviriler
- [ ] RTL: `dir` attribute — dil değişince `document.documentElement.dir` güncellenir
- [ ] RTL: Tailwind mantıksal property kuralı — tüm bileşenlerde `ps/pe/ms/me/text-start/text-end/border-s` kullanımı
- [ ] RTL: Noto Sans Arabic font entegrasyonu (Manrope fallback)
- [ ] RTL: Yön bağımlı ikon mirror helper
- [ ] `LanguageSwitcher` bileşeni (Header'a eklenir)
- [ ] Zustand `ui.store` — `language` + `dir` state
- [ ] `useLocaleFormat` hook — tarih ve para birimini locale'e göre formatlama

#### Temel UI Bileşenleri
- [ ] `Button` — varyantlar, boyutlar, loading state
- [ ] `Input` — text, number, password, textarea
- [ ] `Select` — tek ve çoklu seçim
- [ ] `DatePicker` — tek tarih + tarih aralığı
- [ ] `Badge` / `StatusBadge`
- [ ] `Card`
- [ ] `Modal` / `Dialog` — mobilden tam ekran
- [ ] `Toast` / `Notification` sistemi
- [ ] `Skeleton` loading bileşeni
- [ ] `Pagination`
- [ ] `EmptyState` — veri yok durumu
- [ ] `ErrorBoundary`

#### Layout
- [ ] `AppLayout` — Sidebar + Header + Main
- [ ] `AuthLayout` — login sayfası layout
- [ ] `Sidebar` — desktop sabit, mobil drawer
- [ ] `Header` — sticky, user menu, dark mode toggle
- [ ] `PageHeader` — breadcrumb + başlık + aksiyonlar
- [ ] `DataTable` — responsive (tablo → kart)
- [ ] `FilterBar` — arama + filtre + URL sync
- [ ] `StatCard` — dashboard metrik kartı

---

### 🟡 Faz 2 — Auth & Tenant ERP Çekirdeği (Sprint 3-4)

#### Auth Sistemi
- [ ] Zustand `auth.store.ts`
- [ ] Zustand `ui.store.ts`
- [ ] Axios tenant instance + request/response interceptor
- [ ] Token refresh flow (401 → refresh → retry)
- [ ] `usePermission` hook
- [ ] `PermissionGate` bileşeni
- [ ] `ProtectedRoute` / route guard
- [ ] Login sayfası — Tenant giriş formu
- [ ] `POST /api/v1/auth/login` entegrasyonu
- [ ] `POST /api/v1/auth/refresh` entegrasyonu
- [ ] Logout + temizleme
- [ ] `GET /api/v1/users/{id}/permissions` — permissions fetch

#### Dashboard
- [ ] ERP Ana Dashboard sayfası
- [ ] Sipariş özeti widget
- [ ] Envanter/stok özeti widget
- [ ] Satış özeti widget
- [ ] Düşük stok uyarı widget

---

### 🟠 Faz 3 — Ana ERP Modülleri (Sprint 5-9)

#### Sipariş Modülü (`orders:*`)
- [ ] Siparişler listesi sayfası
- [ ] Sipariş detay sayfası
- [ ] Yeni sipariş oluşturma formu
- [ ] Sipariş onaylama akışı
- [ ] Sipariş reddetme akışı
- [ ] Sipariş iptal etme
- [ ] Sipariş durum güncelleme
- [ ] Sipariş kalem yönetimi (ekleme/iptal)
- [ ] Sipariş şablonları

#### Stok / Envanter Modülü (`inventory:*`)
- [ ] Envanter listesi sayfası
- [ ] Envanter detay + hareketler
- [ ] Stok rezervasyonu oluşturma
- [ ] Stok girişi (replenish)
- [ ] Stok düzeltmesi (sayım)
- [ ] Düşük stok uyarıları sayfası
- [ ] Toplu stok hareketi

#### Ürün / Katalog Modülü (`catalog:*`)
- [ ] Ürün yönetimi listesi
- [ ] Yeni ürün oluşturma
- [ ] Ürün detay & güncelleme
- [ ] Ürün varyantları yönetimi
- [ ] Yeni varyant oluşturma
- [ ] Toplu varyant oluşturma
- [ ] Ürün reçeteleri
- [ ] Ürün maliyet kırılımı
- [ ] Ürün karlılık sıralaması
- [ ] Ürün stok durumu analizi

#### Satış Modülü (`sales:*`)
- [ ] Satışlar listesi
- [ ] Yeni satış oluşturma
- [ ] Satış detay & yönetimi
- [ ] Satışa ödeme ekleme
- [ ] Satış durum güncelleme
- [ ] Fatura oluşturma (satıştan)

#### Satın Alma Modülü (`purchasing:*`)
- [ ] Satın almalar listesi
- [ ] Yeni satın alma siparişi
- [ ] Satın alma detay & yönetimi
- [ ] Satın alma onaylama
- [ ] Mal kabul ekranı
- [ ] Satın alma iptali / geri alma
- [ ] Satın alma kalem güncelleme

#### Müşteri Modülü (`customers:*`)
- [ ] Müşteri listesi
- [ ] Yeni müşteri oluşturma
- [ ] Müşteri detay & güncelleme
- [ ] Müşteri cari hesap detayı
- [ ] Müşteri istatistikleri

#### Tedarikçi Modülü (`customers:*` / `purchasing:*`)
- [ ] Tedarikçi listesi
- [ ] Yeni tedarikçi oluşturma
- [ ] Tedarikçi detay & güncelleme
- [ ] Tedarikçi cari hesap detayı
- [ ] Tedarikçi performans metrikleri
- [ ] Tedarikçiye ait satın almalar

#### Hammadde Modülü (`purchasing:*`)
- [ ] Hammadde yönetimi listesi
- [ ] Yeni hammadde oluşturma
- [ ] Hammadde detay & güncelleme
- [ ] Hammadde stok güncelleme
- [ ] Hammadde stok hareketi ekle
- [ ] Hammadde istatistikleri
- [ ] Kritik hammadde uyarıları
- [ ] Toplu hammadde işlemleri

#### Depo Modülü (`warehouse:*`)
- [ ] Depo yönetimi listesi
- [ ] Yeni depo oluşturma
- [ ] Depo detay & güncelleme
- [ ] Depo istatistikleri
- [ ] Depo transferleri listesi
- [ ] Yeni depo transferi
- [ ] Transfer detay & yönetimi
- [ ] Transfer onaylama
- [ ] Transfer gönder/teslim al
- [ ] Transfer iptali

#### Muhasebe Modülü (`accounting:*`)
- [ ] Cari hesaplar listesi
- [ ] Cari hesap detayı & işlemleri
- [ ] Manuel işlem ekleme
- [ ] Cari hesap ekstresi oluşturma
- [ ] Bakiyeyi yeniden hesapla
- [ ] Cari hesap hareketleri raporu
- [ ] Müşteri cari hesap detayı
- [ ] Tedarikçi cari hesap detayı

#### Ödeme Modülü (`payments:*`)
- [ ] Ödemeler listesi
- [ ] Ödeme detayı

#### İade Modülü
- [ ] İade talepleri listesi
- [ ] Yeni iade talebi
- [ ] İade onay/ret ekranı

---

### 🟢 Faz 4 — Kullanıcı & Mağaza Yönetimi (Sprint 10-11)

#### IAM Modülü (`iam:*`)
- [ ] Kullanıcı yönetimi listesi
- [ ] Yeni kullanıcı oluşturma
- [ ] Kullanıcı detay & güncelleme
- [ ] Kullanıcı aktivite raporu
- [ ] Kullanıcının mağazaları

#### Mağaza Modülü (`warehouse:*`)
- [ ] Mağazalar listesi
- [ ] Yeni mağaza oluşturma
- [ ] Mağaza detay & güncelleme
- [ ] Mağaza istatistikleri

#### Denetim & Raporlama
- [ ] Denetim kayıtları listesi
- [ ] Varlık geçmişi (audit) ekranı
- [ ] Hammadde geçmişi
- [ ] Müşteri geçmişi
- [ ] Eski denetim loglarını temizle
- [ ] Rezervasyon yönetimi

#### Profil & Ayarlar
- [ ] Kendi profilim sayfası
- [ ] ERP genel ayarlar ekranı

---

### 🔵 Faz 5 — Platform Admin Paneli (Sprint 12-13)

#### Auth
- [ ] Platform admin giriş ekranı (`POST /api/v1/platform/auth/login`)
- [ ] Statik admin token yönetimi

#### Tenant Yönetimi
- [ ] Tenant yönetimi listesi
- [ ] Yeni tenant oluşturma
- [ ] Tenant detay & güncelleme
- [ ] Tenant istatistikleri
- [ ] Tenant aktifleştir / askıya al / iptal

#### Impersonation
- [ ] Tenant impersonation başlatma
- [ ] Aktif impersonation durumu / banner
- [ ] Impersonation geçmişi

#### Abonelik & Faturalama
- [ ] Abonelik paketleri yönetimi
- [ ] Abonelik detay & yönetimi
- [ ] Faturalama ekranı

#### Multi-tenant
- [ ] Multi-tenant kullanıcı giriş ekranı (tenant seçimi)

---

### ⚪ Faz 6 — Kalite & Deploy (Sprint 14)

#### Testing
- [ ] Vitest + React Testing Library kurulumu
- [ ] Kritik bileşenler için unit test
- [ ] Auth flow için integration test
- [ ] E2E test kurulumu (Playwright)

#### Performance
- [ ] Bundle analizi (rollup-plugin-visualizer)
- [ ] Code splitting — her route lazy load
- [ ] Image optimizasyon
- [ ] API response caching stratejisi

#### Erişilebilirlik
- [ ] ARIA label'lar tüm etkileşimli elemanlarda
- [ ] Klavye navigasyonu (Tab, Enter, Escape)
- [ ] Screen reader uyumluluğu
- [ ] Focus trap (modal/dialog)
- [ ] Renk kontrast kontrolü (WCAG AA)

#### CI/CD
- [ ] GitHub Actions — lint + test pipeline
- [ ] Preview deploy (Vercel / Netlify)
- [ ] Environment variables yönetimi

---

## Hızlı Referans

### Kullanılan Kütüphaneler

| Kütüphane | Versiyon | Kullanım |
|---|---|---|
| React | 18 | UI framework |
| TypeScript | 5 | Tip güvenliği |
| Vite | 5 | Build tool |
| TailwindCSS | 3.4+ | Styling |
| TanStack Query | 5 | Server state |
| TanStack Router | 1 | Routing |
| Zustand | 4 | Client state |
| React Hook Form | 7 | Form yönetimi |
| Zod | 3 | Validation |
| Axios | 1 | HTTP client |
| Turborepo | latest | Monorepo build |
| pnpm | 8 | Package manager |
| i18next | 23 | Çeviri motoru |
| react-i18next | 14 | React i18n entegrasyonu |
| i18next-browser-languagedetector | 8 | Otomatik dil tespiti |
| Recharts | 2 | Grafikler |
| date-fns | 3 | Tarih işlemleri |
| clsx + tailwind-merge | latest | Conditional classes |
| Sonner | latest | Toast bildirimleri |
| Storybook | 8 | Bileşen dokümantasyonu |

### Ortam Değişkenleri

```env
# apps/tenant/.env
VITE_TENANT_API_URL=http://localhost:8081
VITE_APP_TITLE=Plastik ERP

# apps/platform/.env
VITE_PLATFORM_API_URL=http://localhost:8080
VITE_PLATFORM_ADMIN_TOKEN=...  # sadece platform app
VITE_APP_TITLE=Plastik ERP — Admin
```

---

*Son güncelleme: Haziran 2026*