# USTA varyant kataloğu aktarımı

Tek kaynak kullanıcının `varyantlar (3).json` dışa aktarımıdır. SHA-256 ve satır bazlı SKU/fiyat/kanal özeti `catalog-import-report.json` dosyasındadır.

- 6 kategori, 117 ürün, 390 varyant aktarılır. Aynı ürüne ait varyantlar tek ürün detayında toplanır; özgün ürün kodu, SKU ve varyant UUID'si korunur.
- Online görünüm: E-Mağaza **Açık** olan 332 varyant / 104 ürün.
- Mağaza görünümü: Mağaza **Açık** olan tüm 390 varyant / 117 ürün. E-Mağaza Kapalı olan 58 varyant yalnızca burada bulunur ve sepete eklenemez.
- Menü grupları ve kategori yolları yalnızca yüklenen kategorilerden üretilir. Kategori/alt kategori bilgisi olmayan kök grup (Trileçeler) için ilave bir alt kategori menüsü gösterilmez.
- `/urunler/...` yolları korunur. `?menu=store` mağaza görünümünü seçer; sorgu yoksa online görünüm açılır. Ürün bağlantıları, mobil menü, breadcrumb ve tarayıcı geri/ileri gezinmesi kanal bağlamını korur.
- İçerikler Türkçedir; diğer diller Türkçe kaynak metne döner. Yalnızca sağlanan TRY fiyatları aktarılır; döviz fiyatı veya kur üretilmez. Stok verisi verilmediğinden bilinmiyor (`null`) bırakılır.
- Besin, alerjen, servis, saklama, net gramaj, birim, ölçüler, kutu içindeki ürünler/miktarları, sarf malzemeler ve kanal bilgileri aktarılır. Karışık tabakların içindeki ürünler aynı kaynak katalogdaki ürünlere bağlanır.

## Tekrar aktarım

```sh
python scripts/import-usta-catalog.py /dosya/yolu/varyantlar.json --download-media
npm run build
```

Komut mevcut `public/assets/data/products/` girişlerini tamamen değiştirir; kategori/menü JSON'larını ve anasayfa ürün seçkisini günceller. Önce kaynak dosyadaki kimlik, fiyat ve kanal tutarlılığını doğrular. Eski ürün/fiyat/çeviri kayıtları ve katalog rota listeleri yayındaki veri kaynaklarından kaldırılır. Mevcut anasayfa görselleri ve tarihçe korunur. Önceki ürünlere ait yerel sepet/favori kayıtları, katalog yüklendiğinde temizlenir.

## Görsellerin erişimi

Dışa aktarımdaki 176 farklı görsel `public/assets/images/urunler/imported/` altına indirildi. Ürün ve varyant galerileri kaynak kayıtlardaki fotoğraflara, kutu görseli tanımlı varyantların kart üzerindeki geçişi ise kendi kutu fotoğrafına bağlanır. Kutu içeriği tabloları ilgili ürünün kaynak fotoğrafını kullanır. Eski ürün fotoğrafları yeni ürünlere tahminen bağlanmaz.

Görseller uygulamayla birlikte sunulur; ziyaretçinin kaynak medya API'sine erişmesi gerekmez. Özgün dosya biçimleri ve görsel içerikleri korunur. Fotoğraf bağlantıları her ürün/varyantta `sourceImageUrls` ve `sourceBoxImageUrls` olarak da saklanır.

`--download-media` erişilebilir PNG/JPEG/WebP dosyalarını indirir; aynı medya kimliğine ait yerel dosya varsa yeniden kullanır. Eksik indirmeler komut tekrar çalıştırılarak tamamlanabilir. API yetki hatası verirse aynı korunan API'deki diğer adreslere yetkisiz tekrar istek göndermez ve tanı raporunu kaydeder.

## Testler

`tests/imported-catalog.test.mjs` güncel üretim kataloğunun sayıları, kaynak SKU/fiyatları, karma içerikleri, yerel ve build çıktısındaki görsel dosyalarını ve iki kanalın kullanıcı akışlarını doğrular. Eski katalogla yazılmış genel UI regresyonları `tests/fixtures/legacy-authoring.json.gz` üzerinden çalışır. Bu dosya yalnızca test girdisidir; uygulama/üretim verisi değildir ve runtime paketine eklenmez.
