# Ubiquitous Language — Plastik ERP

Bu dosya, Plastik ERP'nin tüm bounded context'lerinde kullanılan domain terimlerinin
**yetkili sözlüğüdür.** Backend kodu, frontend kodu, API kontratları ve konuşmalar
bu terimleri tutarlı biçimde kullanır.

> Bir terim burada yoksa domain'e ait değildir — genel programlama jargonu veya
> altyapı terimidir. Yeni bir kavram ortaya çıktığında önce buraya eklenir.

---

## İçindekiler

1. [Genel / Paylaşılan Kavramlar](#1-genel--paylaşılan-kavramlar)
2. [IAM — Kimlik ve Erişim Yönetimi](#2-iam--kimlik-ve-erişim-yönetimi)
3. [Order — Sipariş](#3-order--sipariş)
4. [Inventory — Envanter / Stok](#4-inventory--envanter--stok)
5. [Catalog — Ürün Kataloğu](#5-catalog--ürün-kataloğu)
6. [Purchasing — Satın Alma](#6-purchasing--satın-alma)
7. [Sales — Satış](#7-sales--satış)
8. [Warehouse — Depo](#8-warehouse--depo)
9. [Accounting — Muhasebe](#9-accounting--muhasebe)
10. [Customer — Müşteri / İş Ortağı](#10-customer--müşteri--iş-ortağı)
11. [Platform — Çok Kiracılı Yönetim](#11-platform--çok-kiracılı-yönetim)
12. [Durum Geçiş Diyagramları](#12-durum-geçiş-diyagramları)

---

## 1. Genel / Paylaşılan Kavramlar

| Terim (TR) | Terim (EN) | Açıklama |
|---|---|---|
| **Kiracı** | **Tenant** | Sistemi kullanan her bağımsız firma. Her kiracının verisi diğerlerinden izole edilmiştir. |
| **Sınırlı Bağlam** | **Bounded Context (BC)** | Kendi dil ve kurallarına sahip domain bölümü. Order, Inventory, Sales vb. ayrı BC'lerdir. |
| **Aggregate** | **Aggregate** | Birlikte değişen, tek bir birim olarak ele alınan entity grubu. Her BC'nin bir veya birkaç aggregate'i vardır. |
| **Domain Event** | **Domain Event** | Aggregate içinde gerçekleşen önemli bir değişikliği temsil eden değişmez kayıt. Diğer BC'ler bu olayları dinler. |
| **Para Tutarı** | **Money / Amount** | Ondalıklı string olarak taşınır: `"1250.50"`. Float kullanılmaz — ondalık kayması riski. |
| **Miktar** | **Quantity** | Sayısal değer + birim çifti. Örn: `{ value: 500, unit: "kg" }`. |
| **Birim** | **Unit** | Ölçü birimi kısaltması: `kg`, `adet`, `m`, `lt`, `ton`. |
| **Referans Kimlik** | **Reference ID** | Bir BC'nin başka bir BC'deki kaydı tanımlamak için tuttuğu dış ID. Doğrudan ilişki kurmak yerine ID saklanır. |
| **Tarih Formatı** | **RFC 3339** | Tüm tarih/saat değerleri `"2024-06-15T14:30:00Z"` formatındadır. |

---

## 2. IAM — Kimlik ve Erişim Yönetimi

| Terim (TR) | Terim (EN) | Açıklama |
|---|---|---|
| **Kullanıcı** | **User** | Sisteme giriş yapabilen kişi. Her kullanıcı bir kiracıya aittir. |
| **Rol** | **Role** | İzin kümesini tanımlayan etiket. Kullanıcıya atanır. Örn: `satis_temsilcisi`, `depo_gorevlisi`. |
| **İzin** | **Permission** | `modül:aksiyon` formatında yetki. Örn: `orders:create`, `inventory:view`. |
| **Erişim Seviyesi** | **Access Level** | `all` = tüm mağaza/depolar; `store` = sadece atanan mağazalar. |
| **Kilitli Kullanıcı** | **Locked User** | Giriş yapması engellenen kullanıcı. Status: `locked`. |
| **Aktif Kullanıcı** | **Active User** | Sisteme giriş yapabilen kullanıcı. Status: `active`. |
| **Access Token** | **Access Token** | Kısa ömürlü JWT (15 dk). Her API isteğinde `Authorization: Bearer` header'ına eklenir. Memory'de tutulur. |
| **Refresh Token** | **Refresh Token** | Uzun ömürlü token (7 gün). Süresi dolmuş access token'ı yenilemek için kullanılır. localStorage'da saklanır. |
| **İmpersonation** | **Impersonation** | Platform admin'inin bir kiracı kullanıcısı gibi sisteme girmesi. Denetim kaydı tutulur. |

---

## 3. Order — Sipariş

### Terimler

| Terim (TR) | Terim (EN) | Açıklama |
|---|---|---|
| **Sipariş** | **CustomerOrder** | Müşteriden gelen ürün talebi. Lifecycle boyunca durum geçişleri yaşar. |
| **Sipariş Kalemi** | **OrderLine** | Siparişin içindeki tekil ürün satırı. Ürün ID, miktar, fiyat içerir. |
| **Karşılama** | **Fulfillment** | Bir sipariş kaleminin stoktan, üretimden veya beklemeden karşılanması. |
| **Karşılama Stratejisi** | **FulfillmentStrategy** | `FROM_STOCK` (stoktan), `FROM_PRODUCTION` (üretimden), `BACKORDER` (bekleme). |
| **Fiyat Anlık Görüntüsü** | **PriceSnapshot** | Siparişin oluşturulduğu andaki birim fiyatı. Sonraki fiyat değişikliklerinden etkilenmez. |
| **İkame Talebi** | **SubstitutionRequest** | Stokta olmayan ürün yerine alternatif ürün önerisi. Müşteri onayı gerektirir. |
| **Talep Tarihi** | **RequestedDate** | Müşterinin teslim almak istediği tarih. |
| **Tahmini Sevk Tarihi** | **EstimatedShipDate** | Depo veya üretimin öngördüğü sevk tarihi. |
| **İskonto Oranı** | **DiscountRate** | 0–1 arası ondalık oran. `0.10` = %10 iskonto. |
| **KDV Oranı** | **VATRate** | 0–1 arası ondalık oran. `0.20` = %20 KDV. |
| **KDV Dahil** | **VATIncluded** | Fiyatın KDV içerip içermediği. Boolean. |
| **Sözleşme Fiyatı** | **ContractPrice** | Müşteri ile önceden anlaşılan özel fiyat. Yoksa `null`. |

### Sipariş Durumları (OrderStatus)

| Durum | Açıklama | UI Rengi |
|---|---|---|
| `DRAFT` | Taslak — henüz onaylanmamış, düzenlenebilir | Nötr (gri) |
| `CONFIRMED` | Onaylandı — stok rezervasyonu yapıldı | Mavi (info) |
| `PARTIALLY_FULFILLED` | Kısmen karşılandı — bazı kalemler teslim edildi | Sarı (warning) |
| `FULFILLED` | Tamamen karşılandı | Yeşil (success) |
| `SHIPPED` | Kargoya verildi / sevk edildi | Mavi (primary) |
| `DELIVERED` | Müşteriye teslim edildi | Yeşil (success) |
| `CANCELLED` | İptal edildi | Kırmızı (danger) |

### Sipariş Kalemi Durumları (OrderLineStatus)

| Durum | Açıklama |
|---|---|
| `pending` | Bekliyor |
| `partially_fulfilled` | Kısmen karşılandı |
| `fulfilled` | Tamamen karşılandı |
| `cancelled` | İptal edildi |

---

## 4. Inventory — Envanter / Stok

### Terimler

| Terim (TR) | Terim (EN) | Açıklama |
|---|---|---|
| **Stok** | **Stock** | Belirli bir ürünün belirli bir depodaki miktar kaydı. Aggregate root. |
| **Toplam Stok** | **Total Stock** | Depodaki fiziksel toplam miktar. |
| **Rezerve Stok** | **Reserved Stock** | Aktif rezervasyonlar için ayrılmış miktar. Kullanılamaz. |
| **Mevcut Stok** | **Available Stock** | `Total - Reserved`. Sipariş verilebilecek miktar. |
| **Rezervasyon** | **StockReservation** | Bir sipariş için geçici olarak ayrılan stok miktarı. Süresi dolabilir. |
| **Stok Hareketi** | **InventoryMovement** | Her stok değişikliğinin değişmez kaydı. Denetim izi oluşturur. |
| **Eşik** | **Threshold** | Düşük stok uyarısının tetiklendiği minimum miktar. |
| **Düşük Stok** | **Low Stock / StockDepleted** | Mevcut stok eşiğin altına düştüğünde oluşan durum/event. |
| **Stok Girişi** | **Replenish** | Stoka yeni mal eklenmesi. Kaynak: üretim, satın alma, transfer. |
| **Stok Düzeltmesi** | **Adjustment** | Manuel stok sayımı sonucu uygulanan artı/eksi düzeltme. |
| **Commit** | **Commit** | Rezervasyonun kalıcı tüketime dönüştürülmesi. Satış tamamlandığında yapılır. |
| **Serbest Bırakma** | **Release** | Aktif rezervasyonun iptal edilmesi. Sipariş iptalinde yapılır. |

### Stok Hareketi Tipleri (MovementType)

| Tip | Açıklama |
|---|---|
| `reservation` | Rezervasyon oluşturuldu → mevcut stok azaldı |
| `release` | Rezervasyon serbest bırakıldı → mevcut stok arttı |
| `commit` | Rezervasyon tüketime dönüştürüldü → toplam stok azaldı |
| `replenish` | Stok girişi → toplam stok arttı |
| `adjustment` | Manuel düzeltme → pozitif veya negatif |

### Rezervasyon Durumları (ReservationStatus)

| Durum | Açıklama |
|---|---|
| `active` | Geçerli, stok ayrılmış |
| `released` | Serbest bırakıldı (sipariş iptal vb.) |
| `committed` | Kalıcı tüketime dönüştürüldü |
| `expired` | Süresi doldu, otomatik serbest bırakıldı |

---

## 5. Catalog — Ürün Kataloğu

### Terimler

| Terim (TR) | Terim (EN) | Açıklama |
|---|---|---|
| **Ürün** | **Product** | Satılabilir veya üretilebilir temel katalog öğesi. |
| **Varyant** | **ProductVariant** | Aynı ürünün farklı özellikteki (renk, boyut, kalınlık) versiyonu. SKU'su farklıdır. |
| **SKU** | **SKU (Stock Keeping Unit)** | Ürün veya varyantı benzersiz tanımlayan kod. Depo sisteminde kullanılır. |
| **Reçete** | **Recipe / Bill of Materials (BOM)** | Ürünü üretmek için gereken hammadde listesi ve miktarları. |
| **Reçete Kalemi** | **RecipeLine** | Reçetedeki tek bir hammadde: `{ material_id, quantity, unit }`. |
| **Maliyet Kırılımı** | **Cost Breakdown** | Ürünün üretim maliyetini oluşturan hammadde, işçilik, genel gider kalemleri. |
| **Karlılık** | **Profitability** | Satış fiyatı - üretim maliyeti farkı ve marjı. |
| **MOQ** | **Minimum Order Quantity** | Bir üründe kabul edilen minimum sipariş miktarı. Catalog BC'ye aittir. |
| **Aktif Ürün** | **Active Product** | Satışa açık, sipariş alınabilir ürün. Status: `active`. |
| **Pasif Ürün** | **Inactive Product** | Satıştan kaldırılmış ürün. Status: `inactive`. |

---

## 6. Purchasing — Satın Alma

### Terimler

| Terim (TR) | Terim (EN) | Açıklama |
|---|---|---|
| **Satın Alma Emri** | **PurchaseOrder** | Tedarikçiden hammadde veya ürün satın almak için oluşturulan belge. |
| **Satın Alma Kalemi** | **PurchaseOrderLine** | Satın alma emrindeki tek bir hammadde satırı. |
| **Mal Kabul** | **GoodsReceipt / Receipt** | Tedarikçiden gelen malların depoya girişinin kaydedilmesi. Kısmi kabul mümkündür. |
| **Hammadde** | **RawMaterial** | Üretimde kullanılan, satın alma yoluyla temin edilen girdi. Ürünlerden ayrı kataloglanır. |
| **Hammadde Kodu** | **Material Code** | Hammaddeyi benzersiz tanımlayan kod. |
| **Hammadde Tipi** | **MaterialType** | `plastic`, `chemical`, `packaging`, `metal`, `other`. |
| **Minimum Sipariş Miktarı** | **MinOrderQty** | Tedarikçinin kabul ettiği en az sipariş miktarı. |
| **Temin Süresi** | **Lead Time** | Siparişten teslimata kadar geçen gün sayısı. |
| **Tercihli Tedarikçi** | **Preferred Supplier** | Hammadde için varsayılan tedarikçi. |
| **Tedarikçi İadesi** | **PurchaseReturn** | Tedarikçiye geri gönderilen malların kaydı. |
| **Fatura Bilgisi** | **ReceiptInvoice** | Mal kabule eklenen tedarikçi fatura numarası ve PDF'i. |
| **Kaynak** | **Source** | Satın alma emrinin tetiklendiği kaynak: `manual`, `production`, `low_stock`. |

### Satın Alma Durumları (PurchaseOrderStatus)

| Durum | Açıklama | UI Rengi |
|---|---|---|
| `DRAFT` | Taslak | Gri |
| `CONFIRMED` | Onaylandı, tedarikçiye iletildi | Mavi |
| `PARTIALLY_RECEIVED` | Kısmi mal kabul yapıldı | Sarı |
| `RECEIVED` | Tüm mallar teslim alındı | Yeşil |
| `CANCELLED` | İptal edildi | Kırmızı |

---

## 7. Sales — Satış

### Terimler

| Terim (TR) | Terim (EN) | Açıklama |
|---|---|---|
| **Satış** | **Sale** | Müşteriye yapılan satış işlemi. Bir veya birden fazla sipariş kalemini kapsar. |
| **Satış Faturası** | **SalesInvoice** | Satışa bağlı olarak oluşturulan fatura belgesi. |
| **Tahsilat** | **Collection / Payment** | Müşteriden yapılan ödeme. Banka havalesi, nakit vb. |
| **Ödeme Vadesi** | **Payment Term** | Müşterinin ödeme yapması için tanınan gün sayısı. |
| **Kredi Limiti** | **Credit Limit** | Müşterinin borçlanabileceği maksimum tutar. |
| **İade Talebi** | **ReturnRequest** | Müşterinin satın aldığı ürünü geri iade etmek için açtığı talep. |

### Satış Durumları (SaleStatus)

| Durum | Açıklama | UI Rengi |
|---|---|---|
| `draft` | Taslak | Gri |
| `confirmed` | Onaylandı | Mavi |
| `invoiced` | Faturalandı | Yeşil |
| `paid` | Ödendi | Yeşil |
| `cancelled` | İptal edildi | Kırmızı |

### İade Talebi Durumları (ReturnRequestStatus)

| Durum | Açıklama |
|---|---|
| `pending` | Onay bekliyor |
| `approved` | Onaylandı |
| `rejected` | Reddedildi |
| `completed` | Tamamlandı (ürün geri alındı) |

---

## 8. Warehouse — Depo

### Terimler

| Terim (TR) | Terim (EN) | Açıklama |
|---|---|---|
| **Depo** | **Warehouse** | Stok tutulabilen fiziksel veya sanal konum. |
| **Mağaza** | **Store** | Satış noktası görevi gören depo tipi. |
| **Depo Transferi** | **StockTransfer** | İki depo arasında stok hareketi. `Kaynak → Hedef`. |
| **Transfer Kalemi** | **TransferLine** | Transfer emrindeki tek bir ürün satırı. |
| **Kaynak Depo** | **Source Warehouse** | Stokun çıktığı depo. |
| **Hedef Depo** | **Destination Warehouse** | Stokun gittiği depo. |
| **Sevk** | **Dispatch** | Malın kaynak depodan çıkarılması. Transfer `IN_TRANSIT`'e geçer. |
| **Teslim Alma** | **Receive** | Malın hedef depoya girişinin kaydedilmesi. |
| **Depo Tipi** | **WarehouseType** | `main` (ana depo), `store` (mağaza), `transit` (geçiş deposu). |

### Transfer Durumları (TransferStatus)

| Durum | Açıklama | UI Rengi |
|---|---|---|
| `DRAFT` | Taslak | Gri |
| `IN_TRANSIT` | Yolda — kaynak depodan çıktı | Mavi |
| `COMPLETED` | Tamamlandı — hedef depoya girdi | Yeşil |
| `CANCELLED` | İptal edildi (sadece DRAFT iken) | Kırmızı |

---

## 9. Accounting — Muhasebe

### Terimler

| Terim (TR) | Terim (EN) | Açıklama |
|---|---|---|
| **Cari Hesap** | **AccountingAccount** | Bir iş ortağının (müşteri/tedarikçi) borç-alacak kayıtlarını tutan hesap. |
| **Borç** | **Debit** | Hesaba yüklenen borç. Müşteri: fatura kesildiğinde; Tedarikçi: ödeme yapıldığında. |
| **Alacak** | **Credit** | Hesaptan düşülen alacak. Müşteri: tahsilat yapıldığında; Tedarikçi: mal alındığında. |
| **Bakiye** | **Balance** | `Toplam Borç - Toplam Alacak`. Negatif = alacaklı durum. |
| **Hareket** | **Transaction** | Her borç veya alacak kaydı. Değişmezdir. |
| **Vade Tarihi** | **Due Date** | Bir işlemin ödenmesi gereken son tarih. |
| **Vadesi Geçmiş** | **Overdue** | Vade tarihi geçmiş ve henüz ödenmemiş işlem. |
| **Yaşlandırma Raporu** | **Aging Report** | Vadesi geçmiş alacakları 30/60/90/90+ gün dilimlerine göre gösteren rapor. |
| **Ekstre** | **Statement** | Belirli bir dönemdeki tüm hareketleri listeleyen hesap özeti. |
| **Dondurulmuş Hesap** | **Frozen Account** | İşlem yapılamayan hesap. Status: `frozen`. |
| **İşlem Kaynağı** | **Transaction Source** | `invoice` (fatura), `payment` (ödeme), `return` (iade), `manual` (manuel). |

---

## 10. Customer — Müşteri / İş Ortağı

### Terimler

| Terim (TR) | Terim (EN) | Açıklama |
|---|---|---|
| **İş Ortağı** | **BusinessPartner** | Hem müşteri hem tedarikçi olabilen genel varlık. |
| **Müşteri** | **Customer** | Satış yapılan iş ortağı. |
| **Tedarikçi** | **Supplier** | Satın alma yapılan iş ortağı. |
| **Müşteri Rolü** | **CustomerRole** | BusinessPartner'a müşteri özelliği kazandıran ek bilgi seti (kredi limiti, ödeme vadesi, segment). |
| **Segment** | **Segment** | Müşteri sınıflandırması: `A` (premium), `B` (standart), `C` (küçük). |
| **Satış Temsilcisi** | **Sales Rep** | Müşteriye atanan kullanıcı. |
| **Temsil Eden** | **Assigned Rep** | `assigned_rep_id` ile tutulan kullanıcı referansı. |
| **Fatura Adresi** | **Billing Address** | Müşterinin fatura adresi. `street`, `district`, `city`, `postal`, `country` alanları. |
| **Aktif** | **Active** | Normal işlem yapılabilen iş ortağı. Status: `active`. |
| **Pasif** | **Inactive** | İşlemden kaldırılmış iş ortağı. Status: `inactive`. |

---

## 11. Platform — Çok Kiracılı Yönetim

### Terimler

| Terim (TR) | Terim (EN) | Açıklama |
|---|---|---|
| **Platform** | **Platform** | Tüm kiracıları yöneten üst katman. Ayrı bir API ve admin panel'i vardır. |
| **Platform Admin** | **Platform Admin** | Platform düzeyinde tam yetkili kullanıcı. Statik token ile kimlik doğrular. |
| **Kiracı** | **Tenant** | Sistemi kullanan her bağımsız firma. `tenant_id` ile tanımlanır. |
| **Abonelik** | **Subscription** | Kiracının kullandığı plan ve ödeme döngüsü. |
| **Paket** | **Package** | Abonelik planı: `starter`, `professional`, `enterprise`. |
| **İmpersonation** | **Impersonation** | Platform admin'inin belirli bir kiracının ortamına geçici erişimi. Her işlem loglanır. |
| **Aktif Kiracı** | **Active Tenant** | Normal işlem yapabilen kiracı. Status: `active`. |
| **Askıya Alınmış** | **Suspended Tenant** | Geçici olarak erişimi kapatılmış kiracı. Status: `suspended`. |
| **İptal Edilmiş** | **Cancelled Tenant** | Aboneliği sonlandırılmış kiracı. Status: `cancelled`. |

---

## 12. Durum Geçiş Diyagramları

### Sipariş (CustomerOrder)

```
DRAFT ──── Onayla ────────────────────────────────► CONFIRMED
  │                                                     │
  │ İptal                                    Kısmi Karşıla
  ▼                                               │
CANCELLED ◄──── İptal ──── PARTIALLY_FULFILLED ◄──┘
                               │
                          Tamamla
                               │
                               ▼
                           FULFILLED
                               │
                           Sevk Et
                               │
                               ▼
                            SHIPPED
                               │
                         Teslim Edildi
                               │
                               ▼
                           DELIVERED
```

### Stok Rezervasyonu (StockReservation)

```
active ──► committed  (satış tamamlandı)
  │
  ├──► released    (sipariş iptal edildi)
  │
  └──► expired     (süre doldu, cron job)
```

### Depo Transferi (StockTransfer)

```
DRAFT ──► IN_TRANSIT ──► COMPLETED
  │
  └──► CANCELLED
```

### Satın Alma Emri (PurchaseOrder)

```
DRAFT ──► CONFIRMED ──► PARTIALLY_RECEIVED ──► RECEIVED
  │            │
  └────────────┴──► CANCELLED
```

---

## Önemli Kurallar

1. **Para tutarları string'dir.** `"1250.50"` — asla `1250.50` float.
2. **Quantity birim içerir.** `{ value: 500, unit: "kg" }` — sadece sayı değil.
3. **Status değerleri backend sabitiyle aynıdır.** `DRAFT`, `CONFIRMED` (büyük harf, Order); `active`, `reserved` (küçük harf, Reservation).
4. **Cross-BC referans sadece ID ile yapılır.** Order, Customer'ın `customer_id`'sini tutar; Customer aggregate'ini import etmez.
5. **Domain event isimleri `bc.event_name` formatındadır.** `order.confirmed`, `inventory.stock_reserved`.

---

*Son güncelleme: Haziran 2026*