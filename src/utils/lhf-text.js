const replacements = { "İ": "i", "ı": "i", "Ş": "S", "ş": "s", "Ğ": "G", "ğ": "g" };

export const normalizeLhfCharacters = value => String(value ?? "").replace(/[İıŞşĞğ]/g, letter => replacements[letter]);
// Use locale-independent casing so ASCII I cannot become an unsupported dotless ı.
export const lhfDisplayText = value => normalizeLhfCharacters(value).toLowerCase();

export function isLhfHeading(tag, ancestorClasses) {
  return (tag === "h1" && ancestorClasses.some(name => ["hero", "category-banner"].includes(name))) ||
    (tag === "h2" && ancestorClasses.includes("hero-slide"));
}
