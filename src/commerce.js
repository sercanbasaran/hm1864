import { choice, validPrice } from './model.js';

export const DEMO_CARDS = { approved: '4111111111111111', declined: '4000000000000002' };
export const shippingMethods = [
  { id: 'standard', title: 'standard', detail: 'standardTime', fees: { TRY: 149, USD: 15, EUR: 12, AED: 35, GBP: 10, DKK: 90, SEK: 130, CNY: 90, JPY: 1900 } },
  { id: 'express', title: 'express', detail: 'expressTime', fees: { TRY: 249, USD: 25, EUR: 22, AED: 60, GBP: 20, DKK: 165, SEK: 240, CNY: 160, JPY: 3400 } },
  { id: 'pickup', title: 'pickup', detail: 'pickupTime', fees: { TRY: 0, USD: 0, EUR: 0, AED: 0, GBP: 0, DKK: 0, SEK: 0, CNY: 0, JPY: 0 } },
];
export const lineId = (key, variant) => `${key}::${variant}`;
export function cleanCart(value) {
  if (!Array.isArray(value)) return [];
  const items = new Map();
  for (const item of value.slice(0, 100)) {
    if (typeof item?.key !== 'string' || typeof item.variant !== 'string' || !Number.isInteger(item.quantity) || item.quantity < 1) continue;
    const id = lineId(item.key, item.variant), previous = items.get(id);
    items.set(id, { key: item.key, variant: item.variant, quantity: Math.min(99, (previous?.quantity || 0) + item.quantity) });
  }
  return [...items.values()];
}
export function cartRows(items, data, currency) {
  return items.map(item => {
    const product = data?.products.find(p => p.key === item.key);
    const exists = product && (!product.variants.length || product.variants.some(v => v.code === item.variant));
    const selected = exists ? choice(product, item.variant, currency) : null;
    return { ...item, id: lineId(item.key, item.variant), product, selected,
      available: !!selected && selected.onlineSale !== false && validPrice(selected.price) && (selected.stock == null || selected.stock >= item.quantity),
      total: selected && validPrice(selected.price) ? Math.round(selected.price * item.quantity * 100) / 100 : null };
  });
}
export function totals(rows, method, currency) {
  const shipping = shippingMethods.find(item => item.id === method)?.fees[currency];
  const subtotal = Math.round(rows.reduce((sum, row) => sum + (row.total || 0), 0) * 100) / 100;
  return { subtotal, shipping, total: validPrice(shipping) ? Math.round((subtotal + shipping) * 100) / 100 : null,
    valid: rows.length > 0 && rows.every(row => row.available) && validPrice(shipping) };
}
export function validateDemoCard(card, now = new Date()) {
  if (!card.holder?.trim() || card.holder.trim().length < 2) return 'cardHolderError';
  const number = card.number.replace(/\D/g, '');
  if (!Object.values(DEMO_CARDS).includes(number)) return 'testCardOnly';
  const expiry = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(card.expiry);
  if (!expiry || new Date(2000 + Number(expiry[2]), Number(expiry[1]), 1) <= now) return 'expiryError';
  if (!/^\d{3}$/.test(card.cvc)) return 'cvcError';
  return number === DEMO_CARDS.declined ? 'declined' : null;
}
