# Hafız Mustafa 1864 — React mağaza arayüzü

React 19 / Vite 8 ile hazırlanmış mağaza ön yüzü. 164 ürün, eski bağlantılar dahil 421 doğrudan sayfa adresi ve bölge/ülke/dil/para birimi seçimi içerir. Ürünler ana kategori bazında düzenlenir; alt kategoriler ayrıca dosyalara bölünmez.

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

## Mağaza bilgilerinin yönetimi

Mağaza bulucu, ürün sayfasındaki yakın mağaza penceresi ve mağaza detay sayfaları `public/assets/data/stores.json` dosyasından beslenir. Kaynak: https://online.hafizmustafa.com/subeler (13 Ekim 2026). Kurumsal kaynak (https://www.hafizmustafa.com/hm1864-subeler) ile birlikte 24 mağaza bulunur. Mall of the Emirates telefonu kurumsal kaynaktan tamamlanmıştır.

Yeni mağaza için `stores` dizisindeki bir kaydı kopyalayın:

- `id`: benzersiz adres kodu; örneğin `yeni-magaza`.
- `url`: `magazalar/yeni-magaza/index.html`. Build bu adresin HTML giriş dosyasını otomatik üretir. Yönlendirme dosyasına kayıt eklemeniz gerekmez.
- `country`, `city`, `phone`: ülke kodu, şehir ve telefon. Telefon yoksa boş bırakılabilir.
- `online`: mağazayı listede ve detay sayfasında göstermek için `true`; gizlemek için `false`. Ürün satış ayarı değildir.
- `image`: isteğe bağlı görselin `/assets/images/medya/...` yolu; boşsa fotoğraf gösterilmez.
- `mapQuery`: Google Maps konum aramasında kullanılacak mağaza adı ve tam adres. Koordinat veya API anahtarı gerekmez.
- `googleMapsUrl`: doğrulanmış Google Maps bağlantınız varsa girin; boşsa `mapQuery` ile yol tarifi bağlantısı oluşturulur.
- `products`, `features`: dosyanın `texts` alanındaki ürün ve hizmet anahtarları.
- `deliveryPlatforms`: mağazanın hizmet aldığı platform adları.
- `translations`: 14 dil için `name`, `address`, `hours` (kaynakta saat yoksa boş bırakın; detay sayfasında gösterilmez). Posta adresleri ve özel mağaza adları kaynak biçiminde korunur; saat açıklamaları çevrilmiştir.

Ortak mağaza başlıkları, ülke adları, ürün/hizmet metinleri ve butonlar aynı JSON’daki `texts` alanında, dil kodlarıyla tutulur. Yeni bir hizmet anahtarı eklediğinizde 14 dilde karşılığını da girin. Değişiklikten sonra `npm run build` ve `npm test` çalıştırın. Canlı yayın için değişiklikleri GitHub’a gönderin.

Haritalar Google Maps iframe’iyle yüklenir; Google’ın dış hizmetine erişim gerekir. Konumlar kaynak adresleriyle sorgulanır; doğrulanmamış koordinatlar eklenmemiştir.

### Mağaza fotoğraf galerisi

Her mağazanın `gallery` dizisine fotoğrafları sırasıyla ekleyin. `src` alanına `/assets/images/medya/magazalar/...` şeklinde yerel yol veya `https://...` görsel URL’si yazabilirsiniz. Fotoğrafların alternatif metni ve açıklaması aynı öğenin `translations` alanında tutulur:

```json
{
  "src": "/assets/images/medya/magazalar/tersane-01.webp",
  "translations": {
    "tr": { "alt": "Tersane İstanbul mağazası", "caption": "" },
    "en": { "alt": "Tersane Istanbul store", "caption": "" },
    "ar": { "alt": "متجر ترسانة إسطنبول", "caption": "" }
  }
}
```

Diğer dil kodlarını da aynı `translations` nesnesine ekleyebilirsiniz. Boş alternatif metin yerine o dildeki mağaza adı kullanılır. Boş açıklama gösterilmez. Galeri boşsa bölüm gizlenir; tek fotoğrafta geçiş ve önizleme düğmeleri gösterilmez. Birden fazla fotoğrafta önizlemeler, önceki/sonraki düğmeleri ve klavye okları çalışır. Ana fotoğrafa tıklama büyütme penceresini açar. Galeri bileşeni `src/components/stores/StoreGallery.jsx` içindedir.

