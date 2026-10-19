import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { Window } from 'happy-dom';
import { loadAuthoringData } from '../src/data-loader.js';
import { money } from '../src/model.js';
import { formatText } from '../src/i18n.js';

const authored = await loadAuthoringData(async file => JSON.parse(await fs.readFile('public/assets/data/' + file, 'utf8')));
const bundle = (await fs.readdir('dist/assets')).find(file => file.endsWith('.js'));
const script = await fs.readFile('dist/assets/' + bundle, 'utf8');
const wait = () => new Promise(resolve => setTimeout(resolve, 35));
const ready = async predicate => {
  for (let i = 0; i < 100; i++) { if (predicate()) return; await wait(); }
  throw Error('Product cards did not become ready');
};

for (const currency of ['TRY', 'USD']) {
  test(`card variant selection updates exact ${currency} price without navigation or affecting another card`, async () => {
    const fixture = structuredClone(authored);
    const product = fixture.catalog.products.find(p => p.code === '100.0102');
    product.price = null;
    product.pricesByCurrency = {};
    for (const variant of product.variants) { variant.price = null; variant.pricesByCurrency = {}; variant.stock = null; variant.onlineSale = true; }
    Object.assign(product.variants.find(v => v.code === 'XS'), { price: 0, pricesByCurrency: { USD: 0 } });
    Object.assign(product.variants.find(v => v.code === 'S'), { price: 222, pricesByCurrency: { USD: 9.99 } });
    product.variants.find(v => v.code === 'XL').price = 444;
    Object.assign(product.variants.find(v => v.code === 'porsiyon'), { price: 333, onlineSale: false });
    const route = '/' + fixture.catalog.categories.find(c => c.id === 'baklavalar').url;
    const window = new Window({ url: 'http://localhost' + route, settings: { enableJavaScriptEvaluation: true } });
    window.localStorage.setItem('hm1864.react.preferences', JSON.stringify({ country: 'TR', language: 'tr', currency }));
    window.fetch = async () => ({ ok: true, json: async () => fixture });
    window.scrollTo = () => {};
    window.document.body.innerHTML = '<div id="root"></div>';
    try {
      window.eval(script);
      const findCard = () => [...window.document.querySelectorAll('.product-card')].find(card => card.querySelector('.product-picture').getAttribute('href') === '/' + product.url);
      await ready(findCard);
      const card = findCard(), other = [...window.document.querySelectorAll('.product-card')].find(item => item !== card);
      const otherPrice = other.querySelector('.card-meta').textContent;
      const otherSelection = [...other.querySelectorAll('.card-variant-label')].map(b => b.getAttribute('aria-pressed'));
      const buttons = [...card.querySelectorAll('.card-variant-label')];
      const button = code => buttons[product.variants.findIndex(v => v.code === code)];
      const price = () => card.querySelector('.card-meta').textContent;
      assert.equal(card.querySelector('.card-variants-title').textContent, 'Porsiyon Seçenekleri');
      assert.equal(buttons.length, product.variants.length);
      assert.ok(buttons.every(button => button.tagName === 'BUTTON' && button.textContent.trim()));
      assert.equal(button('XS').getAttribute('aria-pressed'), 'true');
      assert.equal(price(), money(0, currency, '', 'tr'));
      assert.equal(card.querySelector('.card-add-to-cart').disabled, false);
      button('S').click(); await wait();
      assert.equal(price(), money(currency === 'TRY' ? 222 : 9.99, currency, '', 'tr'));
      assert.equal(button('S').getAttribute('aria-pressed'), 'true');
      assert.equal(card.querySelectorAll('[aria-pressed="true"]').length, 1);
      button('XS').click(); await wait();
      assert.equal(price(), money(0, currency, '', 'tr'));
      assert.equal(button('S').getAttribute('aria-pressed'), 'false');
      assert.equal(button('XS').getAttribute('aria-pressed'), 'true');
      button('XL').click(); await wait();
      assert.equal(price(), currency === 'TRY' ? money(444, currency, '', 'tr') : formatText(fixture.content, 'tr', 'ui.priceUnavailableCurrency', { currency }));
      button('porsiyon').click(); await wait();
      assert.ok(card.querySelector('.card-store-only'));
      button('S').click(); await wait();
      assert.equal(card.querySelector('.card-store-only'), null);
      assert.equal(window.location.pathname, route);
      assert.equal(other.querySelector('.card-meta').textContent, otherPrice);
      assert.deepEqual([...other.querySelectorAll('.card-variant-label')].map(b => b.getAttribute('aria-pressed')), otherSelection);
    } finally { window.happyDOM.abort(); }
  });
}

