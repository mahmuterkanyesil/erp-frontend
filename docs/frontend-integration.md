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
  "access_token": "eyJhbG...",
  "refresh_token": "eyJhbG...",
  "user": {
    "id": "usr_01",
    "tenant_id": "019e7f8f-537b-7b75-8d51-84c4805bace9",
    "email": "user@example.com",
    "first_name": "Ahmet",
    "last_name": "Yılmaz",
    "role_ids": ["role_01"],
    "access_level": "ALL_STORES",
    "store_ids": [],
    "status": "ACTIVE"
  }
}
```

| Alan | Değer |
|------|-------|
| `access_token` TTL | **15 dakika** |
| `refresh_token` TTL | **7 gün** |

### 2.2 Token Yenileme

```
POST /api/v1/auth/refresh
```

**İstek:**
```json
{
  "tenant_id": "019e7f8f-537b-7b75-8d51-84c4805bace9",
  "refresh_token": "eyJhbG..."
}
```

**Yanıt:** Login yanıtıyla aynı format.

### 2.3 Token Kullanımı

Her istekte iki header zorunludur:

```
Authorization: Bearer <access_token>
X-Tenant-ID: <tenant_uuid>
```

### 2.4 Önerilen Token Yönetimi

```
1. Login → access_token + refresh_token kaydet
2. Her istekte access_token + X-Tenant-ID kullan
3. 401 gelirse → refresh_token ile yenile
4. Refresh da 401 dönerse → kullanıcıyı login ekranına yönlendir
```

> **Not:** Token'ları `localStorage` yerine `httpOnly` cookie veya memory'de saklamak güvenlik açısından tercih edilir.

---

## 3. İstek Formatı

### 3.1 Genel Kurallar

- `Content-Type: application/json` her POST/PUT/PATCH isteğinde zorunlu
- Para tutarları **ondalıklı string** olarak iletilir: `"1250.50"` (float değil)
- Tarihler **RFC 3339** formatında: `"2024-06-15T14:30:00Z"`
- ID'ler **string** (UUID)
- Enum değerleri (status, method, source, type vb.) **BÜYÜK HARF**

### 3.2 Başarılı Yanıtlar

| Durum | HTTP Kodu | Açıklama |
|-------|-----------|----------|
| Kaynak döndürme | `200 OK` | GET, state geçişleri |
| Kaynak oluşturma | `201 Created` | POST (bazı endpoint'ler) |
| İçeriksiz başarı | `204 No Content` | Silme, bazı POST'lar |

---

## 4. Hata Yönetimi

### 4.1 Hata Yanıt Formatı

Tüm hatalar aynı yapıyı döner:

```json
{
  "error": "insufficient stock for product prod_01",
  "code": "Unprocessable Entity"
}
```

`code` alanı HTTP durum metnini taşır (`Unauthorized`, `Not Found`, `Unprocessable Entity`, vb.)

### 4.2 HTTP Durum Kodları

| Kod | Anlam | Örnek |
|-----|-------|-------|
| `400` | Geçersiz JSON / format hatası | Bozuk request body |
| `401` | Token yok veya geçersiz | Süresi dolmuş access_token |
| `403` | Yetki yok | Kullanıcının izni olmayan endpoint |
| `404` | Kaynak bulunamadı | Olmayan sipariş ID'si |
| `409` | Durum çakışması | Zaten onaylanmış sipariş |
| `410` | Kaynak süresi doldu | Süresi geçmiş rezervasyon |
| `422` | İş kuralı ihlali | Negatif stok, kredi limiti aşımı |
| `429` | Rate limit aşıldı | Çok fazla login denemesi |
| `500` | Sunucu hatası | İç hata |

### 4.3 Frontend Hata Stratejisi

```
401 → token yenile, başarısızsa logout
403 → "Bu işlem için yetkiniz yok" göster
422 → error alanını kullanıcıya göster (iş kuralı mesajı)
429 → Retry-After header'ını oku, bekle
5xx → "Bir hata oluştu, lütfen tekrar deneyin" + log
```

---

## 5. İzin Sistemi

### 5.1 Modüller ve Aksiyonlar

Her endpoint bir **modül** ve **aksiyon** çiftiyle korunur. Her iki değer de **büyük harf** kullanır.

| Aksiyon | Anlamı |
|---------|--------|
| `VIEW` | Okuma / listeleme |
| `CREATE` | Yeni kayıt oluşturma |
| `UPDATE` | Mevcut kaydı güncelleme |
| `DELETE` | Kayıt silme |
| `APPROVE` | Durum geçişi / onaylama |

| Modül | Kapsam |
|-------|--------|
| `INVENTORY` | Stok yönetimi |
| `ORDERS` | Sipariş yönetimi |
| `CATALOG` | Ürün kataloğu |
| `CUSTOMERS` | Müşteri / tedarikçi |
| `PURCHASING` | Satın alma |
| `ACCOUNTING` | Muhasebe hesapları |
| `PAYMENTS` | Tahsilat / ödeme |
| `SALES` | Satış işlemleri |
| `WAREHOUSE` | Depo ve transfer yönetimi |
| `SHIPMENT` | Sevkiyat yönetimi |
| `PRODUCTION` | Üretim emirleri ve kalıplar |
| `REPORTS` | Raporlama |
| `SETTINGS` | Sistem ayarları |

> IAM (kullanıcı/rol) endpoint'leri ayrı bir yetki mekanizmasıyla korunur ve yukarıdaki modül listesinde yer almaz.

### 5.2 UI Yetkilendirme

Login yanıtındaki `role_ids` ile kullanıcının yetkilerini `GET /api/v1/users/{id}/permissions` üzerinden çekebilirsiniz. Yanıt:

```json
{
  "permissions": ["INVENTORY:VIEW", "INVENTORY:CREATE", "ORDERS:VIEW"]
}
```

Bu listeyi kullanarak buton/menü görünürlüğünü yönetin:

```typescript
const canCreateOrder = permissions.includes("ORDERS:CREATE");
```

---

## 6. Tenant API Endpoint'leri

Base URL: `http://localhost:8081`
Tüm endpoint'ler `Authorization: Bearer <token>` ve `X-Tenant-ID: <uuid>` gerektirir (`/auth/` hariç).

