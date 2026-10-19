# Ürün görsel geçişleri

Karttaki seçili varyant için isteğe bağlı `boxImage` alanı kutu fotoğrafının ürün görsel yolunu alır (örnek: `baklavalar/packaging/hm1864-xl-closed-front-left.webp`). Bu alan ürün gruplarının `public/assets/data/products/*/products.json` dosyalarında, ilgili varyant nesnesine eklenebilir. Varyantsız ürünlerde ürünün kendisine eklenir.

`boxImage` yoksa yalnızca seçili varyantın `images` listesinde `packaging/`, `boxes/` veya `kutu/` altında bulunan fotoğraf kullanılır. Başka varyantın kutusu veya yaşam tarzı fotoğrafı otomatik seçilmez. Kutu görseli yoksa ana ürün fotoğrafı korunur. Mevcut baklava XL kutu görselleri bu kuralla otomatik kullanılır.

Kartta mouse hover ve klavye odağı, 1600 ms opacity geçişi ve 600 ms gecikmeyle kutuyu gösterir. Mouse ayrılınca aynı yavaşlıkta ürün fotoğrafına döner. Dokunmatik cihazlarda hover taklidi yapılmaz; ürün bağlantısı normal çalışır.

Detay galerisinde görsel değişimi 1600 ms boyunca sağdan içeri/sola dışarı kayar. Oklar, küçük görseller ve mevcut 5 saniyelik otomatik geçiş aynı animasyonu kullanır. Mouse üzerine gelince otomatik geçiş durur. Hareket azaltma tercihi olan cihazlarda animasyonlar kaldırılır.

Bileşenler: `src/components/products/ProductCard.jsx`, `ProductGallery.jsx`. Stiller: `src/product-motion.css`.
