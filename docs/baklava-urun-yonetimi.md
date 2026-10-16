# Baklava ürün yönetimi

## Kaynak ve mevcut veri

Kaynak: ÜRÜN LİSTESİ (100_BAKLAVALAR).xlsx / 100_BAKLAVALAR, 30 ürün (17 fıstıklı, 13 cevizli). Tüm satırlar XL varyantıdır. 9 para biriminin fiyatları doğrudan dosyadan aktarılmıştır; kur hesabı yapılmaz. Kaynak SKU son ekleri (cevizlilerde .07–.18 dahil) aynen korunur.

Mevcut ürün anahtarları ve URL'leri korunmuştur. code güncel ana ürün kodu, variants[].sku Excel'deki varyant SKU'sudur. Eski kodlar legacyCodes içinde bulunur. XS/S/M/L varyantları korunmuştur; dosyada bulunmayan SKU, gramaj, fiyat ve adetler tahmin edilmemiştir. Varsayılan seçim defaultVariant: "XL" olduğundan ziyaretçi dolu varyantı görür.

## Düzenleme dosyaları

- public/assets/data/products/baklavalar/products.json: SKU, kanal bilgileri, görseller, varyantlar, dilim ve içerik adetleri.
- public/assets/data/products/baklavalar/prices.json: Her varyantın bağımsız para birimi fiyatları. base fiyatlar boştur; XL fiyatı diğer varyantlara aktarılmaz.
- public/assets/data/products/baklavalar/content/tr.json: İsim, açıklama, içerik, alerjen, saklama ve servis metinleri; diğer diller aynı klasördedir.
- public/assets/data/ui/product-page.json: Akordiyon ve tablo başlıkları.

## Dilim sayısı ve kutu içeriği

quantityUnit: "slice" porsiyon yerine dilim sayısını gösterir. Varyantın sliceCount alanı sayı, "46/48" gibi kaynak metni veya null olabilir. 14 ürünün XL dilim bilgisi dolu, 16'sının bilgisi kaynakta boştur. Eksik değer sıfır olarak gösterilmez.

Her varyantın boxContents listesinde görsel, isim ve adet tablosu bulunur:

~~~json
{"id":"baklava-1","productKey":"100-01-02-fistikli-baklava","image":"","quantity":"46/48"}
~~~

productKey katalogdaki ürün anahtarına bağlanır; isim seçili dilde katalogdan gelir. Karışık kutulara birden fazla satır eklenebilir. Harici ürün için productKey yerine name: {"tr":"Ürün adı","en":"Product name"} kullanılabilir.

image, assets/images/urunler/ altındaki gerçek dilim görselinin göreli yoludur. Örnek: baklavalar/fistikli-baklava-dilim.png. Boşsa ürünün sliceImage alanı kullanılır; bu da boşsa görsel alanında mevcut yer tutucu gösterilir. Excel'de veya depoda baklava dilimi görselleri bulunmadığından gerçek görsel uydurulmamıştır. Yeni görselleri ilgili klasöre ekleyip yolu tanımlayın.

sliceCount toplam dilim bilgisidir; boxContents[].quantity her çeşidin adedidir. Kaynak yalnızca toplamı verdiği için tek çeşit kutularda aynı değerle başlatılmıştır. Karışık kutularda toplamı ve satır adetlerini birlikte güncelleyin. null adet tabloda — görünür. enabled: false veya quantity: 0 satırı gizler. Boş [] liste akordiyonu gizler.

## Kargo paketine dahil olanlar

variants[].packageContents listesi varyanta özeldir. XL'de kolonyalı mendil, peçete ve HM 1864 Kürdan Bayrak adetlerinin her biri 8'dir. XS/S/M/L için adetler null bırakılmıştır; gerçek sayıları bu alanlara girin. Bir varyantın değerleri diğerine miras kalmaz.

~~~json
{"id":"napkin","name":{"tr":"Peçete","en":"Napkin"},"quantity":8}
~~~

Besin değerleri dosyada yer almadığı için eklenmemiştir. Mevcut ürün şablonunda bilgi girilince besin değeri akordiyonu otomatik görünür. Değişiklikler npm run build ile doğrulanır ve yeni dağıtıma dahil olur.
