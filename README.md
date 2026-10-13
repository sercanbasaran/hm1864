# Hafız Mustafa 1864 — React mağaza arayüzü

React 19 / Vite 8 ile hazırlanmış mağaza ön yüzü. 164 ürün, eski bağlantılar dahil 402 doğrudan sayfa adresi ve bölge/ülke/dil/para birimi seçimi içerir. Ürünler ana kategori bazında düzenlenir; alt kategoriler ayrıca dosyalara bölünmez.

## Yerel çalıştırma

Node.js 22 kullanın. Proje kökünde:

```bash
npm install
npm run dev
```

Terminaldeki Local adresini açın. JSON dosyalarını kaydedince yerel sayfa yeniden yüklenir. `npm run build` yayın dosyalarını `dist/` içine üretir. `npm run preview` yayın çıktısını yerelde gösterir. `npm test` veri/yönlendirme/etkileşim kontrollerini çalıştırır.

## İçerik girişinde hangi dosya düzenlenecek?

Tüm düzenlenebilir veriler `public/assets/data/` altındadır:

| İşlem | Dosya |
| --- | --- |
| Ana/alt kategori, menü görünürlüğü ve sıralama | `catalog/categories.json` |
| Kategori dosyalarının kaydı | `catalog/manifest.json` |
| Pastaların kimlikleri, URL'leri, SKU'ları, satış kanalları, görselleri | `products/pastalar/products.json` |
| Pastaların tüm para birimlerinde fiyatları | `products/pastalar/prices.json` |
| Pastaların Türkçe ürün/varyant metinleri | `products/pastalar/content/tr.json` |
| Pastaların İngilizce ürün/varyant metinleri | `products/pastalar/content/en.json` |
| Diğer ürün grupları | `products/<kategori>/` altında aynı düzen |
| Header, tüm diller birlikte | `ui/header.json` |
| Footer, tüm diller birlikte | `ui/footer.json` |
| Ürün sayfası sabit metinleri, tüm diller birlikte | `ui/product-page.json` |
| Ana sayfa / mağazalar / pencereler / sayfa başlıkları / ortak metinler | `ui/home.json`, `ui/stores.json`, `ui/dialogs.json`, `ui/pages.json`, `ui/common.json` |
| Pazar grubu, ülke, varsayılan dil ve para birimi | `settings/regions.json` |
| Dil kodları ve seçimde görünen dil adları | `settings/languages.json` |
| Sipariş platformlarının adı, logo yolu ve URL'si | `settings/order-platforms.json` |

Her ana kategori için 1 ürün dosyası, 1 fiyat dosyası ve 14 dil içerik dosyası vardır. Ürün başına dosya oluşturulmaz. UI'da dil klasörü bulunmaz; her metin aynı dosyada `tr`, `en`, `ar` ve diğer dil alanlarını içerir. Boş çeviri Türkçe kaynağı korur. Çeviri dosyasında fiyat, stok, SKU veya kategori ilişkisi kopyalanmaz. Çevirisi henüz girilmemiş dosyalarda ürün/varyant kimlikleri ve boş nesneler hazırdır; alan adlarını Türkçe dosyadaki örnekten ekleyebilirsiniz. Boş metinleri yüzlerce kez kopyalamak gerekmez.

Eski birleşik `products.json`, `content.json` ve `regions.json` artık düzenleme kaynağı değildir. `src/data-loader.js` kategori dosyalarını ürün kimliği ve varyant koduna göre birleştirir; fiyat ve içerik eşleşmelerini doğrular. Vite derlemede `dist/assets/data/runtime.json` üretir. Yerel geliştirmede aynı adres otomatik oluşturulur. Bu dosya **üretilmiş çıktıdır; elle düzenlemeyin**. Ürün listeleri ve kategori üyelikleri otomatik hazırlanır, ikinci bir dosyada aynı ürün listesi elle tutulmaz.

