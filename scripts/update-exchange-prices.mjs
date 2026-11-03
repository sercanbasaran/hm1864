import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

export const API = 'https://api.frankfurter.dev/v2/rates';

export function validatedRates(rows, currencies) {
  if (!Array.isArray(rows)) throw Error('Frankfurter kur yanıtı bir liste olmalı.');
  const result = {};
  for (const row of rows) {
    if (row.base !== 'TRY' || !currencies.includes(row.quote)) throw Error('Beklenmeyen kur çifti.');
    if (result[row.quote]) throw Error('Tekrarlanan kur çifti: ' + row.quote);
    if (typeof row.rate !== 'number' || !Number.isFinite(row.rate) || row.rate <= 0) throw Error('Geçersiz kur: ' + row.quote);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(row.date) || new Date(row.date).toISOString().slice(0,10) !== row.date) throw Error('Geçersiz kur tarihi.');
    result[row.quote] = {rate: row.rate, date: row.date};
  }
  for (const currency of currencies) if (!result[currency]) throw Error('Eksik kur: ' + currency);
  return result;
}

// Decimal arithmetic keeps half-up rounding exact (including values such as 1.005).
function decimal(value) {
  const [mantissa, exponent = '0'] = String(value).toLowerCase().split('e');
  const [whole, fraction = ''] = mantissa.split('.');
  const power = fraction.length - Number(exponent);
  const numerator = BigInt(whole + fraction);
  return power < 0 ? [numerator * 10n ** BigInt(-power), 1n] : [numerator, 10n ** BigInt(power)];
}
export function convertPrice(amount, rate) {
  if (amount == null) return null;
  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount < 0) throw Error('Geçersiz TRY fiyatı.');
  if (typeof rate !== 'number' || !Number.isFinite(rate) || rate <= 0) throw Error('Geçersiz kur.');
  const [a, b] = decimal(amount), [c, d] = decimal(rate);
  const price = Number((2n * a * c + b * d) / (2n * b * d));
  if (!Number.isSafeInteger(price)) throw Error('Dönüştürülen fiyat güvenli sayı sınırını aşıyor.');
  return price;
}
export function convertPriceMap(prices, rates) {
  if (!Object.hasOwn(prices, 'TRY')) throw Error('TRY fiyat alanı bulunamadı.');
  return {...prices, ...Object.fromEntries(Object.entries(rates).map(([currency, entry]) => [currency, convertPrice(prices.TRY, entry.rate)]))};
}

export async function updateExchangePrices(root = path.resolve('public/assets/data'), fetcher = fetch) {
  const settings = JSON.parse(await fs.readFile(path.join(root, 'settings/regions.json'), 'utf8'));
  const currencies = [...new Set(settings.currencies)].filter(c => c !== 'TRY').sort();
  const url = API + '?' + new URLSearchParams({base: 'TRY', quotes: currencies.join(',')});
  const response = await fetcher(url, {signal: AbortSignal.timeout(30000)});
  if (!response.ok) throw Error('Frankfurter isteği başarısız: HTTP ' + response.status);
  const rates = validatedRates(await response.json(), currencies);
  const manifest = JSON.parse(await fs.readFile(path.join(root, 'catalog/manifest.json'), 'utf8'));
  const writes = []; let products = 0, variants = 0;
  // Validate and calculate the entire catalogue before modifying any price file.
  for (const category of manifest.categories) {
    const file = path.join(root, category.prices);
    const source = JSON.parse(await fs.readFile(file, 'utf8'));
    for (const product of Object.values(source.products)) {
      product.base = convertPriceMap(product.base, rates); products++;
      for (const [code, prices] of Object.entries(product.variants)) {
        product.variants[code] = convertPriceMap(prices, rates); variants++;
      }
    }
    writes.push([file, source]);
  }
  const snapshot = {schemaVersion: 1, provider: 'Frankfurter', apiVersion: 'v2', sourceUrl: url,
    base: 'TRY', fetchedAt: new Date().toISOString(), rounding: 'nearest-whole-unit-half-up', rates};
  writes.push([path.join(root, 'settings/exchange-rates.json'), snapshot]);
  for (const [file, data] of writes) {
    const temporary = file + '.fx-tmp';
    await fs.writeFile(temporary, JSON.stringify(data, null, 2) + '\n');
    await fs.rename(temporary, file);
  }
  return {products, variants, currencies, dates: [...new Set(Object.values(rates).map(r => r.date))].sort()};
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  updateExchangePrices().then(result => console.log(JSON.stringify(result))).catch(error => {console.error(error.message);process.exitCode = 1;});
}
