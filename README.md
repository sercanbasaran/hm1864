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

## Bölge ve dil seçimi

İlk ziyarette bölge ve dil penceresi açılır; seçim yapılana kadar kapatılamaz. Tercih tarayıcıda saklanır ve header üzerinden daha sonra değiştirilebilir. Önceden kaydedilmiş ülke/dil adları da kodlara dönüştürülerek korunur. `public/assets/data/regions.json` ülkeleri (`TR`, `AE`, `GB`, `DE`, `FR`, `US`) ve ülke seçildiğinde önerilen dili tanımlar. Dil seçenekleri ve ülke adları `public/assets/data/content.json` içindedir. Bunlar gerçek teslimat ve ödeme entegrasyonu değildir.

Yeni çeviri eklemek için `content.json` dosyasında ilgili anahtarın boş dil değerini doldurun; örneğin:

```json
"ui.countProducts": {
  "tr": "{count} ürün",
  "en": "{count} products",
  "ar": "{count} منتجات"
}
```

Sayfa metinleri `src/templates.json` içinde `@text:...` anahtarlarıyla, sayfa başlıkları `src/routes.json` içinde `titleKey` ile bağlanır. Görünen sabit bir metin eklerken önce `content.json` dosyasına bir anahtar ekleyin. Yeni dil için `languages` listesine kod ve ad ekleyip her `texts` kaydına aynı dil kodu için boş bir alan ekleyin. Boş bırakılan alanlarda Türkçe gösterilir.

`products.json` içindeki bir ürün, kategori veya alt kategoriye isteğe bağlı `markets` ve `translations` eklenebilir:

```json
"markets": ["TR", "AE"],
"translations": {
  "en": { "name": "Approved English product name", "description": "Approved description" },
  "ar": { "name": "Approved Arabic product name" }
}
```

`markets` yoksa kayıt tüm bölgelerde görünür; varsa yalnızca listelenen kodlarda görünür. Bölge değiştiğinde menü, kategori ve arama sonuçları aynı filtrelenmiş katalogdan üretilir. Çeviri yoksa mevcut Türkçe metin gösterilir. Ürün ve kategori URL'leri dil değişiminde aynı kalır. Sabit arayüz ve sayfa metinleri `public/assets/data/content.json` dosyasındaki `texts` alanından alınır; `languages` listesi seçilebilir dilleri belirler. Her metin anahtarında `tr`, `en`, `ar` alanı bulunur. Boş çeviri alanlarında Türkçe gösterilir. `src/i18n.js` yalnızca okuma ve geri dönüş mantığını içerir. Metinlerde `{count}`, `{name}` gibi yer tutucuları koruyun. Ürün ve kategori adları ile ürün açıklamalarının çevirileri `products.json` içindeki ilgili kaydın `translations.en` veya `translations.ar` alanına eklenir. Fiyat/para birimi bölgeye göre otomatik dönüştürülmez.

## Etkileşimler ve sınırlar

Kategori menüleri, mobil menü, arama, filtreleme/sıralama, ürün varyantları, adet seçimi, akordiyonlar, bilgi pencereleri ve dört slaytlı, beş saniyede ilerleyen ana sayfa slider'ı çalışır. Ödeme/sipariş, kullanıcı hesabı ve canlı stok sunucu bağlantısı gerektirir; bu ön yüzde gerçek işlem yapılmaz. Kaynak görsel, fiyat veya besin verisi sağlanmayan ürünler yer tutucu ile görünür.

Doğrulama: `npm test` ve `npm run build`. Ayrıca doğrudan ürün URL'si, varyant seçimi, menü/pencere etkileşimi ve masaüstü/mobil görünüm gerçek tarayıcıda kontrol edilmiştir.

## Netlify'ye yükleme

Hızlı önizleme için ZIP'i açın; Netlify'de **Add new project → Deploy manually** bölümüne `hafiz-mustafa-react/dist` klasörünün kendisini sürükleyin. ZIP dosyasını veya `public` klasörünü yüklemeyin. Değişiklikleri yayınlamak için önce `npm run build` çalıştırıp güncel `dist` klasörünü aynı projenin **Deploys** alanına tekrar yükleyin.

Düzenli güncelleme için kaynak klasörünü bir Git deposuna aktarın ve Netlify'de depoyu bağlayın. Proje kökündeki `netlify.toml` derleme komutunu `npm run build`, yayın klasörünü `dist` ve Node sürümünü 22 olarak ayarlar. Netlify'nin varsayılan Pretty URLs işlemi `.html` adresini uzantısız hale getirirse React yönlendiricisi bu adresleri de eşler.

Bu pakette `noindex,nofollow` meta etiketi bulunur. Netlify adresiyle yalnızca önizleme yapılacaksa uygundur. Arama motorlarında listelenecek gerçek mağaza yayını öncesinde `index.html` içindeki bu etiketi ve sipariş/ödeme entegrasyonunu ayrıca ele alın.
