# Ürün fiyatlarının kur dönüşümü

Ana fiyat TRY’dir. `npm run prices:convert` Frankfurter v2 API’sinden katalogdaki diğer para birimlerinin son yayımlanan kurlarını alır ve tüm ürün/varyant fiyat dosyalarına yazar. USD, GBP, AED, EUR, DKK, SEK, CNY ve JPY dönüşümleri kapsanır.

Hesap: TRY fiyatı × hedef para biriminin kuru. Sonuç en yakın tam para birimi tutarına yuvarlanır; tam yarımlar yukarı gider. Ondalık hesaplama tamsayı kesirleriyle yapılır. TRY tutarı değiştirilmez. TRY fiyatı `null` ise döviz karşılığı da `null` kalır; eksik fiyat üretilmez.

Kaynak URL, kur tarihleri, oranlar, alınma zamanı ve yuvarlama kuralı `public/assets/data/settings/exchange-rates.json` içinde tutulur. Kur doğrulaması ve tüm hesaplamalar yazma işleminden önce tamamlanır. Eksik kur veya API hatasında mevcut fiyatlar korunur.

Bu komut çalıştırıldığında fiyatlar yenilenir; sayfa açılışında API çağrısı veya zamanlanmış yenileme yapılmaz. Yeni fiyatların yayına alınması için derleme ve normal Git/yayın akışı gerekir. Kaynak: https://frankfurter.dev/