---

### 6.1 IAM — Kullanıcı ve Rol

#### Kullanıcı Endpoint'leri

| Method | Path | İzin | Açıklama |
|--------|------|------|----------|
| `POST` | `/api/v1/users` | `IAM:CREATE` | Kullanıcı oluştur |
| `GET` | `/api/v1/users` | `IAM:VIEW` | Kullanıcıları listele |
| `GET` | `/api/v1/users/{id}` | `IAM:VIEW` | ID ile getir |
| `GET` | `/api/v1/users/by-email?email=` | `IAM:VIEW` | E-posta ile getir |
| `POST` | `/api/v1/users/{id}/password` | `IAM:UPDATE` | Şifre değiştir |
| `POST` | `/api/v1/users/{id}/lock` | `IAM:APPROVE` | Kullanıcıyı kilitle |
| `POST` | `/api/v1/users/{id}/unlock` | `IAM:APPROVE` | Kilidini aç |
| `POST` | `/api/v1/users/{id}/roles` | `IAM:APPROVE` | Rol ata |
| `DELETE` | `/api/v1/users/{id}/roles/{roleId}` | `IAM:APPROVE` | Rolü kaldır |
| `PUT` | `/api/v1/users/{id}/store-access` | `IAM:APPROVE` | Mağaza erişimi ayarla |
| `GET` | `/api/v1/users/{id}/permissions` | `IAM:VIEW` | İzinleri getir |

**Kullanıcı oluştur:**
```json
// POST /api/v1/users
{
  "email": "ali@firma.com",
  "password": "güçlü_şifre",
  "first_name": "Ali",
  "last_name": "Demir"
}
```

**Şifre değiştir:**
```json
// POST /api/v1/users/{id}/password
{
  "old_password": "eski",
  "new_password": "yeni"
}
```

**Rol ata:**
```json
// POST /api/v1/users/{id}/roles
{ "role_id": "role_satis_temsilcisi" }
```

**Mağaza erişimi:**
```json
// PUT /api/v1/users/{id}/store-access
{
  "access_level": "STORE",
  "store_ids": ["store_01", "store_02"]
}
```

#### Rol Endpoint'leri

| Method | Path | İzin | Açıklama |
|--------|------|------|----------|
| `POST` | `/api/v1/roles` | `IAM:CREATE` | Rol oluştur |
| `GET` | `/api/v1/roles` | `IAM:VIEW` | Rolleri listele |
| `GET` | `/api/v1/roles/{id}` | `IAM:VIEW` | Rol detayı |
| `POST` | `/api/v1/roles/{id}/permissions` | `IAM:APPROVE` | İzin ekle |
| `DELETE` | `/api/v1/roles/{id}/permissions` | `IAM:APPROVE` | İzin kaldır |

**Rol oluştur:**
```json
// POST /api/v1/roles
{
  "name": "Satış Temsilcisi",
  "description": "Sipariş ve müşteri görüntüleme",
  "access_level": "STORE",
  "permissions": ["ORDERS:VIEW", "ORDERS:CREATE", "CUSTOMERS:VIEW"]
}
```

---

### 6.2 Stok (Inventory)

| Method | Path | İzin | Açıklama |
|--------|------|------|----------|
| `POST` | `/api/v1/inventory/reserve` | `INVENTORY:CREATE` | Stok rezerve et |
| `DELETE` | `/api/v1/inventory/reservations/{id}` | `INVENTORY:UPDATE` | Rezervasyonu iptal et |
| `POST` | `/api/v1/inventory/commit` | `INVENTORY:UPDATE` | Rezervasyonu tamamla |
| `POST` | `/api/v1/inventory/replenish` | `INVENTORY:CREATE` | Stok girişi |
| `GET` | `/api/v1/inventory/stock?product_id=&warehouse_id=` | `INVENTORY:VIEW` | Stok sorgula |
| `GET` | `/api/v1/inventory/low-stock` | `INVENTORY:VIEW` | Eşiğin altındaki stoklar |

