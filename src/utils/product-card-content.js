import { hasRealText } from "./product-content.js";
import { plainText } from "../formatted-text.js";

// A mixed-availability product can still be purchased online through an eligible variant.
export function isOnlineSaleUnavailable(product) {
  return product.variants?.length
    ? product.variants.every(variant => (variant.onlineSale ?? product.onlineSale) === false)
    : product.onlineSale === false;
}

// Products have already been localized by regionalCatalog.
export function productCardContent(product, placeholders = [], formatSlices = value => String(value)) {
  const real = value => hasRealText(value, placeholders);
  const description = real(product.description) ? product.description : "";
  const variants = (product.variants || []).map(variant => {
    const label = real(variant.label) ? variant.label : variant.code;
    const dimensions = [...new Set([product.quantityUnit === "slice" ? (variant.sliceCount != null ? formatSlices(variant.sliceCount) : "") : variant.portion, variant.weight].filter(real))]
      .filter(value => !plainText(label).includes(plainText(value)));
    const variantDescription = real(variant.description) && plainText(variant.description).trim() !== plainText(description).trim()
      ? variant.description : "";
    return { code: variant.code, label, dimensions, description: variantDescription };
  });
  return { description, variants };
}
