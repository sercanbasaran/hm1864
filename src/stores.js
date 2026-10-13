export function validateStores(source, languages) {
  if (
    source.schemaVersion !== 1 ||
    !Array.isArray(source.stores) ||
    !source.texts
  )
    throw Error("Mağaza veri dosyası geçersiz.");
  const ids = new Set();
  if (
    source.reviews &&
    (source.reviews.provider !== "business-profile" ||
      !Number.isInteger(source.reviews.maxReviews) ||
      source.reviews.maxReviews < 1 ||
      source.reviews.maxReviews > 12)
  )
    throw Error("Google yorum ayarı geçersiz.");
  for (const s of source.stores) {
    if (
      !/^[a-z0-9-]+$/.test(s.id) ||
      ids.has(s.id) ||
      s.url !== `magazalar/${s.id}/index.html` ||
      !/^[A-Z]{2}$/.test(s.country) ||
      typeof s.online !== "boolean" ||
      typeof s.phone !== "string" ||
      !s.mapQuery?.trim() ||
      (s.googleMapsUrl &&
        !/^https:\/\/(www\.google\.com\/maps|maps\.app\.goo\.gl\/|goo\.gl\/maps\/)/.test(
          s.googleMapsUrl,
        ))
    )
      throw Error("Mağaza kimliği veya harita ayarı geçersiz: " + s.id);
    ids.add(s.id);
    if (
      s.google &&
      (typeof s.google.reviewsEnabled !== "boolean" ||
        typeof s.google.placeId !== "string" ||
        typeof s.google.businessProfileLocation !== "string" ||
        (s.google.placeId &&
          !/^[a-zA-Z0-9_-]{5,200}$/.test(s.google.placeId)) ||
        (s.google.businessProfileLocation &&
          !/^accounts\/\d+\/locations\/\d+$/.test(
            s.google.businessProfileLocation,
          )))
    )
      throw Error("Google mağaza bağlantısı geçersiz: " + s.id);
    for (const field of ["products", "features", "deliveryPlatforms"])
      if (
        !Array.isArray(s[field]) ||
        s[field].some((x) => typeof x !== "string")
      )
        throw Error("Mağaza liste alanı geçersiz: " + s.id);
    for (const lang of languages) {
      const t = s.translations?.[lang.code];
      if (
        !t ||
        ["name", "address"].some(
          (k) => typeof t[k] !== "string" || !t[k].trim(),
        ) ||
        typeof t.hours !== "string"
      )
        throw Error("Mağaza çevirisi eksik: " + s.id + "/" + lang.code);
      for (const key of [...s.products, ...s.features])
        if (!source.texts[key]?.[lang.code])
          throw Error("Mağaza hizmet çevirisi eksik: " + key);
    }
    if (
      s.gallery !== undefined &&
      (!Array.isArray(s.gallery) ||
        s.gallery.some(
          (photo) =>
            !photo ||
            typeof photo.src !== "string" ||
            !/^(?:https:\/\/|\/assets\/|assets\/)/.test(photo.src) ||
            (photo.translations &&
              Object.values(photo.translations).some(
                (text) =>
                  !text ||
                  ["alt", "caption"].some(
                    (key) =>
                      text[key] !== undefined && typeof text[key] !== "string",
                  ),
              )),
        ))
    )
      throw Error("Mağaza galeri verisi geçersiz: " + s.id);
  }
  return source;
}
export function storeGallery(store, language = "tr") {
  const photos = store.gallery ?? (store.image ? [{ src: store.image }] : []);
  const seen = new Set();
  return photos
    .filter(
      (photo) =>
        photo.src?.trim() && !seen.has(photo.src) && seen.add(photo.src),
    )
    .map((photo) => {
      const text = {
        ...photo.translations?.tr,
        ...photo.translations?.[language],
      };
      return {
        ...photo,
        alt:
          text.alt ||
          store.translations[language]?.name ||
          store.translations.tr.name,
        caption: text.caption || "",
      };
    });
}
export const storeText = (data, language, key, values = {}) =>
  (
    data.storeTexts?.[key]?.[language] ||
    data.storeTexts?.[key]?.tr ||
    key
  ).replace(/\{(\w+)\}/g, (_, name) => values[name] ?? `{${name}}`);
export const localizeStore = (store, language = "tr") => ({
  ...store,
  ...store.translations.tr,
  ...store.translations[language],
});
export function storeMaps(store, language = "tr") {
  const query = encodeURIComponent(store.mapQuery);
  return {
    embed: `https://www.google.com/maps?q=${query}&output=embed&hl=${encodeURIComponent(language)}`,
    directions:
      store.googleMapsUrl ||
      `https://www.google.com/maps/dir/?api=1&destination=${query}`,
  };
}