> Stok kaydı yoksa `replenish` 404 döner. İlk stok kaydı doğrudan DB üzerinden oluşturulmalı veya ayrı bir provizyon akışıyla açılmalıdır.

**Stok rezerve et:**
```json
// POST /api/v1/inventory/reserve
{
  "product_id": "prod_01",
  "warehouse_id": "wh_main",
  "order_id": "ord_01",
  "quantity": 500.0,
  "unit": "kg",
  "expires_at": "2024-06-20T00:00:00Z"
}
```

**Stok girişi:**
```json
// POST /api/v1/inventory/replenish
{
  "product_id": "prod_01",
  "warehouse_id": "wh_main",
  "quantity": 1000.0,
  "unit": "kg",
  "source": "purchase",
  "source_id": "po_01"
}
```

**Stok yanıtı:**
```json
{
  "id": "stock_01",
  "product_id": "prod_01",
  "warehouse_id": "wh_main",
  "total": 1000.0,
  "reserved": 500.0,
  "available": 500.0,
  "unit": "kg"
}
```

---

### 6.3 Sipariş (Orders)

| Method | Path | İzin | Açıklama |
|--------|------|------|----------|
| `POST` | `/api/v1/orders` | `ORDERS:CREATE` | Sipariş oluştur |
| `GET` | `/api/v1/orders/{id}` | `ORDERS:VIEW` | Sipariş detayı |
| `GET` | `/api/v1/orders/pending` | `ORDERS:VIEW` | Bekleyen siparişler |
| `GET` | `/api/v1/customers/{customerId}/orders` | `ORDERS:VIEW` | Müşteri siparişleri |
| `POST` | `/api/v1/orders/{id}/lines` | `ORDERS:CREATE` | Satır ekle |
| `POST` | `/api/v1/orders/{id}/confirm` | `ORDERS:APPROVE` | Onayla |
| `POST` | `/api/v1/orders/{id}/cancel` | `ORDERS:APPROVE` | İptal et |
| `POST` | `/api/v1/orders/{id}/split` | `ORDERS:APPROVE` | Böl |
| `POST` | `/api/v1/orders/{id}/lines/{lineId}/fulfill-stock` | `ORDERS:APPROVE` | Stoktan karşıla |
| `POST` | `/api/v1/orders/{id}/lines/{lineId}/fulfill-production` | `ORDERS:APPROVE` | Üretimden karşıla |
| `POST` | `/api/v1/orders/{id}/lines/{lineId}/substitutions` | `ORDERS:CREATE` | İkame talebi |
| `POST` | `/api/v1/orders/{id}/substitutions/{subId}/approve` | `ORDERS:APPROVE` | İkameyi onayla |
| `POST` | `/api/v1/orders/{id}/substitutions/{subId}/reject` | `ORDERS:APPROVE` | İkameyi reddet |
| `PATCH` | `/api/v1/orders/{id}/requested-date` | `ORDERS:UPDATE` | Talep tarihi güncelle |

> Sipariş request body **camelCase** JSON kullanır (`customerId`, `warehouseId`, `requestedDate`, `productId`, `unitPriceAmount` vb.)

**Sipariş oluştur:**
```json
// POST /api/v1/orders
{
  "customerId": "cust_01",
  "warehouseId": "wh_main",
  "requestedDate": "2024-07-01T00:00:00Z",
  "notes": "Acil teslimat",
  "street": "Atatürk Cad. No:5",
  "city": "İstanbul",
  "district": "Kadıköy",
  "postalCode": "34710",
  "country": "TR"
}
```

**Satır ekle:**
```json
// POST /api/v1/orders/{id}/lines
{
  "productId": "prod_01",
  "quantity": 500.0,
  "unit": "kg",
  "unitPriceAmount": "45.50",
  "unitPriceCurrency": "TRY",
  "discountRate": "0.05",
  "vatRate": "0.18",
  "vatIncluded": false
}
```

> `vatRate` 0-1 arasında ondalık: `0.18` = %18

---

### 6.4 Katalog (Catalog)

| Method | Path | İzin | Açıklama |
|--------|------|------|----------|
| `POST` | `/api/v1/catalog/products` | `CATALOG:CREATE` | Ürün oluştur |
| `POST` | `/api/v1/catalog/products/{id}/variants` | `CATALOG:CREATE` | Varyant ekle |
| `PUT` | `/api/v1/catalog/products/{id}/variants/{vid}/price` | `CATALOG:UPDATE` | Liste fiyatı güncelle |
| `POST` | `/api/v1/catalog/products/{id}/recipes` | `CATALOG:CREATE` | Reçete ekle |
| `POST` | `/api/v1/catalog/products/{id}/discontinue` | `CATALOG:APPROVE` | Üretimi durdur |
| `GET` | `/api/v1/catalog/products/{id}/color-group` | `CATALOG:VIEW` | Renk grubu |
| `POST` | `/api/v1/catalog/categories` | `CATALOG:CREATE` | Kategori oluştur |
| `POST` | `/api/v1/catalog/price-rules` | `CATALOG:CREATE` | Fiyat kuralı oluştur |