Ürünün `key` değerini ve varyantın `code` değerini çeviri veya isim değiştirirken değiştirmeyin. Gerçek SKU `variants[].sku` alanındadır. Kategori/alt kategori bağları `categoryId` ve `subcategoryId` üzerinden kurulur; görünen isim değişince bağlar bozulmaz. Yeni URL için `src/routes.json` kaydını da ekleyin. Eski ürün bağlantıları mevcut ürün kimliği üzerinden çalışmaya devam eder.

## Ürün hikâyesi ve kutunun yeniden kullanımı

Her üründe iki statik şablon vardır: `story` ve `boxReuse`. Her biri bir görsel, başlık ve birkaç paragraftan oluşur. Buton, akordiyon, popup veya başka etkileşim içermez. Masaüstünde iki sütun; mobilde görsel ve metin alt alta gösterilir. Boş alanlarda içerik/görsel bekleniyor mesajı çıkar; ürün hakkında metin uydurulmaz.

Örneğin Lotus Kulesi'nin `products/pastalar/products.json` içindeki ürün kaydında görselleri düzenleyin:

```json
"editorial": [
  {"type": "story", "enabled": true, "image": "/assets/images/medya/lotus-hikaye.jpg"},
  {"type": "boxReuse", "enabled": true, "image": "/assets/images/medya/lotus-kutu-kullanimi.jpg"}
]
```

Aynı ürünün `products/pastalar/content/tr.json` dosyasındaki `products["500-0101-lotus-kulesi"].editorial` alanını doldurun:

```json
"editorial": {
  "story": {
    "title": "Ürüne özel hikâye başlığı",
    "imageAlt": "Hikâye görselinin açıklaması",
    "paragraphs": ["Birinci paragraf", "İkinci paragraf", "Üçüncü paragraf"]
  },
  "boxReuse": {
    "title": "Kutunun ikinci hayatı",
    "imageAlt": "Kutu kullanım görselinin açıklaması",
    "paragraphs": ["Birinci paragraf", "İkinci paragraf", "Üçüncü paragraf"]
  }
}
```

Diğer diller için aynı ürün kimliğini ilgili dil dosyasında düzenleyin. İstediğiniz kadar paragraf ekleyebilirsiniz. Alanı tamamen gizlemek için ürün dosyasında ilgili bölümün `enabled` değerini `false` yapın. Görsel bilgisi ürün dosyasında tek kez tutulur; başlık, görsel açıklaması ve paragraflar dil dosyalarındadır.

## Fiyat, satış kanalı ve pasta verileri

`prices.json` içindeki `products[ürünKey].base` temel fiyatları, `variants[varyantCode]` varyant fiyatlarını tutar. Para birimi anahtarları: TRY, USD, EUR, AED, GBP, DKK, SEK, CNY, JPY. Tutarları sayı olarak girin (örneğin `1999` veya `1999.50`); sembol/binlik ayırıcı kullanmayın. Bilinmeyen fiyat `null` kalır, `0` geçerli fiyat olarak korunur. Otomatik kur dönüşümü yoktur. Varyantın yabancı para birimi fiyatı yoksa başka varyantın/ürünün fiyatı kullanılmaz.

Pasta kaynak dosyasından 18 ürün, 36 Dilim/Baton varyantı ve 8 alt kategori aktarılmıştır. Yalnızca İÇİNDEKİLER KISA kullanılır; FULL aktarılmamıştır. Porsiyon, gramaj, alerjen, servis ve muhafaza metinleri dil dosyasının `variants[varyantCode]` alanındadır. Kaynakta olmayan açıklama, görsel, stok, besin değeri, teslimat ve ambalaj bilgileri boş bırakılmıştır. Dilim ve Baton fiyatları kaynakta eşittir; tutarlar değiştirilmemiştir.

`onlineSale: false` ve `commonMarket: true` seçili varyantı katalogda gösterir, satın alma alanını kaldırır ve mağaza/platform sipariş notunu gösterir. İki bayrak da false ise ürün çevrimiçi katalogda gizlenir. Tanımsız bayraklar önceki ürünlerin görünürlüğünü değiştirmez. Platform `url` alanı boşsa logo bilgi olarak gösterilir; doğrulanmış URL eklendiğinde bağlantıya dönüşür.