Kurumsal mağaza listesi ve detay sayfalarından 40 mağaza fotoğrafı eşleştirildi; Google/Tripadvisor ikonları fotoğraf olarak alınmadı. Görseller resmi Wix CDN kaynağından yüklenir. `sourceUrl` fotoğrafın alındığı mağaza sayfasını belirtir. CDN görsellerinin genişliği en fazla 1400 piksele ayarlanmıştır; `originalSrc` özgün kaynak URL’sini saklar. Kaynakta yalnızca bir fotoğraf bulunan mağazalara ek fotoğraf uydurulmadı.

Florentia Village, Tersane İstanbul, Dubai JBR ve Souk Madinat Jumeirah kayıtlarında kaynakta çalışma saatleri/ürün/hizmet detayları olmadığı için bu alanlar boş bırakılmıştır. Nişantaşı gibi iki resmi kaynakta farklı yazılan telefon/adres alanları bu ekleme sırasında değiştirilmemiştir.

## Canlı Google işletme yorumları

Yorum bölümü Google Business Profile API’den sayfa açılışında alınır; yalnızca 5 yıldızlı ve metin içeren yorumlar gösterilir. En son güncellenenler önce gelir. En fazla 250 son yorum taranır ve `stores.json` içindeki `reviews.maxReviews` kadar yorum gösterilir (varsayılan 6, üst sınır 12). Yorumlar özgün dilinde kalır; bölüm başlıkları ve filtre açıklaması 14 dilde bulunur. API bağlantısı yoksa veya uygun yorum yoksa bölüm gizlenir. Sahte veya sabit yorum kullanılmaz.

### Canlıya bağlamak için

1. Google Cloud’da işletme hesabınız için Business Profile API erişimini açın. Google’ın proje erişim onayı gerekebilir. Business Profile Account Management API ve Business Profile Business Information API de mağaza listesinin alınması için etkin olmalıdır.
2. Mağazaları yöneten Google hesabıyla OAuth yetkilendirmesi yapın. Kapsam: `https://www.googleapis.com/auth/business.manage`; çevrimdışı erişimle refresh token alın.
3. Netlify → Project configuration → Environment variables bölümüne aşağıdakileri ekleyin. Bunları GitHub’a, JSON’a veya `VITE_` değişkenlerine yazmayın:
   - `GOOGLE_BUSINESS_CLIENT_ID`
   - `GOOGLE_BUSINESS_CLIENT_SECRET`
   - `GOOGLE_BUSINESS_REFRESH_TOKEN`
4. Her mağazanın `google.businessProfileLocation` alanına `accounts/ACCOUNT_ID/locations/LOCATION_ID` değerini ekleyin. `google.placeId` Google Maps kimliğidir; yorum kimliğiyle aynı değildir. `google.reviewsEnabled: false` ilgili mağazanın yorumlarını kapatır.
5. Değişiklikleri GitHub’a gönderip Netlify deploy yapın. `/.netlify/functions/store-reviews?store=porta-vadi` yanıtında `status: ready` görülmelidir. Yetki/API sorunu varsa `unavailable`, kimlik veya OAuth kurulumu eksikse `unconfigured` döner. API hata ayrıntıları ve token’lar ziyaretçilere verilmez.

Yerel geliştirmede Google değişkenlerini shell ortamında tanımlayıp `netlify dev` kullanın; yalnızca `npm run dev` Netlify fonksiyonunu çalıştırmaz. Token süresi sunucuda otomatik yenilenir. Yorumlar JSON’a, localStorage’a veya kalıcı önbelleğe kaydedilmez. Sayfayı tekrar açınca yeniden sorgulanır; sürekli polling yapılarak API kotası tüketilmez.

### Mağazaları işletme hesabından eşleştirme

Aynı üç ortam değişkeniyle `node scripts/google-store-sync.mjs` çalıştırın. Bu komut Google’daki işletmelerinizi **yalnızca okur**; Google üzerinde ekleme/değişiklik yapmaz.

- Eşleştirme kimlik, telefon veya tam mağaza adıyla yapılır. Birden fazla eşleşme varsa kayıt değiştirilmez ve rapora yazılır.
- Marka adı Hafız Mustafa olan, kalıcı kapalı olmayan ve kamuya açık adresi bulunan yeni kayıtlar önizlemeye eklenir.
- Rapor: `tmp/google-store-sync-report.json`; JSON önizlemesi: `tmp/stores.google-preview.json`.
- Önizlemeyi kontrol ettikten sonra `node scripts/google-store-sync.mjs --apply` ile JSON’u güncelleyin. Ardından `npm run build` ve `npm test` çalıştırın.
- Google’daki tüm Hafız Mustafa işletmeleri aynı hesapta yönetilmiyorsa diğer hesapları yöneten kullanıcıların erişimi de gerekir.

