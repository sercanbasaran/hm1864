// Empty authoring templates and familiar placeholder text do not publish a section.
const clean = (value) =>
  String(value ?? "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;|&#160;/gi, " ")
    .trim();
const dummy = (value) => {
  const text = clean(value);
  return (
    !text ||
    /^[.\s…_-]+$/.test(text) ||
    /^(lorem ipsum|dummy(?:\s|$)|placeholder(?:\s|$)|içerik (gelecek|bekleniyor)|content (coming soon|pending)|görsel bekleniyor)/i.test(
      text,
    )
  );
};
export const editorialImage = (section) =>
  typeof section.image === "string" &&
  !!section.image.trim() &&
  !/(gorsel-bekleniyor|placeholder|dummy)/i.test(section.image)
    ? section.image
    : "";
export const editorialParagraphs = (section) =>
  (section.paragraphs || []).filter(
    (value) => typeof value === "string" && !dummy(value),
  );
export const editorialTitle = (section) => {
  const title = clean(section.title).toLocaleLowerCase("tr");
  return !dummy(section.title) &&
    ![
      "ürünün hikayesi",
      "ürünün hikâyesi",
      "kutunun ikinci hayatı",
      "product story",
      "the product story",
      "the box’s second life",
      "the box's second life",
    ].includes(title)
    ? section.title
    : "";
};
export const hasEditorialContent = (section) =>
  section.enabled === true &&
  !!(
    editorialImage(section) ||
    editorialTitle(section) ||
    editorialParagraphs(section).length
  );
