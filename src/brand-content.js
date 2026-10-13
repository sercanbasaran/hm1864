export const brandText = (value, language = "tr") =>
  typeof value === "string"
    ? value
    : value?.[language] || value?.en || value?.tr || "";
export function validateBrandFiles(files) {
  const urls = new Set(),
    ids = new Set(),
    types = new Set([
      "prose",
      "cards",
      "timeline",
      "documents",
      "faq",
      "gallery",
      "people",
    ]);
  for (const file of files) {
    if (
      file.schemaVersion !== 1 ||
      !file.group?.id ||
      !Array.isArray(file.pages)
    )
      throw Error("Marka sayfaları geçersiz.");
    for (const page of file.pages) {
      if (
        !page.id ||
        ids.has(page.id) ||
        urls.has(page.url) ||
        !new RegExp("^" + file.group.id + "/([a-z0-9-]+/)?index\\.html$").test(
          page.url,
        ) ||
        !page.title?.tr ||
        !page.title?.en ||
        !page.hero?.intro?.tr ||
        !page.sections?.length
      )
        throw Error("Marka sayfası kimliği veya içeriği geçersiz: " + page.id);
      ids.add(page.id);
      urls.add(page.url);
      const sectionIds = new Set();
      for (const section of page.sections) {
        if (
          !section.id ||
          sectionIds.has(section.id) ||
          !types.has(section.type) ||
          !section.title?.tr
        )
          throw Error("Marka bölüm şablonu geçersiz: " + page.id);
        sectionIds.add(section.id);
        for (const item of section.items || []) {
          if (item.href && /^(?:[a-z]+:|\/\/)/i.test(item.href))
            throw Error("Marka içerikleri uygulama içinde açılmalıdır: " + page.id);
          if (item.detail && (!Array.isArray(item.detail.paragraphs) || item.detail.paragraphs.some(p => !p?.tr)))
            throw Error("Marka ayrıntı metni geçersiz: " + page.id);
          if (item.document && (!/^\/assets\/documents\/[a-z0-9/-]+\.pdf$/.test(item.document.src) || !/^\/assets\/images\/[a-z0-9/-]+\.jpg$/.test(item.document.preview) || !Number.isInteger(item.document.page) || item.document.page < 1))
            throw Error("Marka belgesi geçersiz: " + page.id);
        }
      }
    }
  }
  return {
    pages: files.flatMap((f) =>
      f.pages.map((p) => ({ ...p, groupId: f.group.id })),
    ),
    groups: files.map((f) => f.group),
    labels: files[0].labels,
  };
}
