# Ana sayfa slider içerikleri

Tek düzenleme dosyası: `public/assets/data/home/slider.json`.
`src/pages/HomePage.jsx` yalnızca slider'ın sayfadaki konumunu belirler.
`runtime.json` derleme sırasında üretilir; doğrudan düzenlenmez.

- `intervalMs`: otomatik geçiş süresi, milisaniye (5000 = 5 saniye).
- `slides`: listedeki sıra, slaytların gösterim sırasıdır. Yeni slayt için bir öğeyi kopyalayın ve benzersiz `id` verin. Sayaç ve noktalar otomatik oluşur.
- `enabled`: `false` yapıldığında slayt gösterilmez.
- `gridScheme`: `0` metin solda / görsel sağda, `1` metin sağda / görsel solda. Her slaytta ayrı ayarlanır; alan yoksa `0` kullanılır. Mobilde (640 px ve altı) metin üstte, görsel altta kalır.
- `backgroundColor`: HEX arka plan rengi.
- `backgroundImage`: isteğe bağlı arka plan görseli; boş bırakılırsa renk kullanılır.
- `image`: ürün görseli. Dosyalar `public/assets/images/medya/` altında; JSON yoluna `public/` yazmayın.
- `buttonLink`: butonun gideceği sayfa.
- `content.tr`: `eyebrow` (üst etiket), `title` (birleşik başlık), `description` (birleşik açıklama), `buttonLabel`, `imageAlt` ve isteğe bağlı `backgroundImageAlt`.

Başlık ve açıklama tek metindir; satırlar ekran genişliğine göre otomatik kırılır.
Mevcut güvenli metin biçimlendirmesi (`<strong>`, `<em>` gibi) desteklenir.
Yeni dil için `content.en`, `content.ar` gibi bir nesne ekleyin. Eksik veya boş çeviri alanları Türkçe karşılığını kullanır; boş dil nesneleri eklemeniz gerekmez.

```json
"content": {
  "tr": {
    "eyebrow": "1864 SEÇKİSİ",
    "title": "Asırlık ustalık tek kutuda",
    "description": "İstanbul’un lezzet mirası özel kutularda bir araya geliyor.",
    "buttonLabel": "KOLEKSİYONU İNCELE",
    "imageAlt": "Hafız Mustafa koleksiyon kutusu"
  },
  "en": {
    "title": "A century of craftsmanship in one box"
  }
}
```