**Ürün oluştur:**
```json
// POST /api/v1/catalog/products
{
  "category_id": "cat_plastik",
  "code": "PP-BLACK-001",
  "name": "Polipropilen Siyah",
  "unit": "kg",
  "brand": "Sabic"
}
```

**Varyant ekle:**
```json
// POST /api/v1/catalog/products/{id}/variants
{
  "variant_id": "var_01",
  "code": "PP-BLACK-001-5KG",
  "name": "5kg Torba",
  "color_code": "#000000",
  "price_amount": "45.50",
  "price_currency": "TRY",
  "price_vat_rate": "0.20"
}
```

**Reçete ekle:**
```json
// POST /api/v1/catalog/products/{id}/recipes
{
  "recipe_id": "rec_01",
  "variant_id": "var_01",
  "ingredients": [
    {
      "material_id": "mat_pp_raw",
      "material_type": "plastic_granule",
      "qty_value": 1.05,
      "qty_unit": "kg",
      "ratio": 0.95
    }
  ],
  "valid_from": "2024-01-01T00:00:00Z"
}
```

> `material_type` geçerli değerleri: `plastic_granule`, `additive`, `packaging`, `semi_finished`, `other`

---

### 6.5 Müşteri / İş Ortağı (Customer)

| Method | Path | İzin | Açıklama |
|--------|------|------|----------|
| `POST` | `/api/v1/customers` | `CUSTOMERS:CREATE` | İş ortağı oluştur |
| `GET` | `/api/v1/customers?q=&limit=` | `CUSTOMERS:VIEW` | Ara / listele |
| `GET` | `/api/v1/customers/{id}` | `CUSTOMERS:VIEW` | Detay |
| `GET` | `/api/v1/customers/by-tax-number?tax_number=` | `CUSTOMERS:VIEW` | VKN ile getir |
| `GET` | `/api/v1/customers/credit-exceeded` | `CUSTOMERS:VIEW` | Kredi limiti aşanlar |
| `POST` | `/api/v1/customers/{id}/customer-role` | `CUSTOMERS:UPDATE` | Müşteri rolü ekle |
| `POST` | `/api/v1/customers/{id}/supplier-role` | `CUSTOMERS:UPDATE` | Tedarikçi rolü ekle |
| `POST` | `/api/v1/customers/{id}/addresses` | `CUSTOMERS:UPDATE` | Adres ekle |
| `PUT` | `/api/v1/customers/{id}/addresses/{addrId}/default` | `CUSTOMERS:UPDATE` | Varsayılan adres |
| `GET` | `/api/v1/customers/{id}/addresses/default` | `CUSTOMERS:VIEW` | Varsayılan adresi getir |
| `PATCH` | `/api/v1/customers/{id}/credit-limit` | `CUSTOMERS:UPDATE` | Kredi limiti güncelle |
| `POST` | `/api/v1/customers/{id}/blacklist` | `CUSTOMERS:APPROVE` | Kara listeye al |

**İş ortağı oluştur:**
```json
// POST /api/v1/customers
{
  "partner_type": "company",
  "tax_number": "1234567890",
  "tax_office": "Kadıköy",
  "company_name": "ABC Plastik A.Ş.",
  "email": "info@abcplastik.com",
  "phone": "+905551234567",
  "billing_street": "Sanayi Cad. No:12",
  "billing_district": "Ümraniye",
  "billing_city": "İstanbul",
  "billing_postal": "34760",
  "billing_country": "TR"
}
```

**Müşteri rolü ekle:**
```json
// POST /api/v1/customers/{id}/customer-role
{
  "credit_amount": "50000.00",
  "credit_currency": "TRY",
  "payment_term_days": 30,
  "discount_rate": 0.05,
  "segment": "A",
  "assigned_rep_id": "usr_01"
}
```

---

### 6.6 Satın Alma (Purchasing)

| Method | Path | İzin | Açıklama |
|--------|------|------|----------|
| `POST` | `/api/v1/purchasing/orders` | `PURCHASING:CREATE` | Satın alma emri |
| `GET` | `/api/v1/purchasing/orders/{id}` | `PURCHASING:VIEW` | Detay |
| `GET` | `/api/v1/purchasing/orders` | `PURCHASING:VIEW` | Açık emirler |
| `GET` | `/api/v1/purchasing/orders?supplier_id=` | `PURCHASING:VIEW` | Tedarikçiye göre |
| `POST` | `/api/v1/purchasing/orders/{id}/lines` | `PURCHASING:CREATE` | Satır ekle |
| `POST` | `/api/v1/purchasing/orders/{id}/confirm` | `PURCHASING:APPROVE` | Onayla |
| `POST` | `/api/v1/purchasing/orders/{id}/receipts` | `PURCHASING:CREATE` | Mal kabul |
| `POST` | `/api/v1/purchasing/orders/{id}/cancel` | `PURCHASING:APPROVE` | İptal |
| `POST` | `/api/v1/purchasing/orders/{id}/returns` | `PURCHASING:CREATE` | İade |
| `PATCH` | `/api/v1/purchasing/orders/{id}/receipts/{rid}/invoice` | `PURCHASING:UPDATE` | Fatura bilgisi ekle |
| `POST` | `/api/v1/purchasing/materials` | `PURCHASING:CREATE` | Hammadde tanımla |
| `GET` | `/api/v1/purchasing/materials/{id}` | `PURCHASING:VIEW` | Hammadde detayı |
| `PATCH` | `/api/v1/purchasing/materials/{id}/supplier` | `PURCHASING:UPDATE` | Tercihli tedarikçi |

