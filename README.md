# Hafız Mustafa 1864 — React mağaza arayüzü

Mevcut mağaza arayüzünün React 19 ve Vite 8 ile hazırlanmış, mobil uyumlu ön yüzüdür. Ürün ve kategori sayfaları tek katalog verisinden oluşturulur. Eski `.html` adresleri de doğrudan açılabilir.

## Yerel çalıştırma

Node.js 20.19+ veya 22.12+ gereklidir.

```bash
npm install
npm run dev
```

Terminalde gösterilen yerel adrese gidin. Yayın dosyalarını üretmek için `npm run build`, sonucu yerel sunucuda görmek için `npm run preview` komutunu kullanın. `dist/` klasörünü sitenin köküne yükleyin; doğrudan `.html` bağlantıları için sunucunun bu dosyaları ve `/assets/` yolunu servis etmesi gerekir. `dist/` paket içinde hazır olarak da bulunur.

## Katalog ve sayfalar

- `public/assets/data/products.json`: ürün adı, kodu, kategori, URL, açıklama, görsel, fiyat, stok, varyant, alerjen ve besin bilgileri için tek kaynak. Eksik alanlarda arayüz “bilgi eklenecek” mesajı gösterir. Doğrulanmamış fiyat, içerik veya besin değeri üretilmemiştir.
- `categories` listesindeki `megaMenuOnline` alanı kategorinin **Online Menü** ve mobil menüde görünmesini, `highlightOnHeader` alanı üstteki altın kategori barında ayrıca gösterilmesini belirler. `subcategories` listesindeki `megaMenuOnline` alt kategorinin Online Menü ve mobil menüde görünmesini belirler. Her alan JSON `true`/`false` değerini alır; örneğin `"megaMenuOnline": true`. Üst bardaki sıralama `categories` listesinin sırasını izler. `highlightOnHeader: true` için aynı kategoride `megaMenuOnline: true` olmalıdır. **Mağaza Menü** sekmesi tüm kategorileri göstermeye devam eder. Bu alanlar ürün sayfalarını silmez veya gizlemez.
- `src/model.js`: katalog normalizasyonu, arama ve URL eşlemesi.
- `src/main.jsx`: React bileşenleri, sayfa şablonları ve etkileşimler.
- `src/style.css`: tasarım ve responsive stiller.
- `src/routes.json`: önceki site haritasındaki sayfa adresleri. İçeriği olmayan sayfalarda header/footer ve “İçerik eklenecek” alanı bulunur.
- `scripts/routes.mjs`: derleme sonrasında eski `.html` adresleri için doğrudan giriş dosyaları üretir.

Katalog verisini değiştirdikten sonra `npm run build` çalıştırın. Yeni URL eklediğinizde `src/routes.json` eşlemesini de tamamlayın. Ürün görselleri `public/assets/images/urunler/`, diğer görseller `public/assets/images/medya/` altındadır.

## Bölge, ülke, dil ve para birimi matrisi

İlk ziyarette pazar grubu → ülke → dil → para birimi seçilir; seçim yapılana kadar pencere kapatılamaz. Header'dan değiştirilebilir ve tarayıcıda saklanır. `public/assets/data/regions.json` (`schemaVersion: 2`) 16 pazar grubunu, 34 ülke seçeneğini, varsayılan dil/para birimini ve pazar için önerilen seçenekleri tanımlar. Ülke seçimi pazar grubunu belirler; grup değişiminde ilk ülke seçilir. Kullanıcı dili ve para birimini dilerse diğer tanımlı seçeneklerden bağımsız değiştirebilir. Önceden kaydedilmiş ülke/dil tercihi korunur; eksik para birimi ülke varsayılanıyla tamamlanır.

| Pazar grubu | Ülke seçenekleri | Önerilen diller | Para birimleri (ilk: grup varsayılanı) |
| --- | --- | --- | --- |
| Kuzey Amerika | ABD, Kanada | İngilizce | USD |
| İngiltere & Küresel | Birleşik Krallık, Avustralya, İrlanda | İngilizce | GBP, USD |
| Türkiye | Türkiye | Türkçe | TRY |
| Körfez Bölgesi (GCC) | BAE, Suudi Arabistan, Katar, Kuveyt | Arapça, İngilizce | AED, USD |
| Batı & Orta Avrupa | Almanya, Avusturya, İsviçre | Almanca | EUR |
| Batı Avrupa (Fransa) | Fransa, Belçika | Fransızca | EUR |
| Güney Avrupa (İtalya) | İtalya | İtalyanca | EUR |
| İspanya & Latin Amerika | İspanya, Meksika, Arjantin | İspanyolca | EUR, USD |
| Kuzey Avrupa (İskandinavya) | Danimarka, İsveç, Norveç, Finlandiya | İngilizce | EUR, DKK, SEK |
| Doğu Avrupa | Rusya, Azerbaycan, Kazakistan | Rusça | USD, EUR |
| Uzak Doğu (Çin) | Çin Anakarası, Hong Kong | Basitleştirilmiş Çince | CNY, USD |
| Uzak Doğu (Japonya) | Japonya | Japonca | JPY |
| Güney Asya | Hindistan, Pakistan | Hintçe, Urduca | USD |
| Orta Doğu (Farsça) | İran | Farsça | USD |
| Güney Amerika (Brezilya) | Brezilya | Portekizce | USD |
| Diğer Dünya Ülkeleri | Diğer ülke (adı girilir) | İngilizce | USD |

