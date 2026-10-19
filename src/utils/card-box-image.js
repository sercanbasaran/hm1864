import { safeImage, variantImages } from '../model.js';
export function cardBoxImage(product, code) {
  const variant = product.variants.find(item => item.code === code);
  const explicit = variant?.boxImage || (!product.variants.length ? product.boxImage : null);
  if (safeImage(explicit)) return explicit;
  // Never borrow another variant's packaging photo or use a lifestyle shot as a box.
  const files = variant ? variant.images || (variant.image ? [variant.image] : []) : product.variants.length ? [] : variantImages(product, code);
  return files.find(file => safeImage(file) && /(?:^|\/)(?:packaging|boxes|kutu)(?:\/|[-_\.])/i.test(file)) || null;
}
