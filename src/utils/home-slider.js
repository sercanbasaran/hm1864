const fields = ['eyebrow', 'title', 'description', 'buttonLabel', 'imageAlt', 'backgroundImageAlt'];

export function validateHomeSlider(config) {
  if (config?.schemaVersion !== 1 || !Number.isFinite(config.intervalMs) || config.intervalMs < 1000 || !Array.isArray(config.slides) || !config.slides.length)
    throw Error('Slider ayarları geçersiz.');
  const ids = new Set();
  for (const slide of config.slides) {
    if (!slide.id || ids.has(slide.id) || typeof slide.enabled !== 'boolean' || !/^#(?:[\da-f]{3}|[\da-f]{6}|[\da-f]{8})$/i.test(slide.backgroundColor) || ['image', 'backgroundImage', 'buttonLink'].some(key => typeof slide[key] !== 'string'))
      throw Error('Slider görsel/renk ayarı geçersiz: ' + slide.id);
    ids.add(slide.id);
    if (!slide.content?.tr?.title?.trim() || !slide.content?.tr?.description?.trim() || !slide.content?.tr?.buttonLabel?.trim())
      throw Error('Slider Türkçe içeriği eksik: ' + slide.id);
    for (const text of Object.values(slide.content)) {
      if (!text || typeof text !== 'object' || Array.isArray(text) || Object.entries(text).some(([key, value]) => !fields.includes(key) || typeof value !== 'string'))
        throw Error('Slider çeviri alanı geçersiz: ' + slide.id);
    }
  }
  return config;
}

export function localizedSlide(slide, language) {
  const translated = slide.content[language] || {};
  return Object.fromEntries(fields.map(key => [key, translated[key]?.trim() ? translated[key] : slide.content.tr[key] || '']));
}