Birden çok para birimi olan gruplarda bazı ülkeler için tabloda verilen seçeneklerden ülke varsayılanı tanımlıdır: Avustralya/İrlanda USD; Suudi Arabistan/Katar/Kuveyt USD; Meksika/Arjantin USD; Danimarka DKK; İsveç SEK; Hong Kong USD. Pakistan varsayılan dili Urduca'dır. Norveç için verilen tabloda NOK bulunmadığı için EUR varsayılandır; iş kararı değişirse `regions.json` güncellenmelidir. Matris teslimat, vergi veya ödeme entegrasyonu anlamına gelmez.

Dil kodları (`tr`, `en`, `ar`, `de`, `fr`, `it`, `es`, `ru`, `zh-CN`, `ja`, `hi`, `ur`, `fa`, `pt`), ülke/grup adları ve arayüz metinleri `public/assets/data/content.json` içindedir. Yeni dil alanları çeviri girişi için boştur; çeviri tamamlanana kadar mevcut Türkçe metin gösterilir.

Yeni çeviri eklemek için `content.json` dosyasında ilgili anahtarın boş dil değerini doldurun; örneğin:

```json
"ui.countProducts": {
  "tr": "{count} ürün",
  "en": "{count} products",
  "ar": "{count} منتجات"
}
```

Sayfa metinleri `src/templates.json` içinde `@text:...` anahtarlarıyla, sayfa başlıkları `src/routes.json` içinde `titleKey` ile bağlanır. Görünen sabit bir metin eklerken önce `content.json` dosyasına bir anahtar ekleyin. Yeni dil için `languages` listesine kod ve ad ekleyip her `texts` kaydına aynı dil kodu için boş bir alan ekleyin. Boş bırakılan alanlarda Türkçe gösterilir.

Farklı para birimlerinde fiyatlar **kur çevirisiyle hesaplanmaz**. `products.json` içindeki ürünün mevcut `price` ve `currency` alanları temel fiyatı belirler. Başka para birimindeki onaylanmış fiyatı `pricesByCurrency` alanına sayı olarak yazın. Varyantlı üründe her varyantın ilgili para birimi fiyatını ayrıca ekleyin; varyant fiyatı eksikse yanlış tutar göstermek yerine fiyat bekleniyor mesajı görünür. `0` geçerli bir fiyattır; fiyatlar mevcut `price` alanındaki birimle (örneğin 1999.00) girilir. Örnek:

```json
{
  "price": 1999,
  "currency": "TRY",
  "pricesByCurrency": {"AED": 210, "GBP": 49},
  "variants": [
    {"code": "S", "price": 1999, "pricesByCurrency": {"AED": 210, "GBP": 49}},
    {"code": "L", "price": 2999, "pricesByCurrency": {"AED": 310, "GBP": 69}}
  ]
}
```

`products.json` içindeki bir ürün, kategori veya alt kategoriye isteğe bağlı `markets` ve `translations` eklenebilir:

```json
"markets": ["TR", "AE"],
"translations": {
  "en": { "name": "Approved English product name", "description": "Approved description" },
  "ar": { "name": "Approved Arabic product name" }
}
```

`markets` yoksa kayıt tüm bölgelerde görünür; varsa yalnızca listelenen ülke kodlarında (`AE`) veya pazar grubu kimliklerinde (`gcc`) görünür. Bölge değiştiğinde menü, kategori ve arama sonuçları aynı filtrelenmiş katalogdan üretilir. Çeviri yoksa mevcut Türkçe metin gösterilir. Ürün ve kategori URL'leri dil değişiminde aynı kalır. Sabit arayüz ve sayfa metinleri `public/assets/data/content.json` dosyasındaki `texts` alanından alınır; `languages` listesi seçilebilir dilleri belirler. Her metin anahtarında `languages` listesindeki 14 dilin alanı bulunur. Boş çeviri alanlarında Türkçe gösterilir. `src/i18n.js` yalnızca okuma ve geri dönüş mantığını içerir. Metinlerde `{count}`, `{name}` gibi yer tutucuları koruyun. Ürün ve kategori adları ile ürün açıklamalarının çevirileri `products.json` içindeki ilgili kaydın `translations.en` veya `translations.ar` alanına eklenir. Seçilen para biriminin fiyatı ürün verisinde yoksa fiyat eklenene kadar tutar gösterilmez.

