# Demo alışveriş ve üyelik akışı

Bu sürüm yalnızca frontend prototipidir. Sipariş, tahsilat, kargo etiketi, gerçek üyelik veya e-posta servisi çalıştırmaz. Tüm ilgili ekranlarda demo bilgisi gösterilir. Gerçek müşteri/kart bilgisi kullanmayın.

## Deneme adımları

1. Satışa açık, fiyatı bulunan bir ürünün detay sayfasında varyant ve adet seçip **Sepete ekle** butonuna basın.
2. Yan sepetten ya da `/sepet/index.html` sayfasından adetleri değiştirin, ürün kaldırın ve ödeme sayfasına geçin.
3. `/odeme/index.html` sayfasında misafir olarak devam edin veya başlıktaki üyelik penceresinden demo giriş yapın. Örnek teslimat ve gerekiyorsa ayrı fatura adresi girin.
4. Standart, hızlı kargo veya Sirkeci mağazasından demo teslim seçin. Süre ve ücretlerin tamamı örnektir; gerçek lojistik fiyatlandırması yoktur.
5. **Başarılı demo kartını doldur** butonu ile kart alanlarını doldurun; demo onayını işaretleyip tamamlayın. Reddedilen kart butonu başarısız ödeme/yeniden deneme senaryosunu gösterir. Son kullanma tarihi ve CVC kontrolleri yapılır. Sağlanan iki test kartı dışındaki numaralar kabul edilmez.
6. Başarılı akış `/siparis/sonuc.html` sayfasını açar ve sepeti boşaltır. Başarısız ödemede sepet korunur. Aynı e-postayla açık demo oturum varsa sipariş hesap ekranında da görüntülenir.

## Üyelik

- `/hesabim/index.html`: demo giriş ve hesap özeti.
- `/hesabim/kayit.html`: örnek üyelik oluşturma; şifre tekrarı ve demo onayı.
- `/hesabim/sifremi-unuttum.html`: yalnızca demo istek mesajı; e-posta gönderilmez.
- `/hesabim/siparislerim.html`: demo hesap ve o oturumda aynı e-postayla oluşturulan siparişler.
- Hazır test hesabı: `demo@hm1864.com` / `Demo1864!`.
- Yeni demo hesaplar, oturum ve siparişler yalnızca bellekte tutulur. Sayfa yenilenince silinir. Bu mekanizma gerçek kimlik doğrulama veya güvenli kullanıcı hesabı olarak kullanılamaz.

## Dosyalar ve veri

- `src/hooks/useDemoCommerce.js`: sepet ve geçici demo hesap/sipariş durumu.
- `src/commerce.js`: sepet fiyat/uygunluk kontrolleri, demo kargo ücretleri ve kart doğrulama.
- `src/components/commerce/`: adres, kargo, ödeme, üyelik, sepet satırları ve özet bileşenleri.
- `src/pages/{CartPage,CheckoutPage,OrderResultPage,AccountPage}.jsx`: sayfa akışları.
- `src/commerce.css`: masaüstü ve mobil stiller.
- `public/assets/data/ui/commerce.json`: Türkçe/İngilizce metinler. Diğer dil seçenekleri bu prototipte İngilizce gösterilir.

Kalıcı tarayıcı depolamasına yalnızca `hm1864.demo.cart` altında ürün anahtarı, varyant kodu ve adet yazılır. Fiyatlar güncel bölge/para birimi kataloğundan yeniden hesaplanır; kayıtlı fiyatlara güvenilmez. Fiyatı olmayan, satışa kapalı veya yetersiz stoklu satırlar ödeme adımını engeller. Tercihler değişirse tutarlar yeniden hesaplanır ve ödeme adımları sıfırlanır.

Kart numarası, CVC ve parola tarayıcı depolamasına veya sunucuya gönderilmez. Kart alanları ödeme formu kapandığında veya başarılı demoda temizlenir. Adresler ve demo siparişler de kalıcı kaydedilmez.

Üretim entegrasyonu yapılırken hesap/oturum, fiyat/stok doğrulama, vergi, kargo tarifeleri ve sipariş oluşturma sunucu tarafına taşınmalı; gerçek ödeme sağlayıcısının güvenli kart bileşenleri kullanılmalıdır.

Doğrulama: `npm run build`, `node --test tests/commerce.test.mjs`.
