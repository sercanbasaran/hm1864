// Canonical product paths are shared; the query selects the sales-channel view.
export const menuChannel = search => new URLSearchParams(search).get('menu') === 'store' ? 'store' : 'online';
export function channelUrl(value, channel = 'online') {
  if (typeof value !== 'string' || !/^\/?urunler(?:\/|$)/.test(value)) return value;
  const url = new URL(value, 'https://catalog.invalid/');
  if (channel === 'store') url.searchParams.set('menu', 'store'); else url.searchParams.delete('menu');
  return (value.startsWith('/') ? url.pathname : url.pathname.slice(1)) + url.search + url.hash;
}
export function catalogForChannel(data, channel = 'online') {
  if (!data?.catalogChannels) return data; // Backwards-compatible for independently reused components.
  const products = data.products.flatMap(product => {
    const variants = product.variants.filter(variant => variant.active !== false && (channel === 'store' ? variant.storeSale === true : variant.onlineSale === true));
    if (!variants.length) return [];
    const defaultVariant = variants.some(v => v.code === product.defaultVariant) ? product.defaultVariant : variants[0].code;
    return [{ ...product, variants, defaultVariant }];
  });
  const categories = data.categories.filter(c => products.some(p => p.categoryId === c.id));
  const subcategories = data.subcategories.filter(s => products.some(p => p.subcategoryId === s.id));
  return { ...data, products, categories, subcategories };
}