Galata Kuledibi açılışı markanın resmi duyurusuyla doğrulandı; Google işletme kimliği ve tam sokak adresi doğrulanamadığından `stores.json` içindeki `pendingStores` alanında tutulur ve yayınlanmaz. İşletme hesabı eşleştirmesi Galata kaydını doğruladığında bu taslağı gerçek bilgilerle tamamlayıp mağaza listesine taşır.

Google kaynakları: https://developers.google.com/my-business/reference/rest/v4/accounts.locations.reviews/list ve https://developers.google.com/my-business/reference/businessinformation/rest/v1/accounts.locations/list

## Kurumsal ve Asırlık Miras sayfaları

14 marka sayfası `public/assets/data/pages/kurumsal.json` ve `public/assets/data/pages/asirlik-miras.json` dosyalarından beslenir. Şablon: `src/pages/BrandPage.jsx`; alt bileşenler: `src/components/brand/`. Ana ve alt sayfalar aynı kaynaktan başlık, hero görseli, açıklama, bölüm içi gezinme ve ilgili sayfa bağlantıları alır.

Bölüm türleri: `prose`, `cards`, `timeline`, `documents`, `faq`, `gallery`, `people`. Bölüm `id` değeri sayfa içi bağlantının hedefidir; aynı sayfada benzersiz olmalıdır. Fotoğraflarda `src`, `alt`, `caption` düzenlenir. `gallery` görselleri büyütme penceresiyle açılır; tarihçe dönemlere göre, medya ve politika kartları etiketlere göre filtrelenir. Kartların `detail.paragraphs` alanı sayfa içinde açılan ayrıntı metinlerini tutar. `document` alanındaki `src`, `preview` ve `page` değerleri yerel PDF okuyucusunu ve büyütülebilir belge önizlemesini yönetir. Kariyer sayfası başvuru hazırlığı bilgilerini gösterir; başvuru bilgisi toplamaz. İçerik kartları yalnızca uygulama içi sayfalara bağlantı verebilir.

Türkçe, İngilizce ve Arapça içerikler hazırlanmıştır. Diğer 11 dilin alanları aynı JSON’da boş şablon olarak bulunur. `brandText` boş dil alanında İngilizce, ardından Türkçe içeriğe döner. Dil alanlarını doldurmak için ayrı çeviri dosyası gerekmiyor.

Kaynak kayıtları ziyaretçiye sunulmaz; yalnızca geliştiriciler için `docs/brand-content-provenance.json` içinde tutulur. Metinler resmi içeriklerin kısa editoryal özetleridir. Başkanın mesajı doğrudan alıntı olarak sunulmaz. Madalya toplamında kaynaklar arasında 11/12 farklılığı bulunduğundan kesin adet yayımlanmadı. Güncel olmayan toplam mağaza sayıları ve farklı tarihli sıralama iddiaları yeni kurumsal içeriklere alınmadı. Yönetim rolleri kaynakta doğrulanmış biçimde kullanılır; Eren Ongurlar için farklı tarihli unvanlar yerine genel Yönetim Kurulu ifadesi tercih edildi.

Marka adı görünen UI ve ürün metinlerinde Hafız Mustafa 1864 olarak standartlaştırıldı. Resmi şirket unvanları, URL’ler, ürün kodları ve gerçek arşiv görsellerindeki tarihi yazılar değiştirilmedi.

### Yeni görseller

Built-in imagegen ile iki kavramsal görsel üretildi; gerçek yönetici, fabrika veya arşiv fotoğrafı olarak sunulmaz. `generated: true` etiketi olan hero görsellerinde “Görsel yorum” notu gösterilir. Yeni dosyalar:

- `public/assets/images/medya/marka/ustalik.webp`: baklava, fıstık, bakır ve koyu ahşap üzerinden tatlıcılık ustalığı teması.
- `public/assets/images/medya/marka/mimari.webp`: çini, ahşap ve altın detaylar üzerinden mimari miras teması.

Her ikisi 1672×941 piksel; görsel içeriği değiştirmeden web için WebP biçiminde optimize edildi. Üretim istemleri ve kaynaklar `public/assets/data/pages/visuals.json` dosyasındadır. Yönetici portresi, tarihçe, madalya ve ödül görselleri resmi sitelerdeki gerçek arşivden yüklenir. Sertifika ve politika PDF’leri `public/assets/documents/kurumsal/` içinde tutulur; belgeler uygulamada okunur ve indirilebilir.

## Destek ve Sözleşme & Politikalar