**Satın alma emri oluştur:**
```json
// POST /api/v1/purchasing/orders
{
  "supplier_id": "cust_sup_01",
  "warehouse_id": "wh_main",
  "source": "MANUAL",
  "expected_date": "2024-06-30T00:00:00Z",
  "notes": "Acil sipariş"
}
```

> `source` geçerli değerleri: `MANUAL`, `ORDER`

**Mal kabul:**
```json
// POST /api/v1/purchasing/orders/{id}/receipts
{
  "lines": [
    {
      "order_line_id": "pol_01",
      "material_id": "mat_01",
      "quantity": 500.0,
      "unit": "kg"
    }
  ],
  "notes": "Sorunsuz teslim"
}
```

---

### 6.7 Muhasebe (Accounting)

| Method | Path | İzin | Açıklama |
|--------|------|------|----------|
| `POST` | `/api/v1/accounting/accounts` | `ACCOUNTING:CREATE` | Hesap aç |
| `GET` | `/api/v1/accounting/accounts?partner_id=` | `ACCOUNTING:VIEW` | Hesap getir |
| `POST` | `/api/v1/accounting/accounts/{id}/debit` | `ACCOUNTING:CREATE` | Borç kaydet |
| `POST` | `/api/v1/accounting/accounts/{id}/credit` | `ACCOUNTING:CREATE` | Alacak kaydet |
| `POST` | `/api/v1/accounting/accounts/{id}/transactions/{tx_id}/paid` | `ACCOUNTING:APPROVE` | Ödendi işaretle |
| `POST` | `/api/v1/accounting/accounts/{id}/freeze` | `ACCOUNTING:APPROVE` | Hesabı dondur |
| `GET` | `/api/v1/accounting/accounts/{id}/transactions` | `ACCOUNTING:VIEW` | Hareketler |
| `GET` | `/api/v1/accounting/accounts/{id}/transactions/overdue` | `ACCOUNTING:VIEW` | Vadesi geçmiş |
| `GET` | `/api/v1/accounting/accounts/{id}/aging` | `ACCOUNTING:VIEW` | Yaşlandırma raporu |
| `GET` | `/api/v1/accounting/accounts/{id}/balance` | `ACCOUNTING:VIEW` | Bakiye özeti |

> `{id}` path parametresi **iş ortağı ID'sidir** (`partner_id`), hesap ID'si değil.

**Borç kaydet:**
```json
// POST /api/v1/accounting/accounts/{id}/debit
{
  "currency": "TRY",
  "amount": "22750.00",
  "source": "shipment",
  "source_id": "shp_01",
  "description": "Fatura #INV-2024-001",
  "due_date": "2024-07-15T00:00:00Z"
}
```

> `source` geçerli değerleri: `shipment`, `payment`, `purchase`, `supplier_payment`, `adjustment`

**Yaşlandırma yanıtı:**
```json
{
  "currency": "TRY",
  "current": "5000.00",
  "days_30": "12000.00",
  "days_60": "3500.00",
  "days_90": "0.00",
  "over_90": "2250.00",
  "total_overdue": "17750.00",
  "total": "22750.00"
}
```

---

### 6.8 Tahsilat / Ödeme (Payments)

| Method | Path | İzin | Açıklama |
|--------|------|------|----------|
| `POST` | `/api/v1/payments/inbound` | `PAYMENTS:CREATE` | Tahsilat kaydet |
| `POST` | `/api/v1/payments/outbound` | `PAYMENTS:CREATE` | Ödeme kaydet |
| `GET` | `/api/v1/payments/{id}` | `PAYMENTS:VIEW` | Detay |
| `GET` | `/api/v1/payments?partner_id=` | `PAYMENTS:VIEW` | İş ortağına göre |
| `POST` | `/api/v1/payments/{id}/allocate` | `PAYMENTS:UPDATE` | İşleme bağla |
| `POST` | `/api/v1/payments/{id}/clear` | `PAYMENTS:APPROVE` | Çek tahsil et |
| `POST` | `/api/v1/payments/{id}/bounce` | `PAYMENTS:APPROVE` | Çek iade et |
| `POST` | `/api/v1/payments/{id}/cancel` | `PAYMENTS:APPROVE` | İptal et |
| `GET` | `/api/v1/payments/pending-checks` | `PAYMENTS:VIEW` | Bekleyen çekler |
| `GET` | `/api/v1/payments/unallocated` | `PAYMENTS:VIEW` | Bağlanmamış ödemeler |

