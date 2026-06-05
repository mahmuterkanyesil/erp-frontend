# Frontend Entegrasyon Rehberi

Bu doküman, Plastik ERP backend'iyle entegrasyon yapacak frontend geliştiricileri için hazırlanmıştır.

---

## İçindekiler

1. [Genel Bakış](#1-genel-bakış)
2. [Kimlik Doğrulama](#2-kimlik-doğrulama)
3. [İstek Formatı](#3-i̇stek-formatı)
4. [Hata Yönetimi](#4-hata-yönetimi)
5. [İzin Sistemi](#5-i̇zin-sistemi)
6. [Tenant API Endpoint'leri](#6-tenant-api-endpointleri)
7. [Platform API Endpoint'leri](#7-platform-api-endpointleri)

---

## 1. Genel Bakış

| | Tenant API | Platform API |
|---|---|---|
| **Amaç** | ERP iş operasyonları (stok, sipariş, satış…) | Tenant yönetimi, abonelik, faturalama |
| **Base URL** | `http://localhost:8081` | `http://localhost:8080` |
| **Auth** | JWT Bearer token | Statik admin token |
| **Rate Limit** | Auth: 10 burst / 20 req/dk · Diğer: sınırsız | 30 burst / 60 req/dk |

---

## 2. Kimlik Doğrulama

### 2.1 Giriş (Login)

```
POST /api/v1/auth/login
```

> `X-Tenant-ID` header'ı bu endpoint dahil **tüm isteklerde** zorunludur.

**İstek:**
```json
{
  "tenant_id": "019e7f8f-537b-7b75-8d51-84c4805bace9",
  "email": "user@example.com",
  "password": "secret"
}
```

> `tenant_id` hem header (`X-Tenant-ID`) hem de body'de UUID olarak gönderilmelidir.

**Yanıt (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

---

## 3. İstek Formatı

Tüm isteklerde şu header'lar zorunludur:

```
Content-Type: application/json
X-Tenant-ID: <tenant-uuid>
Authorization: Bearer <access_token>   (auth endpoint hariç)
```

- Tarih/saat alanları: **RFC3339** formatı (`"2024-01-15T09:00:00Z"`)
- Para miktarı alanları: **string** olarak decimal (`"1250.00"`) — Katalog varyant fiyatı hariç
- Katalog varyant `price_amount`: **float64** (`1250.00`)

---

## 4. Hata Yönetimi

**Hata yanıt formatı:**
```json
{
  "error": "hata açıklaması"
}
```

| HTTP Kodu | Anlam |
|-----------|-------|
| `400` | Geçersiz istek / validasyon hatası |
| `401` | Token eksik veya geçersiz |
| `403` | Yetki yetersiz |
| `404` | Kaynak bulunamadı |
| `409` | Çakışma (duplicate vb.) |
| `422` | İş kuralı ihlali |
| `500` | Sunucu hatası |

---

## 5. İzin Sistemi

İzinler `"MODULE:ACTION"` formatındadır (büyük harf):

```json
["INVENTORY:VIEW", "INVENTORY:MANAGE", "ORDER:VIEW", "ORDER:MANAGE"]
```

---

## 6. Tenant API Endpoint'leri

### 6.1 IAM — Kullanıcı ve Rol Yönetimi

#### Kullanıcı Listesi

```
GET /api/v1/iam/users
```

**Yanıt (200):**
```json
[
  {
    "id": "uuid",
    "tenant_id": "uuid",
    "email": "user@example.com",
    "first_name": "Ali",
    "last_name": "Yılmaz",
    "role_id": "uuid",
    "status": "active",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

#### Kullanıcı Oluştur

```
POST /api/v1/iam/users
```

**İstek:**
```json
{
  "email": "user@example.com",
  "password": "secret123",
  "first_name": "Ali",
  "last_name": "Yılmaz",
  "role_id": "uuid"
}
```

**Yanıt (201):**
```json
{ "id": "uuid" }
```

#### Kullanıcı Detay

```
GET /api/v1/iam/users/{id}
```

**Yanıt (200):** Tek kullanıcı nesnesi (yukarıdaki format)

#### Kullanıcı Güncelle

```
PUT /api/v1/iam/users/{id}
```

**İstek:**
```json
{
  "first_name": "Ali",
  "last_name": "Yılmaz",
  "role_id": "uuid"
}
```

**Yanıt (204):** Gövde yok

#### Kullanıcı Kilitle

```
POST /api/v1/iam/users/{id}/lock
```

**İstek:**
```json
{ "reason": "Şüpheli giriş denemesi" }
```

**Yanıt (204):** Gövde yok

#### Kullanıcı Kilidi Aç

```
POST /api/v1/iam/users/{id}/unlock
```

**İstek:** Gövde yok

**Yanıt (204):** Gövde yok

#### Şifre Değiştir

```
POST /api/v1/iam/users/{id}/change-password
```

**İstek:**
```json
{
  "old_password": "eskiSifre",
  "new_password": "yeniSifre123"
}
```

**Yanıt (204):** Gövde yok

---

#### Rol Listesi

```
GET /api/v1/iam/roles
```

**Yanıt (200):**
```json
[
  {
    "id": "uuid",
    "tenant_id": "uuid",
    "name": "Satış Temsilcisi",
    "permissions": ["ORDER:VIEW", "ORDER:MANAGE"],
    "is_system": false,
    "status": "active"
  }
]
```

#### Rol Oluştur

```
POST /api/v1/iam/roles
```

**İstek:**
```json
{
  "name": "Depo Görevlisi",
  "permissions": ["INVENTORY:VIEW", "INVENTORY:MANAGE"]
}
```

**Yanıt (201):**
```json
{ "id": "uuid" }
```

#### Rol Detay

```
GET /api/v1/iam/roles/{id}
```

**Yanıt (200):** Tek rol nesnesi (yukarıdaki format)

#### Rol Güncelle

```
PUT /api/v1/iam/roles/{id}
```

**İstek:**
```json
{
  "name": "Güncellenmiş Ad",
  "permissions": ["INVENTORY:VIEW"]
}
```

**Yanıt (204):** Gövde yok

---

### 6.2 Envanter (Inventory)

#### Stok Listesi

```
GET /api/v1/inventory/stocks
```

**Yanıt (200):**
```json
[
  {
    "id": "uuid",
    "tenant_id": "uuid",
    "product_id": "uuid",
    "warehouse_id": "uuid",
    "total": { "value": "100.00", "unit": "KG" },
    "reserved": { "value": "20.00", "unit": "KG" },
    "available": { "value": "80.00", "unit": "KG" },
    "threshold": { "value": "10.00", "unit": "KG" }
  }
]
```

#### Stok Detay

```
GET /api/v1/inventory/stocks/{id}
```

**Yanıt (200):** Tek stok nesnesi (yukarıdaki format)

#### Ürün + Depo'ya Göre Stok

```
GET /api/v1/inventory/stocks/by-product?product_id={uuid}&warehouse_id={uuid}
```

**Yanıt (200):** Tek stok nesnesi

#### Stok İkmal (Replenish)

```
POST /api/v1/inventory/stocks/{id}/replenish
```

**İstek:**
```json
{
  "quantity": "50.00",
  "unit": "KG",
  "reason": "Tedarikçi teslimatı"
}
```

**Yanıt (204):** Gövde yok

#### Stok Rezerve Et

```
POST /api/v1/inventory/stocks/{id}/reserve
```

**İstek:**
```json
{
  "quantity": "10.00",
  "unit": "KG",
  "reason": "Sipariş #12345"
}
```

**Yanıt (201):**
```json
{ "reservation_id": "uuid" }
```

#### Rezervasyon Serbest Bırak

```
POST /api/v1/inventory/stocks/release
```

**İstek:**
```json
{
  "product_id": "uuid",
  "warehouse_id": "uuid",
  "reservation_id": "uuid"
}
```

**Yanıt (204):** Gövde yok

#### Rezervasyon Tamamla (Commit)

```
POST /api/v1/inventory/stocks/commit
```

**İstek:**
```json
{
  "product_id": "uuid",
  "warehouse_id": "uuid",
  "reservation_id": "uuid"
}
```

**Yanıt (204):** Gövde yok

#### Stok Hareketi Listesi

```
GET /api/v1/inventory/stocks/{id}/movements
```

**Yanıt (200):**
```json
[
  {
    "id": "uuid",
    "type": "REPLENISH",
    "quantity": { "value": "50.00", "unit": "KG" },
    "reason": "Tedarikçi teslimatı",
    "occurred_at": "2024-01-15T09:00:00Z"
  }
]
```

---

### 6.3 Siparişler (Orders)

> **Önemli:** Order BC tüm alanları **camelCase** kullanır.

#### Sipariş Listesi

```
GET /api/v1/orders
```

Query parametreleri: `?status=DRAFT`, `?customer_id={uuid}`

**Yanıt (200):**
```json
[
  {
    "id": "uuid",
    "tenantId": "uuid",
    "customerId": "uuid",
    "warehouseId": "uuid",
    "status": "DRAFT",
    "requestedDate": "2024-02-01T00:00:00Z",
    "notes": "Özel not",
    "createdAt": "2024-01-15T09:00:00Z"
  }
]
```

#### Sipariş Oluştur

```
POST /api/v1/orders
```

**İstek:**
```json
{
  "customerId": "uuid",
  "warehouseId": "uuid",
  "requestedDate": "2024-02-01T00:00:00Z",
  "notes": "Özel not"
}
```

**Yanıt (201):**
```json
{ "id": "uuid" }
```

#### Sipariş Detay

```
GET /api/v1/orders/{id}
```

**Yanıt (200):**
```json
{
  "id": "uuid",
  "tenantId": "uuid",
  "customerId": "uuid",
  "customerName": "ABC Ltd.",
  "warehouseId": "uuid",
  "warehouseName": "Ana Depo",
  "status": "CONFIRMED",
  "requestedDate": "2024-02-01T00:00:00Z",
  "notes": "...",
  "lines": [
    {
      "id": "uuid",
      "productId": "uuid",
      "productName": "Ürün Adı",
      "variantId": "uuid",
      "quantity": "10.00",
      "unit": "KG",
      "unitPriceAmount": "150.00",
      "unitPriceCurrency": "TRY",
      "discountRate": "0.05",
      "vatRate": "0.20",
      "vatIncluded": false
    }
  ],
  "shippingAddress": {
    "street": "Cadde No:1",
    "district": "Kadıköy",
    "city": "İstanbul",
    "postalCode": "34700",
    "country": "TR"
  },
  "createdAt": "2024-01-15T09:00:00Z"
}
```

#### Sipariş Satırı Ekle

```
POST /api/v1/orders/{id}/lines
```

**İstek:**
```json
{
  "productId": "uuid",
  "variantId": "uuid",
  "quantity": "10.00",
  "unit": "KG",
  "unitPriceAmount": "150.00",
  "unitPriceCurrency": "TRY",
  "discountRate": "0.05",
  "vatRate": "0.20",
  "vatIncluded": false,
  "contractPrice": "145.00",
  "contractCurrency": "TRY"
}
```

> `variantId`, `contractPrice`, `contractCurrency` opsiyoneldir.

**Yanıt (204):** Gövde yok

#### Sipariş Satırı Kaldır

```
DELETE /api/v1/orders/{id}/lines/{lineId}
```

**Yanıt (204):** Gövde yok

#### Sipariş Onayla

```
POST /api/v1/orders/{id}/confirm
```

**İstek:** Gövde yok

**Yanıt (204):** Gövde yok

#### Sipariş İptal Et

```
POST /api/v1/orders/{id}/cancel
```

**İstek:**
```json
{ "reason": "Müşteri isteği üzerine iptal" }
```

**Yanıt (204):** Gövde yok

#### Teslimat Adresi Güncelle

```
PUT /api/v1/orders/{id}/shipping-address
```

**İstek:**
```json
{
  "street": "Yeni Cadde No:5",
  "district": "Beşiktaş",
  "city": "İstanbul",
  "postalCode": "34353",
  "country": "TR"
}
```

**Yanıt (204):** Gövde yok

#### Talep Tarihi Güncelle

```
PUT /api/v1/orders/{id}/requested-date
```

**İstek:**
```json
{
  "requestedDate": "2024-03-01T00:00:00Z",
  "reason": "Üretim gecikmesi"
}
```

**Yanıt (204):** Gövde yok

#### Siparişi Böl

```
POST /api/v1/orders/{id}/split
```

**İstek:**
```json
{
  "lineIds": ["uuid1", "uuid2"]
}
```

**Yanıt (201):**
```json
{ "newOrderId": "uuid" }
```

#### Stoktan Karşıla

```
POST /api/v1/orders/{id}/lines/{lineId}/fulfill/stock
```

**İstek:**
```json
{
  "reservationId": "uuid",
  "quantity": "10.00",
  "unit": "KG"
}
```

**Yanıt (204):** Gövde yok

#### Üretimden Karşıla

```
POST /api/v1/orders/{id}/lines/{lineId}/fulfill/production
```

**İstek:**
```json
{
  "productionOrderId": "uuid",
  "quantity": "10.00",
  "unit": "KG"
}
```

**Yanıt (204):** Gövde yok

#### İkame Talebi Oluştur

```
POST /api/v1/orders/{id}/lines/{lineId}/substitution-request
```

**İstek:**
```json
{ "substituteId": "uuid" }
```

**Yanıt (204):** Gövde yok

#### İkame Onayla

```
POST /api/v1/orders/{id}/lines/{lineId}/approve-substitution
```

**İstek:**
```json
{
  "newUnitPriceAmount": "140.00",
  "newUnitPriceCurrency": "TRY",
  "newDiscountRate": "0.05",
  "newVatRate": "0.20",
  "newVatIncluded": false
}
```

**Yanıt (204):** Gövde yok

#### İkame Reddet

```
POST /api/v1/orders/{id}/lines/{lineId}/reject-substitution
```

**İstek:** Gövde yok

**Yanıt (204):** Gövde yok

---

### 6.4 Katalog (Catalog)

#### Ürün Oluştur

```
POST /api/v1/catalog/products
```

**İstek:**
```json
{
  "code": "URN-001",
  "name": "Plastik Kova",
  "category_id": "uuid",
  "unit": "ADET",
  "description": "5 lt plastik kova"
}
```

**Yanıt (201):** Gövde yok

#### Ürün Listesi

```
GET /api/v1/catalog/products
```

**Yanıt (200):**
```json
[
  {
    "id": "uuid",
    "tenant_id": "uuid",
    "code": "URN-001",
    "name": "Plastik Kova",
    "category_id": "uuid",
    "unit": "ADET",
    "description": "...",
    "status": "active"
  }
]
```

#### Ürün Detay

```
GET /api/v1/catalog/products/{id}
```

**Yanıt (200):** Tek ürün nesnesi

#### Ürün Güncelle

```
PUT /api/v1/catalog/products/{id}
```

**İstek:** Oluşturma ile aynı format

**Yanıt (204):** Gövde yok

#### Ürün Arşivle

```
POST /api/v1/catalog/products/{id}/archive
```

**İstek:** Gövde yok

**Yanıt (204):** Gövde yok

---

#### Varyant Ekle

```
POST /api/v1/catalog/products/{id}/variants
```

**İstek:**
```json
{
  "sku": "URN-001-MAVI",
  "color_group_id": "uuid",
  "attributes": { "renk": "mavi", "boyut": "5lt" },
  "price_amount": 125.50,
  "price_currency": "TRY"
}
```

> `price_amount` **float64** sayısal değerdir (string değil).

**Yanıt (201):**
```json
{ "id": "uuid" }
```

#### Varyant Listesi

```
GET /api/v1/catalog/products/{id}/variants
```

**Yanıt (200):**
```json
[
  {
    "id": "uuid",
    "product_id": "uuid",
    "sku": "URN-001-MAVI",
    "color_group_id": "uuid",
    "attributes": { "renk": "mavi" },
    "price_amount": 125.50,
    "price_currency": "TRY",
    "status": "active"
  }
]
```

---

#### Reçete Ekle / Güncelle

```
PUT /api/v1/catalog/products/{id}/recipe
```

**İstek:**
```json
{
  "recipe_id": "uuid",
  "variant_id": "uuid",
  "ingredients": [
    {
      "material_id": "uuid",
      "material_type": "RAW",
      "qty_value": "2.50",
      "qty_unit": "KG",
      "ratio": "0.25"
    }
  ],
  "valid_from": "2024-01-01T00:00:00Z",
  "valid_until": "2024-12-31T23:59:59Z"
}
```

> `variant_id` ve `valid_until` opsiyoneldir.

**Yanıt (204):** Gövde yok

#### Reçete Detay

```
GET /api/v1/catalog/products/{id}/recipe
```

**Yanıt (200):** Reçete nesnesi

---

#### Renk Grubu Oluştur

```
POST /api/v1/catalog/color-groups
```

**İstek:**
```json
{ "name": "Mavi Tonları", "code": "MAVI" }
```

**Yanıt (201):**
```json
{ "id": "uuid" }
```

#### Renk Grubu Listesi

```
GET /api/v1/catalog/color-groups
```

**Yanıt (200):**
```json
[
  {
    "id": "uuid",
    "tenant_id": "uuid",
    "name": "Mavi Tonları",
    "code": "MAVI",
    "status": "active"
  }
]
```

---

#### Kategori Oluştur

```
POST /api/v1/catalog/categories
```

**İstek:**
```json
{
  "parent_id": "uuid",
  "name": "Kaplar",
  "level": 1,
  "sort_order": 1
}
```

> `parent_id` opsiyoneldir (kök kategori için).

**Yanıt (201):**
```json
{ "id": "uuid" }
```

#### Kategori Listesi

```
GET /api/v1/catalog/categories
```

**Yanıt (200):**
```json
[
  {
    "id": "uuid",
    "parent_id": "uuid",
    "name": "Kaplar",
    "level": 1,
    "sort_order": 1
  }
]
```

---

#### Fiyat Kuralı Oluştur

```
POST /api/v1/catalog/price-rules
```

**İstek:**
```json
{
  "customer_id": "uuid",
  "product_id": "uuid",
  "variant_id": "uuid",
  "rule_type": "DISCOUNT_RATE",
  "value": "0.10",
  "currency": "TRY",
  "valid_from": "2024-01-01T00:00:00Z",
  "valid_until": "2024-12-31T23:59:59Z"
}
```

> `product_id`, `variant_id`, `valid_until` opsiyoneldir.

**Yanıt (201):**
```json
{ "id": "uuid" }
```

#### Fiyat Kuralı Listesi

```
GET /api/v1/catalog/price-rules
```

Query parametresi: `?customer_id={uuid}`

**Yanıt (200):** Fiyat kuralı dizisi

---

### 6.5 Müşteri (Customer)

#### Ortak (Partner) Oluştur

```
POST /api/v1/customers/partners
```

**İstek:**
```json
{
  "partner_type": "COMPANY",
  "tax_number": "1234567890",
  "tax_office": "Kadıköy",
  "company_name": "ABC Ltd.",
  "first_name": "",
  "last_name": "",
  "email": "info@abc.com",
  "phone": "+90 555 000 0000"
}
```

**Yanıt (201):**
```json
{ "id": "uuid" }
```

#### Ortak Listesi

```
GET /api/v1/customers/partners
```

Query parametreleri: `?name=ABC`, `?city=İstanbul`, `?role=CUSTOMER`, `?status=active`

**Yanıt (200):**
```json
[
  {
    "id": "uuid",
    "tenant_id": "uuid",
    "partner_type": "COMPANY",
    "tax_number": "1234567890",
    "tax_office": "Kadıköy",
    "company_name": "ABC Ltd.",
    "first_name": "",
    "last_name": "",
    "email": "info@abc.com",
    "phone": "+90 555 000 0000",
    "status": "active"
  }
]
```

#### Ortak Detay

```
GET /api/v1/customers/partners/{id}
```

**Yanıt (200):** Tek ortak nesnesi

#### Ortak Güncelle

```
PUT /api/v1/customers/partners/{id}
```

**İstek:** Oluşturma ile aynı format

**Yanıt (204):** Gövde yok

---

#### Müşteri Rolü Ekle

```
POST /api/v1/customers/partners/{id}/roles/customer
```

**İstek:**
```json
{
  "credit_amount": "50000.00",
  "credit_currency": "TRY",
  "payment_term_days": 30,
  "discount_rate": "0.05",
  "segment": "A",
  "assigned_rep_id": "uuid"
}
```

**Yanıt (204):** Gövde yok

#### Tedarikçi Rolü Ekle

```
POST /api/v1/customers/partners/{id}/roles/supplier
```

**İstek:**
```json
{
  "payment_term_days": 30,
  "lead_time_days": 7,
  "currency": "TRY"
}
```

> Tedarikçi rolünde `discount_rate` yoktur.

**Yanıt (204):** Gövde yok

---

#### Adres Ekle

```
POST /api/v1/customers/partners/{id}/addresses
```

**İstek:**
```json
{
  "label": "Merkez Ofis",
  "street": "Atatürk Cad. No:10",
  "district": "Kadıköy",
  "city": "İstanbul",
  "postal_code": "34700",
  "country": "TR"
}
```

**Yanıt (201):**
```json
{ "id": "uuid" }
```

#### Adres Listesi

```
GET /api/v1/customers/partners/{id}/addresses
```

**Yanıt (200):**
```json
[
  {
    "id": "uuid",
    "label": "Merkez Ofis",
    "street": "Atatürk Cad. No:10",
    "district": "Kadıköy",
    "city": "İstanbul",
    "postal_code": "34700",
    "country": "TR",
    "is_default": true
  }
]
```

#### Varsayılan Adres Güncelle

```
PUT /api/v1/customers/partners/{id}/addresses/default
```

**İstek:**
```json
{ "address_id": "uuid" }
```

**Yanıt (204):** Gövde yok

---

#### Kredi Limiti Güncelle

```
PUT /api/v1/customers/partners/{id}/roles/customer/credit-limit
```

**İstek:**
```json
{
  "amount": "75000.00",
  "currency": "TRY"
}
```

**Yanıt (204):** Gövde yok

---

### 6.6 Satın Alma (Purchasing)

#### Satın Alma Siparişi Oluştur

```
POST /api/v1/purchasing/orders
```

**İstek:**
```json
{
  "supplier_id": "uuid",
  "warehouse_id": "uuid",
  "source": "MANUAL",
  "source_ref": "ÜR-2024-001",
  "expected_date": "2024-02-15T00:00:00Z",
  "notes": "Acil teslimat"
}
```

> `source_ref` ve `notes` opsiyoneldir.

**Yanıt (201):**
```json
{ "id": "uuid" }
```

#### Satın Alma Siparişi Listesi

```
GET /api/v1/purchasing/orders
```

Query parametreleri: `?status=OPEN`, `?supplier_id={uuid}`

**Yanıt (200):**
```json
[
  {
    "id": "uuid",
    "tenant_id": "uuid",
    "status": "OPEN",
    "source": "MANUAL",
    "source_ref": "ÜR-2024-001",
    "expected_at": "2024-02-15T00:00:00Z",
    "notes": "Acil teslimat",
    "supplier_id": "uuid",
    "supplier_name": "XYZ Tedarik",
    "warehouse_id": "uuid",
    "warehouse_name": "Ana Depo",
    "warehouse_code": "AD-01"
  }
]
```

#### Satın Alma Siparişi Detay

```
GET /api/v1/purchasing/orders/{id}
```

**Yanıt (200):**
```json
{
  "id": "uuid",
  "tenant_id": "uuid",
  "status": "OPEN",
  "source": "MANUAL",
  "source_ref": "ÜR-2024-001",
  "expected_at": "2024-02-15T00:00:00Z",
  "notes": "...",
  "supplier_id": "uuid",
  "supplier_name": "XYZ Tedarik",
  "warehouse_id": "uuid",
  "warehouse_name": "Ana Depo",
  "warehouse_code": "AD-01",
  "lines": [
    {
      "id": "uuid",
      "material_id": "uuid",
      "material_name": "Hammadde Adı",
      "material_code": "HM-001",
      "ordered_qty_value": "100.00",
      "ordered_qty_unit": "KG",
      "received_qty_value": "50.00",
      "unit_price_amount": "25.00",
      "unit_price_currency": "TRY",
      "status": "PARTIAL"
    }
  ]
}
```

#### Satır Ekle

```
POST /api/v1/purchasing/orders/{id}/lines
```

**İstek:**
```json
{
  "material_id": "uuid",
  "quantity": "100.00",
  "unit": "KG",
  "unit_price_amount": "25.00",
  "unit_price_currency": "TRY"
}
```

**Yanıt (204):** Gövde yok

#### Satır Güncelle

```
PATCH /api/v1/purchasing/orders/{id}/lines/{line_id}
```

**İstek:**
```json
{
  "quantity": "150.00",
  "unit": "KG",
  "unit_price_amount": "24.00",
  "unit_price_currency": "TRY"
}
```

**Yanıt (204):** Gövde yok

#### Satır Sil

```
DELETE /api/v1/purchasing/orders/{id}/lines/{line_id}
```

**Yanıt (204):** Gövde yok

#### Siparişi Onayla

```
POST /api/v1/purchasing/orders/{id}/approve
```

**İstek:** Gövde yok

**Yanıt (204):** Gövde yok

#### Siparişi İptal Et

```
POST /api/v1/purchasing/orders/{id}/cancel
```

**İstek:** Gövde yok

**Yanıt (204):** Gövde yok

---

#### Mal Kabul Kaydı

```
POST /api/v1/purchasing/orders/{id}/receipts
```

**İstek:**
```json
{
  "lines": [
    {
      "order_line_id": "uuid",
      "material_id": "uuid",
      "quantity": "50.00",
      "unit": "KG"
    }
  ],
  "notes": "Kısmi teslimat"
}
```

**Yanıt (204):** Gövde yok

#### Mal İadesi Kaydı

```
POST /api/v1/purchasing/orders/{id}/returns
```

**İstek:**
```json
{
  "lines": [
    {
      "material_id": "uuid",
      "quantity": "10.00",
      "unit": "KG",
      "unit_price_amount": "25.00",
      "unit_price_currency": "TRY"
    }
  ],
  "reason": "Hasarlı ürün"
}
```

**Yanıt (201):**
```json
{ "id": "uuid" }
```

#### Fatura Bilgisi Ekle

```
PUT /api/v1/purchasing/orders/{id}/receipts/{receipt_id}/invoice
```

**İstek:**
```json
{
  "invoice_number": "INV-2024-0042",
  "invoice_pdf_url": "https://..."
}
```

**Yanıt (204):** Gövde yok

---

#### Hammadde Oluştur

```
POST /api/v1/purchasing/materials
```

**İstek:**
```json
{
  "code": "HM-001",
  "name": "Polipropilen",
  "material_type": "POLYMER",
  "unit": "KG",
  "min_order_qty": "500.00",
  "min_order_qty_unit": "KG",
  "lead_time_days": 7
}
```

**Yanıt (201):**
```json
{ "id": "uuid" }
```

#### Hammadde Listesi

```
GET /api/v1/purchasing/materials
```

Query parametresi: `?type=POLYMER`

**Yanıt (200):**
```json
[
  {
    "id": "uuid",
    "tenant_id": "uuid",
    "code": "HM-001",
    "name": "Polipropilen",
    "material_type": "POLYMER",
    "unit": "KG",
    "min_order_qty": "500.00",
    "lead_time_days": 7,
    "status": "active",
    "supplier_id": "uuid"
  }
]
```

#### Hammadde Detay

```
GET /api/v1/purchasing/materials/{id}
```

**Yanıt (200):** Tek hammadde nesnesi

#### Hammadde Toplu Oluştur

```
POST /api/v1/purchasing/materials/bulk
```

**İstek:**
```json
{
  "materials": [
    {
      "code": "HM-001",
      "name": "Polipropilen",
      "material_type": "POLYMER",
      "unit": "KG",
      "min_order_qty": "500.00",
      "min_order_qty_unit": "KG",
      "lead_time_days": 7
    }
  ]
}
```

**Yanıt (207):**
```json
{
  "results": [
    { "code": "HM-001", "id": "uuid", "error": null },
    { "code": "HM-002", "id": null, "error": "duplicate code" }
  ]
}
```

#### Hammadde Stok İkmal

```
POST /api/v1/purchasing/materials/{id}/stock/replenish
```

**İstek:**
```json
{
  "warehouse_id": "uuid",
  "quantity": "500.00",
  "unit": "KG",
  "reason": "Satın alma siparişi"
}
```

**Yanıt (204):** Gövde yok

#### Hammadde Stok Düzelt

```
POST /api/v1/purchasing/materials/{id}/stock/adjust
```

**İstek:**
```json
{
  "warehouse_id": "uuid",
  "delta": "-10.00",
  "unit": "KG",
  "reason": "Fire kaydı"
}
```

**Yanıt (204):** Gövde yok

#### Hammadde İstatistikleri

```
GET /api/v1/purchasing/materials/{id}/stats
```

**Yanıt (200):**
```json
{
  "material_id": "uuid",
  "material_name": "Polipropilen",
  "unit": "KG",
  "stock_total": "1000.00",
  "stock_reserved": "200.00",
  "stock_available": "800.00",
  "open_orders_count": 3,
  "total_ordered_qty": "2000.00",
  "total_received_qty": "1500.00"
}
```

---

### 6.7 Muhasebe (Accounting)

#### Hesap Aç

```
POST /api/v1/accounting/accounts
```

**İstek:**
```json
{
  "partner_id": "uuid",
  "account_type": "RECEIVABLE"
}
```

> `account_type`: `"RECEIVABLE"` veya `"PAYABLE"`

**Yanıt (201):**
```json
{ "id": "uuid" }
```

#### Hesap Detay

```
GET /api/v1/accounting/accounts
```

Query parametresi: `?partner_id={uuid}`

**Yanıt (200):**
```json
{
  "id": "uuid",
  "tenant_id": "uuid",
  "partner_id": "uuid",
  "account_type": "RECEIVABLE",
  "status": "active",
  "created_at": "2024-01-01T00:00:00Z",
  "balances": [
    {
      "currency": "TRY",
      "total_debit": "50000.00",
      "total_credit": "30000.00",
      "net_balance": "20000.00"
    }
  ]
}
```

#### Borç Kaydı

```
POST /api/v1/accounting/accounts/{id}/debit
```

**İstek:**
```json
{
  "currency": "TRY",
  "amount": "5000.00",
  "source": "INVOICE",
  "source_id": "uuid",
  "description": "Fatura ödemesi",
  "due_date": "2024-02-15T00:00:00Z"
}
```

> `due_date` opsiyoneldir.

**Yanıt (204):** Gövde yok

#### Alacak Kaydı

```
POST /api/v1/accounting/accounts/{id}/credit
```

**İstek:**
```json
{
  "currency": "TRY",
  "amount": "5000.00",
  "source": "PAYMENT",
  "source_id": "uuid",
  "description": "Ödeme alındı"
}
```

**Yanıt (204):** Gövde yok

#### Ödendi İşaretle

```
POST /api/v1/accounting/accounts/{id}/transactions/{txId}/mark-paid
```

**İstek:** Boş nesne `{}`

**Yanıt (204):** Gövde yok

#### Hesap Dondur

```
POST /api/v1/accounting/accounts/{id}/freeze
```

**İstek:**
```json
{ "reason": "Tahsilat sorunu" }
```

**Yanıt (204):** Gövde yok

#### İşlem Listesi

```
GET /api/v1/accounting/accounts/{id}/transactions
```

**Yanıt (200):**
```json
[
  {
    "id": "uuid",
    "currency": "TRY",
    "amount": "5000.00",
    "type": "DEBIT",
    "source": "INVOICE",
    "source_id": "uuid",
    "description": "Fatura ödemesi",
    "is_paid": false,
    "due_date": "2024-02-15T00:00:00Z",
    "occurred_at": "2024-01-15T09:00:00Z"
  }
]
```

#### Yaşlandırma Raporu

```
GET /api/v1/accounting/accounts/{id}/aging
```

Query parametresi: `?currency=TRY`

**Yanıt (200):**
```json
{
  "days_30": "10000.00",
  "days_60": "5000.00",
  "days_90": "2000.00",
  "over_90": "1000.00"
}
```

#### Bakiye Özeti

```
GET /api/v1/accounting/accounts/{id}/balance
```

**Yanıt (200):**
```json
[
  {
    "currency": "TRY",
    "total_debit": "50000.00",
    "total_credit": "30000.00",
    "net_balance": "20000.00"
  }
]
```

---

### 6.8 Ödemeler (Payments)

#### Ödeme Kaydet

```
POST /api/v1/payments
```

**İstek:**
```json
{
  "partner_id": "uuid",
  "direction": "INBOUND",
  "method": "BANK_TRANSFER",
  "currency": "TRY",
  "amount": "5000.00",
  "description": "Fatura ödemesi",
  "received_at": "2024-01-15T09:00:00Z",
  "check_branch": "Kadıköy",
  "check_account": "123456",
  "note_number": "SN-001",
  "note_due_date": "2024-03-01T00:00:00Z",
  "note_issuer": "ABC Ltd."
}
```

> `check_branch`, `check_account`, `note_number`, `note_due_date`, `note_issuer` opsiyoneldir (çek/senet ödemeleri için).
> `received_at` zorunludur (RFC3339).

**Yanıt (201):**
```json
{ "id": "uuid" }
```

#### Ödeme Listesi

```
GET /api/v1/payments
```

Query parametresi: `?partner_id={uuid}`

**Yanıt (200):**
```json
[
  {
    "id": "uuid",
    "tenant_id": "uuid",
    "partner_id": "uuid",
    "direction": "INBOUND",
    "method": "BANK_TRANSFER",
    "currency": "TRY",
    "amount": "5000.00",
    "remaining": "5000.00",
    "status": "PENDING",
    "description": "Fatura ödemesi",
    "received_at": "2024-01-15T09:00:00Z",
    "cleared_at": null,
    "allocations": [
      {
        "id": "uuid",
        "transaction_id": "uuid",
        "amount": "2000.00",
        "allocated_at": "2024-01-16T10:00:00Z"
      }
    ]
  }
]
```

#### Ödeme Detay

```
GET /api/v1/payments/{id}
```

**Yanıt (200):** Tek ödeme nesnesi

#### Ödeme Tahsis Et

```
POST /api/v1/payments/{id}/allocate
```

**İstek:**
```json
{
  "transaction_id": "uuid",
  "amount": "2000.00"
}
```

**Yanıt (204):** Gövde yok

#### Ödeme Onayla

```
POST /api/v1/payments/{id}/confirm
```

**İstek:** Gövde yok

**Yanıt (204):** Gövde yok

---

### 6.9 Satış (Sales)

#### Direkt Satış Oluştur

```
POST /api/v1/sales
```

**İstek:**
```json
{
  "store_id": "uuid",
  "customer_id": "uuid",
  "cash_register_id": "uuid",
  "lines": [
    {
      "product_id": "uuid",
      "variant_id": "uuid",
      "quantity": "2.00",
      "unit": "ADET",
      "unit_price": "150.00",
      "currency": "TRY"
    }
  ],
  "payments": [
    {
      "method": "CASH",
      "amount": "300.00",
      "currency": "TRY"
    }
  ]
}
```

> `customer_id`, `cash_register_id`, `variant_id` opsiyoneldir.
> Satır fiyatı `unit_price` (string) şeklindedir.

**Yanıt (201):**
```json
{ "id": "uuid" }
```

#### Siparişe Bağlı Satış Oluştur

```
POST /api/v1/sales/from-order
```

**İstek:**
```json
{
  "store_id": "uuid",
  "order_id": "uuid",
  "shipment_id": "uuid",
  "payment": {
    "method": "BANK_TRANSFER",
    "amount": "1500.00",
    "currency": "TRY"
  }
}
```

> `payment` tek nesne olarak verilir (dizi değil).

**Yanıt (201):**
```json
{ "id": "uuid" }
```

#### İade Oluştur

```
POST /api/v1/sales/{id}/return
```

**İstek:**
```json
{
  "lines": [
    {
      "sale_line_id": "uuid",
      "quantity": "1.00",
      "unit": "ADET"
    }
  ],
  "refund_method": "CASH",
  "reason": "Ürün kusurlu"
}
```

**Yanıt (201):**
```json
{ "id": "uuid" }
```

#### Satış Listesi

```
GET /api/v1/sales
```

Query parametreleri: `?store_id={uuid}` VEYA `?customer_id={uuid}` (biri zorunlu)

Ek filtreler (store_id ile): `?from=2024-01-01T00:00:00Z&to=2024-01-31T23:59:59Z`

**Yanıt (200):**
```json
[
  {
    "id": "uuid",
    "tenant_id": "uuid",
    "store_id": "uuid",
    "customer_id": "uuid",
    "type": "DIRECT",
    "source_order_id": null,
    "source_shipment_id": null,
    "status": "COMPLETED",
    "lines": [
      {
        "id": "uuid",
        "product_id": "uuid",
        "variant_id": "uuid",
        "quantity": "2.00",
        "unit": "ADET",
        "unit_price": "150.00",
        "currency": "TRY"
      }
    ],
    "payments": [
      {
        "method": "CASH",
        "amount": "300.00",
        "currency": "TRY"
      }
    ],
    "subtotal": "300.00",
    "vat_amount": "54.00",
    "total_amount": "354.00",
    "currency": "TRY",
    "cash_register_id": "uuid",
    "sold_at": "2024-01-15T09:00:00Z"
  }
]
```

#### Satış Detay

```
GET /api/v1/sales/{id}
```

**Yanıt (200):** Tek satış nesnesi

---

#### Kasa Oturumu Aç

```
POST /api/v1/sales/cash-registers/{id}/sessions/open
```

**İstek:**
```json
{
  "opening_balance": "500.00",
  "opened_by": "uuid"
}
```

**Yanıt (204):** Gövde yok

#### Kasa Oturumu Kapat

```
POST /api/v1/sales/cash-registers/{id}/sessions/close
```

**İstek:**
```json
{
  "closing_balance": "750.00",
  "closed_by": "uuid"
}
```

**Yanıt (204):** Gövde yok

#### Açık Kasa Sorgula

```
GET /api/v1/sales/cash-registers/open
```

Query parametresi: `?store_id={uuid}` (zorunlu)

**Yanıt (200):**
```json
{
  "id": "uuid",
  "tenant_id": "uuid",
  "store_id": "uuid",
  "name": "Kasa 1",
  "status": "OPEN",
  "sessions": [
    {
      "id": "uuid",
      "opened_at": "2024-01-15T08:00:00Z",
      "closed_at": null,
      "opening_balance": "500.00",
      "closing_balance": null,
      "cash_sales_total": "1200.00",
      "card_sales_total": "800.00",
      "return_total": "150.00",
      "opened_by": "uuid",
      "closed_by": null
    }
  ]
}
```

#### Günlük Özet

```
GET /api/v1/sales/daily-summary
```

Query parametreleri: `?store_id={uuid}&date=2024-01-15`

> `date` formatı: `YYYY-MM-DD`

**Yanıt (200):**
```json
{
  "tenant_id": "uuid",
  "store_id": "uuid",
  "date": "2024-01-15",
  "sale_count": 42,
  "total_amount": "15000.00",
  "cash_amount": "8000.00",
  "card_amount": "7000.00",
  "currency": "TRY"
}
```

---

### 6.10 Depo (Warehouse)

#### Depo Oluştur

```
POST /api/v1/warehouses
```

**İstek:**
```json
{
  "code": "AD-01",
  "name": "Ana Depo",
  "manager_id": "uuid",
  "street": "Sanayi Cad. No:5",
  "city": "İstanbul",
  "district": "Pendik",
  "postal": "34906",
  "country": "TR"
}
```

**Yanıt (201):**
```json
{ "id": "uuid" }
```

#### Depo Listesi

```
GET /api/v1/warehouses
```

**Yanıt (200):**
```json
[
  {
    "id": "uuid",
    "tenant_id": "uuid",
    "code": "AD-01",
    "name": "Ana Depo",
    "manager_id": "uuid",
    "status": "active",
    "address": {
      "street": "Sanayi Cad. No:5",
      "city": "İstanbul",
      "district": "Pendik",
      "postal": "34906",
      "country": "TR"
    },
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

> Depo adres nesnesi `postal` kullanır (`postal_code` değil).

#### Depo Detay

```
GET /api/v1/warehouses/{id}
```

**Yanıt (200):** Tek depo nesnesi

#### Depo Güncelle

```
PUT /api/v1/warehouses/{id}
```

**İstek:** Oluşturma ile aynı format

**Yanıt (204):** Gövde yok

---

#### Transfer Oluştur

```
POST /api/v1/warehouses/transfers
```

**İstek:**
```json
{
  "source_id": "uuid",
  "destination_id": "uuid",
  "lines": [
    {
      "product_id": "uuid",
      "quantity": "50.00",
      "unit": "KG"
    }
  ],
  "notes": "Şube transferi"
}
```

**Yanıt (201):**
```json
{ "id": "uuid" }
```

#### Transfer Listesi

```
GET /api/v1/warehouses/transfers
```

Query parametresi: `?warehouse_id={uuid}`

**Yanıt (200):** Transfer dizisi

#### Transfer Detay

```
GET /api/v1/warehouses/transfers/{id}
```

**Yanıt (200):**
```json
{
  "id": "uuid",
  "tenant_id": "uuid",
  "source_id": "uuid",
  "destination_id": "uuid",
  "status": "IN_TRANSIT",
  "lines": [
    {
      "id": "uuid",
      "product_id": "uuid",
      "quantity": "50.00",
      "unit": "KG",
      "received_qty": "0.00",
      "remaining": "50.00"
    }
  ],
  "notes": "Şube transferi",
  "dispatched_at": "2024-01-15T09:00:00Z",
  "completed_at": null,
  "created_at": "2024-01-15T08:00:00Z",
  "updated_at": "2024-01-15T09:00:00Z"
}
```

#### Transfer Sevk Et

```
POST /api/v1/warehouses/transfers/{id}/dispatch
```

**İstek:** Gövde yok

**Yanıt (204):** Gövde yok

#### Transfer Teslim Al

```
POST /api/v1/warehouses/transfers/{id}/receive
```

**İstek:**
```json
{
  "lines": [
    {
      "line_id": "uuid",
      "received_qty": "50.00"
    }
  ]
}
```

**Yanıt (204):** Gövde yok

---

### 6.11 Sevkiyat (Shipment)

#### Sevkiyat Oluştur

```
POST /api/v1/shipments
```

**İstek:**
```json
{
  "order_id": "uuid",
  "warehouse_id": "uuid",
  "method": "CARGO",
  "waybill_number": "WB-2024-001",
  "delivered_by": "Yurtiçi Kargo",
  "lines": [
    {
      "order_line_id": "uuid",
      "product_id": "uuid",
      "variant_id": "uuid",
      "quantity": "10.00",
      "unit": "ADET"
    }
  ],
  "cargo": {
    "company": "Yurtiçi",
    "tracking": "TR123456789",
    "barcode": "BC001"
  }
}
```

> `variant_id` ve `cargo` opsiyoneldir.

**Yanıt (201):**
```json
{ "shipment_id": "uuid" }
```

> Yanıt alanı `"shipment_id"` dir (`"id"` değil).

#### Sevkiyat Listesi

```
GET /api/v1/shipments
```

Query parametresi: `?order_id={uuid}`

**Yanıt (200):**
```json
[
  {
    "id": "uuid",
    "order_id": "uuid",
    "customer_id": "uuid",
    "warehouse_id": "uuid",
    "method": "CARGO",
    "waybill_number": "WB-2024-001",
    "status": "PENDING",
    "delivered_by": "Yurtiçi Kargo",
    "lines": [
      {
        "id": "uuid",
        "order_line_id": "uuid",
        "product_id": "uuid",
        "variant_id": "uuid",
        "quantity": "10.00",
        "unit": "ADET"
      }
    ]
  }
]
```

#### Sevkiyat Detay

```
GET /api/v1/shipments/{id}
```

**Yanıt (200):** Tek sevkiyat nesnesi

#### Sevkiyatı Kargoya Ver

```
POST /api/v1/shipments/{id}/dispatch
```

**İstek:** Boş `{}` veya gövde yok

**Yanıt (204):** Gövde yok

#### Sevkiyatı Teslim Et

```
POST /api/v1/shipments/{id}/deliver
```

**İstek:** Gövde yok

**Yanıt (204):** Gövde yok

---

### 6.12 Üretim (Production)

#### Üretim Emri Oluştur

```
POST /api/v1/production/orders
```

**İstek:**
```json
{
  "product_id": "uuid",
  "variant_id": "uuid",
  "quantity": "1000.00",
  "unit": "KG",
  "planned_start": "2024-01-20T08:00:00Z",
  "planned_end": "2024-01-25T17:00:00Z",
  "source_order_id": "uuid",
  "source_line_id": "uuid"
}
```

> `variant_id`, `source_order_id`, `source_line_id` opsiyoneldir.

**Yanıt (201):**
```json
{ "id": "uuid" }
```

#### Üretim Emri Listesi

```
GET /api/v1/production/orders
```

Query parametreleri: `?status=PLANNED`, `?product_id={uuid}`

**Yanıt (200):** Üretim emri dizisi

#### Üretim Emri Detay

```
GET /api/v1/production/orders/{id}
```

**Yanıt (200):**
```json
{
  "id": "uuid",
  "tenant_id": "uuid",
  "product_id": "uuid",
  "variant_id": "uuid",
  "quantity": "1000.00",
  "unit": "KG",
  "status": "PLANNED",
  "planned_start": "2024-01-20T08:00:00Z",
  "planned_end": "2024-01-25T17:00:00Z",
  "actual_start": null,
  "actual_end": null,
  "stages": [
    {
      "id": "uuid",
      "name": "Karıştırma",
      "sequence": 1,
      "machine_id": "uuid",
      "status": "PENDING",
      "planned_duration_minutes": 120
    }
  ]
}
```

#### Üretim Emrini Planla

```
POST /api/v1/production/orders/{id}/plan
```

**İstek:**
```json
{
  "stages": [
    {
      "name": "Karıştırma",
      "sequence": 1,
      "machine_id": "uuid",
      "planned_duration_minutes": 120
    }
  ]
}
```

> `machine_id` opsiyoneldir.

**Yanıt (204):** Gövde yok

#### Üretime Başla

```
POST /api/v1/production/orders/{id}/start
```

**İstek:** Gövde yok

**Yanıt (204):** Gövde yok

#### Üretime Duraklat

```
POST /api/v1/production/orders/{id}/pause
```

**İstek:**
```json
{ "reason": "Makine arızası" }
```

**Yanıt (204):** Gövde yok

#### Üretimi Tamamla

```
POST /api/v1/production/orders/{id}/complete
```

**İstek:**
```json
{ "actual_quantity": "980.00" }
```

**Yanıt (204):** Gövde yok

#### Bakıma Gönder

```
POST /api/v1/production/orders/{id}/maintenance
```

**İstek:** Gövde yok

**Yanıt (204):** Gövde yok

#### Bakımdan Dön

```
POST /api/v1/production/orders/{id}/return-from-maintenance
```

**İstek:**
```json
{ "next_maintenance": "2024-06-01T08:00:00Z" }
```

> `next_maintenance` opsiyoneldir (RFC3339 tarih).

**Yanıt (204):** Gövde yok

---

### 6.13 Bildirimler (Notifications)

#### Bildirim Listesi

```
GET /api/v1/notifications
```

**Yanıt (200):**
```json
[
  {
    "id": "uuid",
    "tenant_id": "uuid",
    "user_id": "uuid",
    "type": "STOCK_LOW",
    "title": "Stok Azaldı",
    "message": "Polipropilen stoğu eşiğin altına düştü.",
    "is_read": false,
    "created_at": "2024-01-15T09:00:00Z"
  }
]
```

#### Okunmamış Sayısı

```
GET /api/v1/notifications/unread-count
```

**Yanıt (200):**
```json
{ "count": 5 }
```

#### Bildirimi Okundu İşaretle

```
POST /api/v1/notifications/{id}/read
```

**İstek:** Boş nesne `{}`

**Yanıt (204):** Gövde yok

#### Tümünü Okundu İşaretle

```
POST /api/v1/notifications/read-all
```

**İstek:** Gövde yok

**Yanıt (204):** Gövde yok

---

## 7. Platform API Endpoint'leri

Platform API, `http://localhost:8080` adresinde çalışır.

**Auth:** Tüm isteklerde statik admin token gereklidir:
```
Authorization: Bearer <PLATFORM_ADMIN_TOKEN>
```

---

### 7.1 Tenant Yönetimi

#### Tenant Oluştur

```
POST /api/v1/platform/tenants
```

**İstek:**
```json
{
  "company_name": "ABC Plastik A.Ş.",
  "owner_email": "owner@abc.com",
  "trial_days": 30
}
```

**Yanıt (201):**
```json
{ "tenant_id": "uuid" }
```

#### Tenant Listesi

```
GET /api/v1/platform/tenants
```

**Yanıt (200):**
```json
[
  {
    "id": "uuid",
    "company_name": "ABC Plastik A.Ş.",
    "owner_email": "owner@abc.com",
    "status": "ACTIVE",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

#### Tenant Detay

```
GET /api/v1/platform/tenants/{id}
```

**Yanıt (200):** Tek tenant nesnesi

#### Tenant Askıya Al

```
POST /api/v1/platform/tenants/{id}/suspend
```

**İstek:**
```json
{ "reason": "Ödeme gecikti" }
```

**Yanıt (204):** Gövde yok

#### Tenant Aktifleştir

```
POST /api/v1/platform/tenants/{id}/activate
```

**İstek:** Gövde yok

**Yanıt (204):** Gövde yok

#### Tenant'ı Yeniden Aktifleştir

```
POST /api/v1/platform/tenants/{id}/reactivate
```

**İstek:** Gövde yok

**Yanıt (204):** Gövde yok

#### Tenant İptal Et

```
POST /api/v1/platform/tenants/{id}/cancel
```

**İstek:**
```json
{ "reason": "Müşteri isteği" }
```

**Yanıt (204):** Gövde yok

---

### 7.2 Abonelik (Subscription)

#### Abonelik Detay

```
GET /api/v1/platform/tenants/{id}/subscription
```

**Yanıt (200):**
```json
{
  "id": "uuid",
  "tenant_id": "uuid",
  "plan": "PROFESSIONAL",
  "status": "ACTIVE",
  "started_at": "2024-01-01T00:00:00Z",
  "expires_at": "2025-01-01T00:00:00Z",
  "trial_ends_at": null
}
```

#### Abonelik Yükselt

```
POST /api/v1/platform/tenants/{id}/subscription/upgrade
```

**İstek:**
```json
{ "plan": "ENTERPRISE" }
```

**Yanıt (204):** Gövde yok

#### Abonelik Uzat

```
POST /api/v1/platform/tenants/{id}/subscription/extend
```

**İstek:**
```json
{ "days": 30 }
```

**Yanıt (204):** Gövde yok

---

### 7.3 Faturalama (Billing)

#### Fatura Listesi

```
GET /api/v1/platform/tenants/{id}/invoices
```

**Yanıt (200):**
```json
[
  {
    "id": "uuid",
    "tenant_id": "uuid",
    "subscription_id": "uuid",
    "amount": "2999.00",
    "currency": "TRY",
    "status": "UNPAID",
    "due_date": "2024-02-01T00:00:00Z",
    "issued_at": "2024-01-01T00:00:00Z"
  }
]
```

#### Ödeme Kaydet

```
POST /api/v1/platform/payments
```

**İstek:**
```json
{
  "tenant_id": "uuid",
  "subscription_id": "uuid",
  "method": "BANK_TRANSFER",
  "amount": "2999.00",
  "currency": "TRY",
  "reference": "EFT-2024-001"
}
```

**Yanıt (201):**
```json
{ "id": "uuid" }
```

#### Ödeme Onayla

```
POST /api/v1/platform/payments/{id}/confirm
```

**İstek:**
```json
{ "confirmed_by": "admin@platform.com" }
```

**Yanıt (204):** Gövde yok

---

## Sık Yapılan Hatalar

| Hata | Neden | Çözüm |
|------|-------|-------|
| `401 Unauthorized` | Token eksik veya süresi dolmuş | Yeniden login olup token alın |
| `400 Bad Request` | Zorunlu alan eksik veya format yanlış | İstek gövdesini kontrol edin |
| `404 Not Found` | Kayıt bulunamadı | UUID'yi ve tenant_id'yi doğrulayın |
| `422 Unprocessable Entity` | İş kuralı ihlali | `error` alanındaki mesajı kullanıcıya gösterin |
| `403 Forbidden` | Yetersiz izin | Kullanıcının rolünü kontrol edin |
| Order alanları camelCase | Order BC camelCase kullanır | `customerId`, `warehouseId` vb. |
| Katalog `price_amount` float | Diğer para alanları string'ken bu float | `125.50` (tırnak yok) |
| Sevkiyat yanıtı `shipment_id` | Diğer endpoint'ler `id` döner | `response.shipment_id` kullanın |
| Depo adresi `postal` | Diğer adresler `postal_code` kullanır | `address.postal` kullanın |
| Satış `unit_price` | Sipariş satırı `unitPriceAmount` kullanır | Satış satırında `unit_price` (string) |
| Muhasebe bakiye dizi | `balance` endpoint dizi döner | `response[0].net_balance` şeklinde erişin |
