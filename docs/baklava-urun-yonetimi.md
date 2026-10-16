# Baklava ürün yönetimi

## Kaynak ve mevcut veri

Kaynak: ÜRÜN LİSTESİ (100_BAKLAVALAR)(1).xlsx / 100_BAKLAVALAR. 30 ürün (17 fıstıklı, 13 cevizli), her ürün için XS, S, M, L, XL ve Porsiyon olmak üzere toplam 180 varyant satırı aktarılmıştır. SKU, dilim sayısı, gramaj ve 9 para biriminin fiyatları dosyadaki değerlerle korunur; yeniden fiyat veya kur hesabı yapılmaz.

Mevcut ürün anahtarları ve URL’leri korunmuştur. code ana ürün kodu, variants[].sku Excel’deki varyant SKU’sudur. Eski ana kodlar legacyCodes içinde bulunur. Varsayılan seçim defaultVariant: "XL" olarak korunmuştur. Varyant sırası XS, S, M, L, XL, Porsiyon şeklindedir. Porsiyonun teknik kodu porsiyon, etiketiyse Porsiyon’dur. Diğer boyutlar kendi adlarını kullanır.

## Düzenleme dosyaları

- public/assets/data/products/baklavalar/products.json: SKU, kanal bilgileri, görseller, varyantlar, dilim ve içerik adetleri.
- public/assets/data/products/baklavalar/prices.json: Her varyantın bağımsız para birimi fiyatları. base fiyatlar boştur; XL fiyatı diğer varyantlara aktarılmaz.
- public/assets/data/products/baklavalar/content/tr.json: İsim, açıklama, içerik, alerjen, saklama ve servis metinleri; diğer diller aynı klasördedir.
- public/assets/data/ui/product-page.json: Akordiyon ve tablo başlıkları.

## Dilim sayısı ve kutu içeriği

quantityUnit: "slice" tüm baklava varyantlarında porsiyon adedi yerine dilim sayısını gösterir. Varyantın sliceCount alanı sayı, "46/48" gibi kaynak metni veya null olabilir. Güncel dosyadaki 180 varyantın dilim sayısı ve gramajı doludur. XS/S/M/L/XL gramajları sırasıyla 500/900/1300/1800/2500 gramdır; Porsiyon gramajı ürüne göre değişir. Gelecekte eksik bırakılan değerler sıfıra çevrilmez.

Her varyantın boxContents listesinde görsel, isim ve adet tablosu bulunur:

~~~json
{"id":"baklava-1","productKey":"100-01-02-fistikli-baklava","image":"","quantity":"46/48"}
~~~

productKey katalogdaki ürün anahtarına bağlanır; isim seçili dilde katalogdan gelir. Karışık kutulara birden fazla satır eklenebilir. Harici ürün için productKey yerine name: {"tr":"Ürün adı","en":"Product name"} kullanılabilir.

image, assets/images/urunler/ altındaki ürün görselinin göreli yoludur. Örnek: baklavalar/100.0102.06.webp. Boşsa ürünün sliceImage alanı kullanılır; bu da boşsa görsel alanında mevcut yer tutucu gösterilir. Yüklenen 30 WebP fotoğrafı özgün SKU dosya adlarıyla bu klasöre eklenmiştir. Ana ürün görseli ve XL galerisinin yanında sliceImage alanına da bağlanır; böylece kutu içeriği tablosunda aynı ürünün fotoğrafı gösterilir. Farklı bir dilim görseli kullanmak için sliceImage veya satırın image alanını değiştirin.

sliceCount toplam dilim bilgisidir; boxContents[].quantity her çeşidin adedidir. Kaynak yalnızca toplamı verdiği için tek çeşit kutularda aynı değerle başlatılmıştır. Karışık kutularda toplamı ve satır adetlerini birlikte güncelleyin. null adet tabloda — görünür. enabled: false veya quantity: 0 satırı gizler. Boş [] liste akordiyonu gizler.

## Kargo paketine dahil olanlar

variants[].packageContents listesi varyanta özeldir. XL’de kolonyalı mendil, peçete ve HM 1864 Kürdan Bayrak adetlerinin her biri 8’dir. Güncel dosyada diğer boyutların yardımcı malzeme adetleri bulunmadığından XS/S/M/L için mevcut null değerler korunmuştur. Porsiyon satırları onlineSale: false ve commonMarket: true olarak aktarılır; mağazadan sipariş mesajı gösterilir ve kargo malzemeleri akordiyonu gizlenir (packageContents: []). Bir varyantın değerleri diğerine miras kalmaz.

~~~json
{"id":"napkin","name":{"tr":"Peçete","en":"Napkin"},"quantity":8}
~~~

Besin değerleri dosyada yer almadığı için eklenmemiştir. Mevcut ürün şablonunda bilgi girilince besin değeri akordiyonu otomatik görünür. Değişiklikler npm run build ile doğrulanır ve yeni dağıtıma dahil olur.
