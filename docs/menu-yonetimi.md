# Menü yönetimi

Menülerin düzenleme kaynakları public/assets/data/menus/ klasöründedir. Dosya yolları public/assets/data/catalog/manifest.json içindeki menus alanında tanımlıdır.

| Dosya | Yönetilen alan |
| --- | --- |
| header.json | Üst servis bağlantıları, sol/sağ ikon aksiyonları, kategori düğmeleri, koleksiyon bağlantıları |
| mega.json | Online ve mağaza sekmeleri, her sekmenin kategori/alt kategori listesi |
| mobile.json | Mobil kategori/alt kategori listesi, tüm kategori etiketi ve ek bağlantılar |
| footer.json | Footer grupları, başlıklar, bağlantılar, accordion davranışı ve sütun sırası |
| social.json | Sosyal medya başlığı, ikonlar ve profil bağlantıları |
| category.json | Kategori sayfalarındaki kategori/alt kategori sekmeleri |
| brand.json | Kurumsal, miras, destek ve sözleşme sayfalarının bölüm menüleri, ilgili sayfaları ve alt bağlantıları |

## Ortak düzenleme

- Dizideki sıra ekrandaki sıradır. enabled: false ilgili öğeyi gizler; silmek de mümkündür.
- label ve title düz metin veya {"tr":"Türkçe","en":"English"} olabilir. Eksik/boş çeviri Türkçeye döner.
- url site içi yol, #bölüm, https bağlantısı, mailto veya tel olabilir.
- id aynı listede benzersiz ve sabit olmalıdır.
- Başlık/bağlantı eklemek için aynı listedeki bir öğeyi kopyalayıp id, label ve url alanlarını düzenleyin.

Örnek bağlantı:

~~~json
{"id":"iletisim","enabled":true,"label":{"tr":"İletişim","en":"Contact"},"url":"/iletisim/index.html"}
~~~

## Kategori menüleri

categoryId ve subcategoryId, catalog/categories.json içindeki kimliklerdir. Bu bağlantı sayesinde ürün adı, çevirisi ve adresi katalogdan gelir. İsterseniz menü öğesine label veya url ekleyerek yalnızca bu menünün görünen adını/adresini değiştirebilirsiniz.

~~~json
{"categoryId":"baklavalar","enabled":true,"label":{"tr":"Baklava Çeşitleri"},"children":[{"subcategoryId":"baklavalar/fistikli-baklavalar","enabled":true}]}
~~~

Yeni kategoriyi önce kataloğa, ardından görünmesini istediğiniz menülerin listelerine ekleyin. Masaüstü, mobil ve kategori sekmeleri bağımsızdır. Eski megaMenuOnline/highlightOnHeader alanları artık bu bileşenlerde menü görünürlüğünü belirlemez; menü dosyalarını kullanın. header.primary içindeki kategori öğesinin id alanını categoryId ile aynı tutun. all öğesi tüm menüyü açar.

mega.tabs içindeki online/store sekmelerinden en az biri açık olmalıdır. Mağaza yolları sabit kategori kimliklerinden üretilir; dil değişince URL değişmez.

## Footer ve sosyal medya

footer.groups içine grup ekleyin ve kimliğini footer.order içine yerleştirin. order içindeki partners ödeme/kargo logolarını, social sosyal medya grubunu temsil eder. accordion: true mobilde açılır/kapanır grup oluşturur. false düz sütundur.

social.items içindeki url alanına gerçek profil adresini girin. Boş URL, mevcut davranış gibi yalnızca ikonu gösterir. Mevcut ikon adları: instagram, tiktok, facebook, youtube, linkedin. Profil adresleri tahmin edilmemiştir.

## İç sayfalar

brand.pages sayfa kimliğiyle bölüm menüsünü yönetir. chapters içindeki sectionId sayfanın mevcut bölümüne bağlanır; isteğe bağlı label menü başlığını değiştirir. Bu liste yalnızca menüyü değiştirir, sayfanın içerik bölümlerini silmez. showBackLink grup ana sayfası bağlantısını kontrol eder. brand.groups ilgili sayfa sırasını, relatedLimit gösterilecek sayısını, endLinks sayfa sonu bağlantılarını belirler.

Breadcrumb izi ve site haritası mevcut sayfa/katalog hiyerarşisinden otomatik üretilmeye devam eder.

## Yayına alma

Geliştirmede JSON değişince sayfa yenilenir. Yayında değişikliklerin görünmesi için yeniden build/deploy gerekir. runtime.json üretilmiş dosyadır; elle düzenlemeyin. npm run build hatalı kimlikleri, tekrarlı öğeleri ve geçersiz bağlantıları kontrol eder.