## Etkileşimler ve sınırlar

Kategori menüleri, mobil menü, arama, filtreleme/sıralama, ürün varyantları, adet seçimi, akordiyonlar, bilgi pencereleri ve dört slaytlı, beş saniyede ilerleyen ana sayfa slider'ı çalışır. Ödeme/sipariş, kullanıcı hesabı ve canlı stok sunucu bağlantısı gerektirir; bu ön yüzde gerçek işlem yapılmaz. Kaynak görsel, fiyat veya besin verisi sağlanmayan ürünler yer tutucu ile görünür.

Doğrulama: `npm test` ve `npm run build`. Ayrıca doğrudan ürün URL'si, varyant seçimi, menü/pencere etkileşimi ve masaüstü/mobil görünüm gerçek tarayıcıda kontrol edilmiştir.

## Netlify'ye yükleme

Hızlı önizleme için ZIP'i açın; Netlify'de **Add new project → Deploy manually** bölümüne `hafiz-mustafa-react/dist` klasörünün kendisini sürükleyin. ZIP dosyasını veya `public` klasörünü yüklemeyin. Değişiklikleri yayınlamak için önce `npm run build` çalıştırıp güncel `dist` klasörünü aynı projenin **Deploys** alanına tekrar yükleyin.

Düzenli güncelleme için kaynak klasörünü bir Git deposuna aktarın ve Netlify'de depoyu bağlayın. Proje kökündeki `netlify.toml` derleme komutunu `npm run build`, yayın klasörünü `dist` ve Node sürümünü 22 olarak ayarlar. Netlify'nin varsayılan Pretty URLs işlemi `.html` adresini uzantısız hale getirirse React yönlendiricisi bu adresleri de eşler.

Bu pakette `noindex,nofollow` meta etiketi bulunur. Netlify adresiyle yalnızca önizleme yapılacaksa uygundur. Arama motorlarında listelenecek gerçek mağaza yayını öncesinde `index.html` içindeki bu etiketi ve sipariş/ödeme entegrasyonunu ayrıca ele alın.

## Pasta kataloğu (12 Ekim 2026)

`ÜRÜN LİSTESİ (500_PASTALAR).xlsx` kaynak dosyasından 18 ürün, 36 Dilim/Baton varyantı ve 8 alt kategori aktarıldı. SKU noktaları aynen korunur. Varyantın `onlineSale`, `commonMarket`, `portion`, `weight`, `price`, `pricesByCurrency`, `ingredients`, `allergenInfo`, `storage`, `servingSuggestion`, `longTermStorage` alanları kaynak satırından gelir. `ingredients` yalnızca İÇİNDEKİLER KISA alanıdır; FULL kullanılmaz. Kaynakta olmayan görsel, açıklama, stok, besin değeri, teslimat ve ambalaj bilgileri boş kalır. Dilim ve Baton fiyatları kaynakta eşittir; değişiklik yapılmamıştır.

`onlineSale: false` ve `commonMarket: true` ürünü katalogda gösterir; seçili varyantta satın alma alanını kaldırır ve mağaza/platform sipariş notunu gösterir. İki bayrak da false ise ürün çevrimiçi katalogdan gizlenir. Tanımsız bayraklar önceki ürünlerin görünürlüğünü değiştirmez.

Ürün ve alt kategori adları `translations.<dil>.name`; varyant metinleri `variants[].translations.<dil>` alanından okunur. Her varyantta `label`, `portion`, `weight`, `ingredients`, `allergenInfo`, `servingSuggestion`, `storage`, `longTermStorage`, `description`, `delivery`, `packaging` alanlarının 13 diğer dilde boş karşılıkları hazırdır. Boş çeviri Türkçe kaynak metni korur. Fiyatlar dil çevirisine girmez. Örnek: `variants[0].translations.en.ingredients`.

Platform adları, logoları ve sipariş bağlantıları `products.json` içindeki `orderPlatforms` listesindedir. Kaynakta bağlantı olmadığı için `url` boş bırakılmıştır; logo bilgi olarak gösterilir. Doğrulanmış mağaza/platform URL'si eklendiğinde logo bağlantıya dönüşür.

Logo kaynakları: Uber Eats: Simple Icons (https://github.com/simple-icons/simple-icons). Yemeksepeti simgesi: Arcticons (https://github.com/Arcticons-Team/Arcticons), CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/); kırmızı zemin eklendi.
