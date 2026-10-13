# Destek ve politika içerikleri

Kaynak içerikler: `public/assets/data/pages/destek.json` ve `sozlesmeler.json`.

- 8 destek sayfası ve 7 sözleşme/politika sayfası. TR, EN, AR metinleri aynı alanların altında bulunur. Diğer dil kodları boş şablonlardır; mevcut İngilizce/Türkçe fallback uygulanır.
- Her sayfanın `title`, `hero.intro`, bölüm başlıkları ve paragrafları JSON’dan yönetilir. Görselsiz hero kullanılır; görsel alanı eklenirse mevcut marka hero şablonu çalışır.
- `faq.searchable: true` soru ve yanıt metinlerinde arama açar. Sorgu tarayıcı belleğindedir, sunucuya gönderilmez.
- `contacts` bölümü gerçek e-posta ve telefon bağlantıları sağlar. Bu bağlantılar kullanıcının e-posta/telefon uygulamasını açar; sitede sahte talep gönderimi veya destek kaydı oluşturulmaz.
- Ortak bileşenler: `BrandFAQ.jsx`, `BrandContacts.jsx`, `BrandPage.jsx`. Ortak renk sistemi `src/style.css` içindeki marka sayfaları bölümüdür; desktop içerik genişliği 1280px kalır.

## İşleme özel sözleşmeler

Satış sözleşmesi sayfası genel açıklama şablonudur; siparişe özel elektronik sözleşme üretmez. Ödeme/hukuk entegrasyonunda satıcı unvanı, MERSİS/VKN, açık yasal adres, alıcı bilgileri, ürün/varyantlar, fiyat/vergiler/teslimat bedeli, ön bilgilendirme teyidi ve sözleşme sürümü işlem bazında hazırlanmalıdır. Bu çalışma mevcut ödeme veya üyelik altyapısını oluşturmaz/değiştirmez.

Türkiye satış kaynağı Hamidiye Şekerleme Sanayi ve Ticaret Limited Şirketi, kurumsal KVKK kaynağı Hafızlar Gıda İç ve Dış Ticaret A.Ş. kullanıyor. Bu roller aynı şirket varsayılarak birleştirilmedi. Yeni uygulama için satıcı/veri sorumlusu rolleri ve ülkeye özel kayıtlar işletme/hukuk ekibince doğrulanmalıdır. KVKK sayfası kurumsal Türk kimliği ve genel müşteri bilgilendirmesini içerir; başka bir işleme yönelik özel aydınlatmanın yerine geçmez. Gerçek veri envanteri, işlem bazlı hukuki sebepler, alıcılar, saklama planı ve yurt dışı aktarım mekanizması şirket tarafından doğrulanmalıdır.

Gıda ürünlerine toplu bir iade yasağı yazılmadı; cayma istisnası ürün niteliğine göre ve ayıplı mal haklarından ayrı anlatıldı. Türkiye’deki haklar bütün ülkelere uygulanmış gibi gösterilmedi. Kesin operasyon süreleri, ücretler, banka dönüş süreleri veya destek SLA’ları uydurulmadı.

Çerez politikası uygulamanın şu anki koduna dayanır: `hm1864.react.preferences` için süresiz localStorage; sepet için oturum belleği. Reklam/analitik script eklenmemiştir. Google Maps, CDN görselleri ve aktif satış kanalının sağlayıcıları ayrıca değerlendirilmelidir. Yeni izleme veya hizmet entegrasyonu eklenince politika ve gerekli rıza mekanizması birlikte güncellenmelidir.

## Araştırma kaydı (ziyaretçi arayüzünde gösterilmez)

2026-10-13 tarihinde incelendi:

- https://online.hafizmustafa.com/teslimat-kosullari
- https://online.hafizmustafa.com/Sozlesme-Satis
- https://online.hafizmustafa.com/Sozlesme-Guvenlik-Gizlilik
- https://online.hafizmustafa.com/security
- https://online.hafizmustafa.com/kvkk
- https://www.hafizmustafa.com/iletisim
- https://www.hm1864.ae/delivery-information/
- https://www.hm1864.ae/privacy-policy/
- https://tuketici.ticaret.gov.tr/yayinlar/tuketici-bilgi-rehberi/mesafeli-sozlesmeler-hakkinda-bilgilendirme
- https://www.kvkk.gov.tr/Icerik/4132/aydinlatma-yukumlulugunun-yerine-getirilmesinde-uyulacak-usul-ve-esaslar-hakkinda-teblig
- https://www.kvkk.gov.tr/Icerik/7595/2022-1358

Eski marka sözleşmelerindeki güncelliğini yitirmiş kanun numarası, varsayılan pazarlama rızası, kapsamlı sorumluluk kaldırmaları kopyalanmadı.
