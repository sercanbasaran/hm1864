const textOf = (value) =>
  String(value ?? "")
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;|&#160;/gi, " ")
    .trim();
export function hasRealText(value, placeholders = []) {
  const text = textOf(value);
  if (!text || /^[.\s…_-]+$/.test(text)) return false;
  if (placeholders.some((p) => text === textOf(p))) return false;
  return !/^(lorem ipsum|dummy(?:\s|$)|placeholder(?:\s|$)|içerik (gelecek|bekleniyor)|content (coming soon|pending)|bilgi eklenecek|alerjen bilgisi eklenecek|information to be added)/i.test(
    text,
  );
}
export function nutritionRows(nutrition, placeholders = []) {
  return (nutrition?.values || []).filter((row) =>
    typeof row.value === "number"
      ? Number.isFinite(row.value)
      : typeof row.value === "string" && hasRealText(row.value, placeholders),
  );
}