Logo kaynakları: Uber Eats: Simple Icons (https://github.com/simple-icons/simple-icons). Yemeksepeti simgesi: Arcticons (https://github.com/Arcticons-Team/Arcticons), CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/); kırmızı zemin eklendi.

## Menü, pazar ve diller

Ana kategorilerin `megaMenuOnline` değeri online/mobil menü görünürlüğünü, `highlightOnHeader` değeri altın kategori barındaki görünürlüğünü belirler. Alt kategorilerin `megaMenuOnline` değeri online/mobil menü görünürlüğünü belirler. JSON `true`/`false` kullanılır. Mağaza Menü tüm kategorileri gösterir. Header sırası kategori listesi sırasıdır.

Matris: 16 pazar grubu, 34 ülke seçeneği, 14 dil ve 9 para birimi. Ülke seçimi varsayılan dil ve para birimini getirir; kullanıcı ikisini bağımsız değiştirebilir. Eski tercihler korunur. Matris dışında ülke adı girilebilir. Norveç için kaynak matriste NOK bulunmadığından EUR varsayılandır. Bu yapı teslimat/vergi/ödeme entegrasyonu değildir.

`markets` yoksa kayıt tüm pazarlarda görünür; varsa ülke kodu (`AE`) veya pazar kimliği (`gcc`) ile sınırlanır. Dil kodları: tr, en, ar, de, fr, it, es, ru, zh-CN, ja, hi, ur, fa, pt. Arapça/Farsça/Urduca'da yazı yönü RTL olur. Çeviri yoksa Türkçe kullanılır; yeni diller için onaylı çeviriler ayrıca girilmelidir. URL'ler dil değişiminde sabit kalır.

## Netlify yayını

`npm run build` sonrasında oluşan `dist/` klasörünü Netlify projesinin Deploys alanına yükleyin. Kaynak `public/` klasörünü veya `index.html` dosyasını tek başına yüklemeyin. GitHub bağlantılı Netlify projesinde `netlify.toml` build=`npm run build`, publish=`dist`, Node=22 olarak tanımlıdır.

Ödeme/sipariş, hesap ve canlı stok sunucu bağlantısı gerektirir; ön yüzde gerçek işlem yapılmaz. Önizleme için `noindex,nofollow` etiketi korunur.

## Varyant görselleri, içerik görünürlüğü ve mağaza popup'ı

Kategori `products.json` dosyasında her varyantın `images` alanı bir görsel listesi alır. Örneğin `"images": ["pastalar/500_0101_01.png", "pastalar/lotus-dilim-2.png"]`. Dosyalar `public/assets/images/urunler/` altında bulunmalıdır. Varyant değişince ana görsel, galeri ve büyütme görseli aynı varyantı izler. Liste boşsa ürünün genel `images` listesi kullanılır. Dilim için yüklenen mevcut pasta görselleri ilk varyantlara bağlanmıştır; Baton görselleri henüz girilmediği için genel görsele döner.

Hikâye ve kutu bölümünü ürünün `editorial` listesinde ilgili `type` için `enabled: true` veya `enabled: false` ile açıp kapatın. Bu ayar kategori ürün dosyasında tek kez tutulur; dile göre içerik dosyalarına kopyalanmaz.

Ürün anahtarları güncel `code` ve ürün adından oluşturulmuştur; örneğin Son Aşk: `500-0304-son-ask`. Aynı anahtar fiyat dosyasında, tüm dil içeriklerinde ve route/şablon kayıtlarında eşleştirilmiştir. Eski URL'ler korunur; önceki anahtar `legacyKeys` içinde tutulur. SKU alanları değiştirilmemiştir.

Mağaza/platform sipariş alanının altındaki “Size en yakın mağazamız” butonu, mevcut mağaza bulucuyu modal içinde açar. Ülke ve mağaza adı filtreleri, telefon ve detay bağlantıları aynı kaynak şablonunu kullanır. Gerçek mesafe sıralaması için mağaza koordinatları ve konum verisi ayrıca gerekir; mevcut yapıda mağazalar ülke/ad ile bulunur.

## JSON metinlerinde biçimlendirme

Ürün içerikleri, hikâye/kutu paragrafları, ürün/varyant adları ve UI şablon metinlerinde şu satır içi etiketler desteklenir: `<strong>`, `<b>`, `<br>`, `<em>`, `<i>`, `<u>`, `<s>`, `<small>`, `<mark>`, `<sup>`, `<sub>`. Örnek:

```json
"ingredients": "<strong>İçindekiler:</strong> Pandispanya, pasta kreması.<br><b>Alerjen bilgisi</b> ayrı alanda gösterilir."
```

Aynı biçimlendirme diğer dil dosyalarındaki metinlerde de kullanılabilir. Hikâye bölümünde ayrı paragraflar için `paragraphs` listesini, aynı paragraf içindeki satır geçişi için `<br>` kullanın. Ek HTML özellikleri (`class`, `style`, `onclick` vb.) aktarılmaz. Script, iframe, görsel veya form eklemek için bu metin alanları kullanılmaz; görseller ürünün ilgili görsel alanından yönetilir. İçerik, izin verilen etiketlerle React öğelerine dönüştürülür; kaynak HTML doğrudan sayfaya eklenmez.

## Sayfa ve bileşen düzenleme rehberi

`src/main.jsx` yalnızca React uygulamasını başlatır. `src/App.jsx` ortak yerleşimi ve uygulama durumunu bağlar. Görünüm değişikliklerini aşağıdaki dosyalarda yapın:

| Düzenlenecek alan | Dosya |
| --- | --- |
| Ürün detay sayfası | `src/pages/ProductPage.jsx` |
| Kategori ve alt kategori sayfası | `src/pages/CategoryPage.jsx` |
| Tüm ürün kategorileri | `src/pages/ProductsPage.jsx` |
| Anasayfa | `src/pages/HomePage.jsx`, `src/templates/home.json` |
| Mağazalar sayfası | `src/pages/StoresPage.jsx` |
| Site haritası | `src/pages/SitemapPage.jsx` |
| Boş / bulunamadı / erişilemeyen sayfalar | `src/pages/PlaceholderPage.jsx` |
| Header ve mega menü | `src/components/layout/Header.jsx` |
| Footer | `src/components/layout/Footer.jsx`, `src/templates/footer.json` |
| Ürün görsel galerisi | `src/components/products/ProductGallery.jsx` |
| Ürün kartı | `src/components/products/ProductCard.jsx` |
| Ürün hikâyesi ve kutunun ikinci hayatı | `src/components/products/EditorialSections.jsx` |
| Mağaza/platform sipariş alanı | `src/components/products/OrderAvailability.jsx` |
| Mağaza bulucu ve mağaza şablonları | `src/components/stores/StoreLocator.jsx`, `src/templates/stores.json` |
| Popup çerçevesi ve açılıp kapanması | `src/components/dialogs/Dialogs.jsx` |
| Popup içerikleri | `src/components/dialogs/SearchContent.jsx`, `ProfileContent.jsx`, `MobileMenuContent.jsx`, `CartContent.jsx`, `RegionForm.jsx` |
| Anasayfa slider'ı | `src/components/home/HeroSlider.jsx` |
| Sayfa türüne göre şablon seçimi | `src/routing/PageRouter.jsx` |

İşlevler `src/hooks/` altında ayrılmıştır: `useCatalog` veri yükleme ve bölgesel katalog; `useNavigation` sayfa geçişleri; `useResolvedRoute` adres ve sayfa başlığı; `useDocumentLocale` dil ve yazı yönü; `useText` çeviri; `usePrice` para birimi; `useProductDetails` varyant, galeri, miktar ve ilgili ürünler; `useDialogState` popup form durumları.

Ortak uygulama bağlamı `src/context/AppContext.jsx`, yerel kayıt ve URL/şablon yardımcıları `src/utils/` altındadır. JSON sayfa ağaçlarını React bileşenlerine dönüştüren kod `src/components/templates/TemplateRenderer.jsx` dosyasındadır; akordiyon ayrı `Disclosure.jsx` bileşenidir. `src/templates/header.json` eski kaynak şablonudur; aktif header düzenlemeleri `Header.jsx` üzerinde yapılır.

Ürün, fiyat, varyant ve çok dilli içerik girişleri mevcut `public/assets/data/` dosyalarından yapılmaya devam eder. Şablon dosyaları görünümü, JSON içerik dosyaları metinleri yönetir. Genel CSS `src/style.css` dosyasındadır.

## Breadcrumb hiyerarşisi

Breadcrumb tüm sayfalarda `src/App.jsx` içinde bir kez gösterilir. Hiyerarşi `src/routing/breadcrumbs.js`, görünüm `src/components/Breadcrumb.jsx` dosyasından düzenlenir. Ürünler için kategori/alt kategori kimlikleri kullanılır: Anasayfa > Ürün grubu > Ürün alt grubu > Ürün. Kategori sayfasında yol kategoriye, alt kategori sayfasında alt kategoriye kadar gösterilir. Diğer sayfaların üst seviyeleri `src/routes.json` site haritasındaki mevcut üst sayfalardan alınır. Anasayfada breadcrumb gösterilmez. Etiketler seçilen dile göre gösterilir; son öğe bağlantısızdır ve `aria-current="page"` ile belirtilir.

## Pasta içerik güncellemesi — 13 Ekim 2026

Son pasta listesiyle 18 ürün / 36 SKU eşleştirilmiştir. Türkçe açıklamalar, kısa içerikler, alerjen, saklama, servis, uzun muhafaza, porsiyon/gramaj bilgileri ve dokuz para birimindeki varyant fiyatları güncellenmiştir. Kaynakta mevcut 17 ürünün 100 g besin/enerji bilgisi tabloya aktarılmıştır; İstanbul Hikayesi'nin iki varyantında kaynak alan boş olduğundan değer eklenmemiştir. Uzun içerik alanı kullanılmamıştır. Ürün/varyant görselleri, SKU'lar, anahtarlar, sayfa yolları ve kategori yapısı korunmuştur.

## Trileçe veri standardı — 13 Ekim 2026

Trileçeler pasta kategorisiyle aynı kategori bazlı dosya düzenini kullanır: `products/trileceler/products.json`, `prices.json` ve `content/<dil>.json`. Beş ürün kaynak SKU'larıyla (`700-01-01`–`700-01-05`) ve birer `porsiyon` varyantıyla güncellenmiştir. Mevcut ürün URL'leri korunur; önceki `600-03-*` anahtarları `legacyKeys` alanındadır.

Görselleri `public/assets/images/urunler/trileceler/` klasörüne yükleyin. Örneğin ilgili varyantta `"images": ["trileceler/ahududulu-trilece.png"]` kullanın. Başlangıçta ürün ve varyant görselleri boştur.

Türkçe içerikler kaynak tablodan alınmıştır; diğer 13 dil dosyasında aynı ürün/varyant alanları hazırlanmıştır. Besin tablosu ve isteğe bağlı `nutrition.note` alanı güncel Türkçe içerik dosyasına göre gösterilir. Online satış kapalı, ortak pazar açık olduğundan ürünler mağaza/platform sipariş alanını kullanır.

## Besin ve alerjen çevirileri

Dil içerik dosyalarında metin alanlarının yanında `nutrition` nesnesi ve `allergens` metin listesi desteklenir. Besin nesnesinde `basis` metni, `values` listesi ve isteğe bağlı `summary` / `note` metinleri bulunur. Her tablo satırı `name`, `value` ve `unit` alanlarını kullanır; değer metin, sonlu sayı veya `null` olabilir. Dolu besin çevirileri seçilen dilde gösterilir; tamamen boş nesneler mevcut kaynak değerlerine geri döner.

Çeviri doğrulama hataları artık ürün/kategori anahtarı, dil ve hatalı alanı belirtir; örneğin `500-0101-lotus-kulesi/en/nutrition`. Yapısı geçersiz tablolar veya tanımlanmamış alanlar kabul edilmez.


## Trileçe çevirileri

Güncel `tr.json` referansıyla beş trileçe ürününün içerikleri İngilizce, Arapça, Almanca, Fransızca, İspanyolca, İtalyanca, Portekizce, Rusça, Farsça, Hintçe, Urduca, Çince ve Japoncaya çevrilmiştir. Ürün ve varyant metinleri ayrı ayrı kaynak alanlarıyla eşleştirilir; HTML biçimlendirme etiketleri, besin değerleri/birimleri, ürün anahtarları ve boş alanlar korunur.


## Muhallebi ürünleri

Güncel kaynak tablodaki 21 muhallebi ürünü dört alt kategoride, birer `porsiyon` varyantıyla tanımlıdır. SKU, ürün anahtarı ve görsel adı kaynak ürün koduyla eşleşir. Önceki URL’ler korunur; değişen anahtarlar `legacyKeys` ile izlenebilir. Görseller `public/assets/images/urunler/muhallebiler/` altında WebP olarak bulunur.

Ürün metinleri, alerjen/saklama bilgileri, besin tabloları ve kategori adları 14 dilde hazırlanmıştır. Kaynakta boş olan içerik/alerjen alanları boş tutulur (Fıstıklı Kazandibi, Safranlı Kazandibi, Damla Sakızlı Kazandibi ve Lotuslu Kaşık Pasta). Belirtilmemiş besin değerleri `null` olarak saklanır; sıfır kabul edilmez. Online satış kapalı ve ortak pazar açık ürünler mevcut mağaza/platform sipariş alanını kullanır.

## Hikâye ve kutu bölümlerinin görünürlüğü

Kategori `products.json` dosyasındaki `editorial` listesinde her bölüm `enabled: true/false` ile yönetilir. `false` bölümü her zaman gizler. `true` olan bölüm, seçilen dilde (ve kaynak dildeki geri dönüşte) gerçek bir başlık, paragraf veya görsel varsa gösterilir. Boş alanlar, varsayılan bölüm başlıkları, Lorem ipsum/dummy metinleri ve görsel bekleniyor dosyası içerik kabul edilmez. Boş iki bölüm varsa dış kapsayıcı da oluşturulmaz. Eksik metin ve görsel için dummy alan gösterilmez.

Görünürlük kuralları `src/utils/editorial.js`, bölüm şablonu `src/components/products/EditorialSections.jsx` dosyasındadır. Başlık ve paragraflar ilgili kategorinin `content/<dil>.json` dosyasında, görsel ve `enabled` alanı `products.json` dosyasında düzenlenir.

## Ürüne ve dile özel bölüm verileri

Her ürünün content/<dil>.json kaydındaki editorial.story ve editorial.boxReuse bölümleri bağımsızdır. İkisinde de title, image, imageAlt, paragraphs alanları kullanılabilir. Örneğin aynı ürünün Türkçe ve İngilizce dosyalarında ayrı başlık, görsel, açıklama ve paragraflar yazabilirsiniz. Bölümlerin enabled ayarı kategori products.json dosyasındaki ilgili ürünün editorial listesinde kalır.

Dil dosyasındaki dolu image alanı ortak ürün görselini geçersiz kılar; boş bırakılırsa Türkçe/ortak görsel kullanılır. Metinlerde de boş çeviriler kaynak içeriklere döner. Bu bölümlerin verileri başka bir ürünle paylaşılmaz.

## Ürün accordion görünürlüğü

Ürün detayındaki accordion'lar yalnızca gerçek içerik varsa gösterilir. Boş alanlar, Lorem ipsum/dummy metinleri ve tüm dillerdeki bilgi eklenecek mesajları gizlenir. İçerik ve alerjen başlığı altında yalnızca dolu alanlar görünür. Besin tablosunda sayısal sıfır geçerli veridir; null/boş/dummy satırlar gösterilmez. Başlıklar varyant ve dil seçimine göre yeniden değerlendirilir.

Şablon: src/components/products/ProductAccordions.jsx. İçerik kontrolü: src/utils/product-content.js.