test('card adds selected variant to cart and automatically selects lowest purchasable variant and blocks unavailable variants and stock overflow', async () => {
  const fixture = structuredClone(authored), product = fixture.catalog.products.find(p => p.code === '100.0102');
  product.variants.forEach(v => { v.price = 100; v.onlineSale = true; v.stock = 4; });
  product.price = null;
  product.variants.forEach(v => { v.price = 300; });
  Object.assign(product.variants.find(v => v.code === 'S'), { stock: 2, price: 200 });
  product.variants.find(v => v.code === 'XS').price = 0;
  product.variants.find(v => v.code === 'porsiyon').price = 1;
  product.variants.find(v => v.code === 'L').price = null;
  product.variants.find(v => v.code === 'XS').stock = 0;
  product.variants.find(v => v.code === 'porsiyon').onlineSale = false;
  const route = '/' + fixture.catalog.categories.find(c => c.id === 'baklavalar').url;
  const window = new Window({url:'http://localhost'+route,settings:{enableJavaScriptEvaluation:true}});
  window.localStorage.setItem('hm1864.react.preferences',JSON.stringify({country:'TR',language:'tr',currency:'TRY'}));
  window.fetch = async () => ({ok:true,json:async()=>fixture}); window.scrollTo=()=>{};
  window.document.body.innerHTML='<div id="root"></div>';
  try {
    window.eval(script);
    const card = () => [...window.document.querySelectorAll('.product-card')].find(c => c.querySelector('.product-picture').getAttribute('href') === '/'+product.url);
    await ready(card);
    const add=()=>card().querySelector('.card-add-to-cart');
    const select=async code=>{card().querySelectorAll('.card-variant-label')[product.variants.findIndex(v=>v.code===code)].click();await wait();};
    assert.equal(add().disabled,false);assert.equal(card().querySelector('.card-cart-hint'),null);
    assert.equal(card().querySelector('.card-box-photo'), null);
    assert.equal(card().querySelectorAll('.card-variant-label')[product.variants.findIndex(v=>v.code==='S')].getAttribute('aria-pressed'),'true');
    assert.equal(card().querySelector('.card-meta').textContent, money(200,'TRY','','tr'));
    await select('XL');
    assert.ok(card().querySelector('.has-box-preview'));
    assert.equal(card().querySelector('.card-box-photo img').getAttribute('src'), '/assets/images/urunler/baklavalar/packaging/hm1864-xl-closed-front-left.webp');
    await select('XS');assert.equal(add().disabled,true);
    assert.equal(card().querySelector('.card-box-photo'), null);
    await select('porsiyon');assert.equal(add().disabled,true);
    await select('S');assert.equal(add().disabled,false);
    add().click();await ready(()=>window.document.querySelector('.commerce-cart-dialog'));
    assert.deepEqual(JSON.parse(window.localStorage.getItem('hm1864.demo.cart')),[{key:product.key,variant:'S',quantity:1}]);
    assert.equal(window.location.pathname,route);
    window.document.querySelector('dialog').close();await wait();
    add().click();await wait();assert.equal(add().disabled,true);
    assert.equal(JSON.parse(window.localStorage.getItem('hm1864.demo.cart'))[0].quantity,2);
    assert.ok(card().querySelector('.card-view-product'));
  } finally { await window.happyDOM.abort(); }
});