**Tahsilat kaydet (çek):**
```json
// POST /api/v1/payments/inbound
{
  "partner_id": "cust_01",
  "method": "CHECK",
  "currency": "TRY",
  "amount": "15000.00",
  "description": "Haziran tahsilatı",
  "received_at": "2024-06-15T10:00:00Z",
  "check_number": "123456",
  "check_bank": "Garanti Bankası",
  "check_due_date": "2024-08-15T00:00:00Z",
  "check_drawer": "ABC Plastik A.Ş."
}
```

> `method` geçerli değerleri: `CASH`, `CHECK`, `BANK_TRANSFER`, `PROMISSORY_NOTE`

**Ödemeyi işleme bağla:**
```json
// POST /api/v1/payments/{id}/allocate
{
  "transaction_id": "tx_01",
  "amount": "15000.00"
}
```

---

### 6.9 Satış (Sales)

| Method | Path | İzin | Açıklama |
|--------|------|------|----------|
| `POST` | `/api/v1/sales/direct` | `SALES:CREATE` | Direkt satış |
| `POST` | `/api/v1/sales/order-based` | `SALES:CREATE` | Siparişe dayalı satış |
| `GET` | `/api/v1/sales/{id}` | `SALES:VIEW` | Detay |
| `GET` | `/api/v1/sales?store_id=` | `SALES:VIEW` | Mağazaya göre listele |
| `GET` | `/api/v1/sales?customer_id=` | `SALES:VIEW` | Müşteriye göre listele |
| `POST` | `/api/v1/sales/{id}/returns` | `SALES:CREATE` | İade |
| `POST` | `/api/v1/sales/cash-registers/{id}/open` | `SALES:APPROVE` | Kasa aç |
| `POST` | `/api/v1/sales/cash-registers/{id}/close` | `SALES:APPROVE` | Kasa kapat |
| `GET` | `/api/v1/sales/cash-registers/open` | `SALES:VIEW` | Açık kasa |
| `GET` | `/api/v1/sales/summary/daily?store_id=&date=` | `SALES:VIEW` | Günlük özet |

**Direkt satış:**
```json
// POST /api/v1/sales/direct
{
  "store_id": "store_01",
  "customer_id": "cust_01",
  "cash_register_id": "reg_01",
  "currency": "TRY",
  "sold_at": "2024-06-15T11:30:00Z",
  "lines": [
    {
      "product_id": "prod_01",
      "quantity": 25.0,
      "unit": "kg",
      "unit_price": "45.50",
      "discount_rate": 0.0,
      "vat_rate": 0.20
    }
  ],
  "payments": [
    { "method": "CASH", "amount": "1365.00", "currency": "TRY" }
  ]
}
```

---

### 6.10 Depo (Warehouse)

| Method | Path | İzin | Açıklama |
|--------|------|------|----------|
| `POST` | `/api/v1/warehouses` | `WAREHOUSE:CREATE` | Depo oluştur |
| `GET` | `/api/v1/warehouses` | `WAREHOUSE:VIEW` | Depoları listele |
| `GET` | `/api/v1/warehouses/{id}` | `WAREHOUSE:VIEW` | Depo detayı |
| `PUT` | `/api/v1/warehouses/{id}` | `WAREHOUSE:UPDATE` | Depo güncelle |
| `POST` | `/api/v1/warehouses/{id}/manager` | `WAREHOUSE:APPROVE` | Sorumlu ata |
| `GET` | `/api/v1/warehouses/{id}/transfers` | `WAREHOUSE:VIEW` | Deponun transferleri |
| `POST` | `/api/v1/transfers` | `WAREHOUSE:CREATE` | Transfer oluştur |
| `GET` | `/api/v1/transfers` | `WAREHOUSE:VIEW` | Aktif transferler |
| `GET` | `/api/v1/transfers/{id}` | `WAREHOUSE:VIEW` | Transfer detayı |
| `POST` | `/api/v1/transfers/{id}/dispatch` | `WAREHOUSE:APPROVE` | Transferi gönder |
| `POST` | `/api/v1/transfers/{id}/receive` | `WAREHOUSE:APPROVE` | Transfer kabul |
| `POST` | `/api/v1/transfers/{id}/cancel` | `WAREHOUSE:APPROVE` | Transfer iptal |

> `warehouse_type` geçerli değerleri: `CENTRAL`, `STORE`, `PRODUCTION`

**Depo oluştur:**
```json
// POST /api/v1/warehouses
{
  "code": "WH-001",
  "name": "Ana Depo",
  "warehouse_type": "CENTRAL",
  "street": "Sanayi Cad. No:1",
  "city": "İstanbul",
  "district": "Ümraniye",
  "postal": "34760",
  "country": "TR"
}
```

**Transfer oluştur:**
```json
// POST /api/v1/transfers
{
  "source_id": "wh_central",
  "destination_id": "wh_store",
  "notes": "Haftalık ikmal",
  "lines": [
    { "product_id": "prod_01", "quantity": 100.0, "unit": "kg" }
  ]
}
```

**Transfer kabul:**
```json
// POST /api/v1/transfers/{id}/receive
{
  "lines": [
    { "line_id": "tl_01", "received_qty": 100.0 }
  ]
}
```

