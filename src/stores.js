export function validateStores(source, languages) {
  if (
    source.schemaVersion !== 1 ||
    !Array.isArray(source.stores) ||
    !source.texts
  )
    throw Error("Mağaza veri dosyası geçersiz.");
  const ids = new Set();
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
        ["name", "address", "hours"].some(
          (k) => typeof t[k] !== "string" || !t[k].trim(),
        )
      )
        throw Error("Mağaza çevirisi eksik: " + s.id + "/" + lang.code);
      for (const key of [...s.products, ...s.features])
        if (!source.texts[key]?.[lang.code])
          throw Error("Mağaza hizmet çevirisi eksik: " + key);
    }
  }
  return source;
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
