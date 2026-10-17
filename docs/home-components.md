# Anasayfa bölümlerini düzenleme

Anasayfa artık büyük bir HTML/JSON şablonundan çizilmez. Her bölüm ayrı bir React componentidir. Sıralamayı değiştirmek, bölüm eklemek veya kaldırmak için `src/pages/HomePage.jsx` dosyasındaki component listesini düzenleyin.

| Bölüm | Component dosyası |
| --- | --- |
| Ana slider | `src/components/home/HeroSlider.jsx` |
| Koleksiyon tanıtımı | `src/components/home/CollectionSection.jsx` |
| Ürün vitrini | `src/components/home/FeaturedProductsSection.jsx` |
| Kurumsal hediyeler | `src/components/home/CorporateGiftsSection.jsx` |
| Mağazalar tanıtımı | `src/components/home/StoresTeaserSection.jsx` |
| Tarihçe ve yıl sekmeleri | `src/components/home/HeritageSection.jsx` |

## İçeriği değiştirme

`src/components/home/sections.json` dosyasında her bölümün görsel yolları, bağlantıları ve çeviri anahtarları ayrı nesnelerde bulunur. `productKeys` ürün vitrinindeki ürünleri ve sıralarını belirler. Ürün kartları güncel katalogdan gelir; ürün bilgileri burada tekrar yazılmaz.

Metinlerin kendileri ve çevirileri mevcut `public/assets/data/ui/home.json` dosyasında kalır. `titleKey`, `descriptionKey`, `paragraphKeys` gibi alanlar bu çeviri anahtarlarını kullanır. Yeni metin eklerken uygulamanın dil standardına uygun bir anahtar ekleyin. Slider ayarları ve metinleri ise `public/assets/data/home/slider.json` dosyasında kalır.

Görsel dosyasını `public/assets/images/medya/` altına ekleyin; ayar dosyasında `assets/images/medya/dosya.png` biçimini kullanın. JSX ve sections.json değişikliklerinin yayına girmesi için yeniden derleyin. Üretilen `dist/assets/data/runtime.json` dosyasını düzenlemeyin.

## Başka bir sayfada yeniden kullanma

Componentleri doğrudan ilgili dosyadan import edin. Parametre verilmezse mevcut anasayfa içeriği kullanılır. Farklı içerik için `config` prop'una ilgili bölümün yapısına uygun bir nesne verin:

```jsx
import CollectionSection from "../components/home/CollectionSection.jsx";
import FeaturedProductsSection from "../components/home/FeaturedProductsSection.jsx";
import HeritageSection from "../components/home/HeritageSection.jsx";
import sections from "../components/home/sections.json";

<CollectionSection config={{ ...sections.collection, image: "assets/images/medya/yeni.png" }} />
<FeaturedProductsSection products={selectedProducts} />
<HeritageSection id="brand-history" initialYear="1923" />
```

Bu bölümler uygulamanın mevcut `AppContext` sağlayıcısı altında çalışır; dil, katalog ve bölge tercihleri aynı kaynaktan gelir. Aynı sayfada birden fazla tarihçe kullanıyorsanız her birine farklı `id` verin. Seçili yıl her componentin kendi durumudur; örnekler birbirini etkilemez. Slider da isteğe bağlı `config` prop'u kabul eder.

Ortak başlık düzeni `src/components/sections/SectionHeading.jsx`, ürün kaydırma yapısı `src/components/sections/ProductCarousel.jsx` dosyasındadır. Başlık componenti çevrilmiş `title`, `description`, `eyebrow` değerleri alır. Ürün carousel'i `products`, `label`, `previousLabel`, `nextLabel` ve isteğe bağlı `scrollStep` (varsayılan 400 px) alır. Her carousel kendi alanını kaydırır.

Eski `src/templates/home.json` kaldırılmıştır. Header, footer ve diğer şablonlar kendi mevcut dosyalarında kalır.

Kontrol: `npm run build` ve `node --test tests/home-components.test.mjs tests/home-slider.test.mjs tests/app.test.mjs`.