> `line_id` değeri transfer oluşturma yanıtındaki satır ID'sinden alınır.

---

### 6.11 Sevkiyat (Shipment)

| Method | Path | İzin | Açıklama |
|--------|------|------|----------|
| `POST` | `/api/v1/shipments` | `SHIPMENT:CREATE` | Sevkiyat oluştur |
| `GET` | `/api/v1/shipments/{id}` | `SHIPMENT:VIEW` | Detay |
| `GET` | `/api/v1/shipments?order_id=` | `SHIPMENT:VIEW` | Siparişe göre |
| `GET` | `/api/v1/shipments?waybill=` | `SHIPMENT:VIEW` | İrsaliye numarasına göre |
| `GET` | `/api/v1/shipments?active=true` | `SHIPMENT:VIEW` | Aktif sevkiyatlar |
| `POST` | `/api/v1/shipments/{id}/dispatch` | `SHIPMENT:APPROVE` | Yola çıkar |
| `POST` | `/api/v1/shipments/{id}/deliver` | `SHIPMENT:APPROVE` | Teslim edildi |
| `POST` | `/api/v1/shipments/{id}/cancel` | `SHIPMENT:APPROVE` | İptal et |

> Oluşturma yanıtında ID alanı `shipment_id` olarak döner (diğer BC'lerden farklı olarak `id` değil).

**Sevkiyat oluştur:**
```json
// POST /api/v1/shipments
{
  "order_id": "ord_01",
  "customer_id": "cust_01",
  "warehouse_id": "wh_main",
  "method": "OWN_VEHICLE",
  "street": "Teslimat Cad. No:5",
  "district": "Kadıköy",
  "city": "İstanbul",
  "postal_code": "34710",
  "country": "TR",
  "notes": "Sabah 08:00-12:00 arası",
  "lines": [
    {
      "order_line_id": "ol_01",
      "product_id": "prod_01",
      "quantity": 500.0,
      "unit": "kg",
      "reservation_id": "res_01"
    }
  ]
}
```

> `method` geçerli değerleri: `OWN_VEHICLE`, `CARGO`, `DEPOT_PICKUP`

**Teslim et:**
```json
// POST /api/v1/shipments/{id}/deliver
{ "delivered_by": "Ahmet Şoför" }
```

---

### 6.12 Üretim (Production)

| Method | Path | İzin | Açıklama |
|--------|------|------|----------|
| `POST` | `/api/v1/production/orders` | `PRODUCTION:CREATE` | Üretim emri planla |
| `POST` | `/api/v1/production/orders/{id}/assign-machine` | `PRODUCTION:UPDATE` | Makine ata |
| `POST` | `/api/v1/production/orders/{id}/start` | `PRODUCTION:APPROVE` | Üretime başla |
| `POST` | `/api/v1/production/orders/{id}/complete-stage` | `PRODUCTION:UPDATE` | Aşama tamamla |
| `POST` | `/api/v1/production/orders/{id}/cancel` | `PRODUCTION:APPROVE` | İptal et |
| `POST` | `/api/v1/production/molds/{id}/shots` | `PRODUCTION:UPDATE` | Kalıp atış sayısı kaydet |
| `POST` | `/api/v1/production/molds/{id}/maintenance` | `PRODUCTION:APPROVE` | Kalıbı bakıma gönder |
| `DELETE` | `/api/v1/production/molds/{id}/maintenance` | `PRODUCTION:APPROVE` | Bakımdan geri al |

**Üretim emri planla:**
```json
// POST /api/v1/production/orders
{
  "product_id": "prod_01",
  "mold_id": "mold_01",
  "warehouse_id": "wh_production",
  "quantity": 500.0,
  "quantity_unit": "adet",
  "source": "MANUAL",
  "planned_start": "2026-06-05T08:00:00Z",
  "stages": [
    { "name": "Enjeksiyon" },
    { "name": "Kalite Kontrol" }
  ]
}
```

> `source` geçerli değerleri: `MANUAL`, `ORDER`

**Makine ata:**
```json
// POST /api/v1/production/orders/{id}/assign-machine
{ "machine_id": "mch_01" }
```

**Aşama tamamla:**
```json
// POST /api/v1/production/orders/{id}/complete-stage
{ "notes": "Enjeksiyon aşaması sorunsuz tamamlandı" }
```

**Kalıp atış sayısı:**
```json
// POST /api/v1/production/molds/{id}/shots
{ "count": 50 }
```

**Bakımdan geri al:**
```json
// DELETE /api/v1/production/molds/{id}/maintenance
{ "next_maintenance": "2026-09-01T00:00:00Z" }
```

---

### 6.13 Bildirim (Notification)

| Method | Path | Açıklama |
|--------|------|----------|
| `GET` | `/api/v1/notifications?recipient_id=` | Bildirimleri listele |
| `GET` | `/api/v1/notifications/unread-count?recipient_id=` | Okunmamış sayısı |
| `POST` | `/api/v1/notifications/{id}/read` | Okundu işaretle |
| `PUT` | `/api/v1/notifications/preferences` | Bildirim tercihleri güncelle |

**Bildirim tercihleri:**
```json
// PUT /api/v1/notifications/preferences
{
  "user_id": "usr_01",
  "notif_type": "ORDER_CONFIRMED",
  "channels": ["IN_APP"],
  "enable": true
}
```

---

## 7. Platform API Endpoint'leri

Base URL: `http://localhost:8080`
**Authentication:** `Authorization: Bearer <PLATFORM_ADMIN_TOKEN>`

> Platform API'si sadece sistem yöneticileri tarafından kullanılır. Tenant kullanıcıları bu API'ye erişemez.

---

### 7.1 Tenant Yönetimi

| Method | Path | Açıklama |
|--------|------|----------|
| `POST` | `/api/v1/tenants` | Tenant oluştur |
| `GET` | `/api/v1/tenants?slug=&status=` | Listele |
| `GET` | `/api/v1/tenants/{id}` | Detay |
| `POST` | `/api/v1/tenants/{id}/activate` | Aktifleştir |
| `POST` | `/api/v1/tenants/{id}/suspend` | Askıya al |
| `POST` | `/api/v1/tenants/{id}/reactivate` | Reaktifleştir |
| `POST` | `/api/v1/tenants/{id}/cancel` | İptal et |

**Tenant oluştur:**
```json
// POST /api/v1/tenants
{
  "company_name": "ABC Plastik A.Ş.",
  "owner_email": "admin@abcplastik.com",
  "trial_days": 14
}
// Yanıt: { "tenant_id": "019e..." }
```

---

### 7.2 Abonelik Paketleri

| Method | Path | Açıklama |
|--------|------|----------|
| `POST` | `/api/v1/packages` | Paket oluştur |
| `PUT` | `/api/v1/packages/{id}` | Güncelle |
| `GET` | `/api/v1/packages?active=true` | Listele |
| `GET` | `/api/v1/packages/{id}` | Detay |

**Paket oluştur:**
```json
// POST /api/v1/packages
{
  "name": "Pro",
  "modules": ["INVENTORY", "ORDERS", "CATALOG", "CUSTOMERS", "PURCHASING", "ACCOUNTING", "PAYMENTS", "SALES"],
  "max_users": 25,
  "max_orders_per_month": 5000,
  "monthly_price": "4999.00",
  "yearly_price": "49990.00",
  "currency": "TRY",
  "is_active": true
}
```

---

### 7.3 Abonelik Yönetimi

| Method | Path | Açıklama |
|--------|------|----------|
| `GET` | `/api/v1/subscriptions/{tenantId}` | Abonelik getir |
| `GET` | `/api/v1/subscriptions/{tenantId}/features` | Aktif modüller |
| `POST` | `/api/v1/subscriptions/{id}/activate` | Aktifleştir |
| `POST` | `/api/v1/subscriptions/{id}/change-package` | Paket değiştir |
| `POST` | `/api/v1/subscriptions/{id}/renew` | Yenile |
| `POST` | `/api/v1/subscriptions/{id}/past-due` | Gecikmiş işaretle |
| `POST` | `/api/v1/subscriptions/{id}/cancel` | İptal et |

```json
// POST /api/v1/subscriptions/{id}/activate
{ "billing_cycle": "monthly" }

// GET /api/v1/subscriptions/{tenantId}/features
{ "modules": ["INVENTORY", "ORDERS", "CATALOG"] }
```

---

### 7.4 Faturalama

| Method | Path | Açıklama |
|--------|------|----------|
| `POST` | `/api/v1/billing/payments` | Ödeme kaydet |
| `POST` | `/api/v1/billing/payments/{id}/confirm` | Onayla |
| `POST` | `/api/v1/billing/payments/{id}/refund` | İade et |
| `GET` | `/api/v1/billing/payments/pending` | Bekleyen ödemeler |
| `POST` | `/api/v1/billing/invoices/{id}/cancel` | Fatura iptal |
| `GET` | `/api/v1/billing/invoices/{id}` | Detay |
| `GET` | `/api/v1/billing/invoices?tenant_id=&overdue=true` | Listele |

---

## Ek Notlar

### Para Tutarları

Tüm para tutarları **ondalıklı string** olarak gönderilir ve alınır. Asla `float` kullanmayın:

```typescript
// Doğru
const amount = "1250.50";

// Yanlış — ondalık kayması riski
const amount = 1250.50;
```

### Tarih Formatı

Tüm tarihler **RFC 3339 / ISO 8601 UTC** formatında:

```
"2024-06-15T14:30:00Z"
```

### Enum Değerleri

Tüm enum alanları (status, method, source, type, warehouse_type vb.) büyük harf kullanır:

```
MANUAL  CASH  CHECK  BANK_TRANSFER  CENTRAL  STORE  OWN_VEHICLE  …
```

### Sayfalama

Şu an listeleme endpoint'leri sabit limit döner. Gelecekte standart format eklenecek:

```
GET /api/v1/orders?limit=20&offset=0
```

### Swagger UI

Her API'nin interaktif dokümantasyonuna erişebilirsiniz:

- Tenant API: `http://localhost:8081/swagger/`
- Platform API: `http://localhost:8080/swagger/`