15 yeni içerik sayfası mevcut sitemap ve footer bağlantılarına bağlandı. İçerikler `public/assets/data/pages/destek.json` (8 sayfa) ve `public/assets/data/pages/sozlesmeler.json` (7 sayfa) içindedir. Metinler Türkçe, İngilizce ve Arapça olarak aynı JSON alanlarında düzenlenir; diğer dil alanları mevcut fallback ile çalışır.

Soru-cevap bölümlerindeki `searchable: true` yerel aramayı açar. `contacts` bölümündeki `email`, `phone` ve `displayPhone` gerçek iletişim bağlantılarını yönetir. Kartlar uygulama içi rehberlere gider. Görselsiz giriş, bölüm içi gezinme ve responsive okuma düzeni aynı marka sayfası şablonundadır.

Kurumsal, Asırlık Miras, Destek ve Sözleşme & Politikalar içerik tasarımları ortak beyaz/siyah/kırmızı/gri palette çalışır; marka hero görselleri gri tonla sunulur. Mevcut global header tasarımı korunur. Desktop içerik alanı 1280px ile sınırlıdır.

Siparişe özel sözleşme, ödeme ve hesap hizmetleri bu içerik sayfaları tarafından oluşturulmaz. Satıcı/veri sorumlusu doğrulaması ve işlem bazlı hukuki alanlar için `docs/support-policy-authoring.md` içindeki düzenleme notlarını kullanın.


## Ürün listeleme kartlarında açıklama ve varyantlar

Ortak kart şablonu `src/components/products/ProductCard.jsx` içinde; kategori listeleri ve anasayfa ürün kartları aynı şablonu kullanır. Kategori bazındaki `public/assets/data/products/<kategori>/content/<dil>.json` dosyasında ürünün `description` alanı kısa açıklamayı, `variants.<kod>.label`, `portion`, `weight` ve `description` alanları varyant bilgilerini yönetir. Varyantların yapısı aynı kategorinin `products.json` dosyasından gelir.

Ürün açıklaması kartta en fazla üç, farklı varyant açıklaması iki satır görünür; tam metin JSON’da ve ürün detayında korunur. Ürünle aynı açıklama her varyantta tekrarlanmaz. Boş ve dummy açıklamalar gizlenir; gerçek veri uydurulmaz. Bölge/dil seçimi mevcut katalog çeviri mekanizmasıyla uygulanır. Varyantlar bilgi olarak listelenir; satın alınacak seçenek ürün detayında seçilir.


## Yerel Avenir font ailesi

Yüklenen Avenir ailesinin 12 dosyası WOFF2 biçiminde `public/assets/fonts/avenir/` altında bulunur. Font tanımları `src/fonts.css`, uygulama varsayılanı `src/style.css` içindeki `--font` değişkenindedir. Fontlar dış servise ihtiyaç duymadan uygulamadan yüklenir; Roman normal kesimi başlangıç HTML’inde preload edilir.

Normal ve eğik stiller: Light 300, Book 350, Roman/Oblique 400, Medium 500, Heavy 700, Black 900. Mevcut 600 gibi ara ağırlıklar CSS font eşleştirmesiyle en yakın kesimi kullanır. Font paketindeki Türkçe karakterler korunmuştur; Avenir’in kapsamadığı alfabelerde tarayıcının uygun fallback fontu kullanılır.

`LHF Elixir Regular`, `Arial Narrow`, `Impact` veya bağımsız `serif` içeren mevcut font aileleri aynen korunur. Diğer alanlar ortak Avenir değişkenini kullanır. Boyutlar, renkler ve yerleşimler bu güncellemede değiştirilmez.


## Yerel LHF Elixir Regular

Yüklenen `LHFELIXIRREGULAR.OTF` dosyası, glyphleri değiştirilmeden WOFF2 biçimine dönüştürülüp `public/assets/fonts/lhf/LHF-Elixir-Regular.woff2` olarak eklendi. Aile adı `src/fonts.css` içinde mevcut CSS ile aynı `LHF Elixir Regular` adını kullanır. Mevcut LHF font aileleri ve başlık stilleri değiştirilmedi.

Başlangıç HTML’inde preload bulunur. `font-display: block`, font yüklenirken kısa süreli yedek font gösterimini önlemek için seçildi; ağ başarısızlığı veya uzun gecikmede tarayıcının yedek font davranışı devam eder. Kullanıcının cihazında LHF kurulu olması gerekmez. Paketin içermediği `İ, ı, Ş, ş, Ğ, ğ` karakterleri mevcut fallback aileleriyle gösterilir; bu karakterlere glyph uydurulmadı.
