import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { Window } from 'happy-dom';
import { cleanCart, cartRows, totals, validateDemoCard, DEMO_CARDS } from '../src/commerce.js';
import { loadAuthoringData } from '../src/data-loader.js';
const authored = await loadAuthoringData(async path => JSON.parse(await fs.readFile('public/assets/data/' + path, 'utf8')));
const product = authored.catalog.products.find(p => p.code === '100.0102');
const wait = () => new Promise(resolve => setTimeout(resolve, 40));
const ready = async predicate => { for (let i = 0; i < 100; i++) { if (predicate()) return; await wait(); } throw Error('Commerce UI not ready'); };

test('cart ignores stored prices, merges quantities and blocks invalid stock/currency/variants', () => {
  const items = cleanCart([{ key: product.key, variant: 'XL', quantity: 2, price: 1 }, { key: product.key, variant: 'XL', quantity: 3 }, { key: product.key, variant: 'XS', quantity: -1 }, null]);
  assert.deepEqual(items, [{ key: product.key, variant: 'XL', quantity: 5 }]);
  const data = structuredClone(authored.catalog), p = data.products.find(p => p.key === product.key), v = p.variants.find(v => v.code === 'XL');
  v.price = 12.35; v.stock = 5; v.pricesByCurrency = {};
  const rows = cartRows(items, data, 'TRY'); assert.equal(rows[0].total, 61.75); assert.equal(rows[0].available, true);
  assert.deepEqual(totals(rows, 'standard', 'TRY'), { subtotal: 61.75, shipping: 149, total: 210.75, valid: true });
  assert.equal(totals(rows, 'pickup', 'TRY').total, 61.75);
  assert.equal(totals([], 'standard', 'TRY').valid, false);
  assert.equal(cartRows(items, data, 'USD')[0].available, false);
  v.stock = 4; assert.equal(cartRows(items, data, 'TRY')[0].available, false);
  assert.equal(cartRows([{ ...items[0], variant: 'missing' }], data, 'TRY')[0].available, false);
  assert.equal(cartRows([{ ...items[0], key: 'missing' }], data, 'TRY')[0].available, false);
});

test('mock payment accepts only designated demo cards and rejects expired dates and malformed CVC', () => {
  const now = new Date(2026, 9, 19), good = { holder: 'DEMO USER', number: DEMO_CARDS.approved, expiry: '12/30', cvc: '123' };
  assert.equal(validateDemoCard(good, now), null);
  assert.equal(validateDemoCard({ ...good, number: DEMO_CARDS.declined }, now), 'declined');
  assert.equal(validateDemoCard({ ...good, number: '5555555555554444' }, now), 'testCardOnly');
  assert.equal(validateDemoCard({ ...good, expiry: '01/25' }, now), 'expiryError');
  assert.equal(validateDemoCard({ ...good, expiry: '13/30' }, now), 'expiryError');
  assert.equal(validateDemoCard({ ...good, cvc: '12' }, now), 'cvcError');
});

async function app(path, cart = []) {
  const window = new Window({ url: 'http://localhost' + path, settings: { enableJavaScriptEvaluation: true } });
  window.localStorage.setItem('hm1864.react.preferences', JSON.stringify({ country: 'TR', language: 'tr', currency: 'TRY' }));
  window.localStorage.setItem('hm1864.demo.cart', JSON.stringify(cart));
  const requests = [];
  window.fetch = async url => { requests.push(url); return { ok: true, json: async () => authored }; };
  window.scrollTo = () => {}; window.document.body.innerHTML = '<div id="root"></div>';
  const files = await fs.readdir('dist/assets'); window.eval(await fs.readFile('dist/assets/' + files.find(path => path.endsWith('.js')), 'utf8'));
  await ready(() => window.document.querySelector('.site-header')); await wait();
  return { window, doc: window.document, requests };
}
function fill(window, root, name, value) {
  const input = root.querySelector(`[name="${name}"]`); assert.ok(input, name);
  Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set.call(input, value);
  input.dispatchEvent(new window.Event('input', { bubbles: true }));
}
const submit = (window, form) => form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));

test('product adds selected variant; cart quantities and removal update persisted bag', async () => {
  const { window, doc } = await app('/' + product.url);
  try {
    doc.querySelector('input[value="XL"]').click(); await wait();
    doc.querySelector('.purchase-row > button').click(); await wait();
    assert.ok(doc.querySelector('dialog[open] .commerce-item'));
    assert.equal(JSON.parse(window.localStorage.getItem('hm1864.demo.cart'))[0].variant, 'XL');
    const quantity = doc.querySelector('.commerce-item-controls input');
    Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set.call(quantity, '2'); quantity.dispatchEvent(new window.Event('change', { bubbles: true })); await wait();
    assert.equal(JSON.parse(window.localStorage.getItem('hm1864.demo.cart'))[0].quantity, 2);
    doc.querySelector('.commerce-item-controls button').click(); await wait();
    assert.deepEqual(JSON.parse(window.localStorage.getItem('hm1864.demo.cart')), []);
  } finally { window.happyDOM.abort(); }
});

test('guest checkout supports shipping changes, declined/retry, result and never persists card data', async () => {
  const { window, doc, requests } = await app('/odeme/index.html', [{ key: product.key, variant: 'XL', quantity: 1 }]);
  try {
    for (const [key, value] of Object.entries({ name: 'Demo User', email: 'guest@example.test', phone: '+90 555 1234567', city: 'Istanbul', district: 'Fatih', address: 'Demo street 1864', postal: '34000' })) { fill(window, doc, key, value); await wait(); }
    submit(window, doc.querySelector('.commerce-form')); await wait();
    assert.ok(doc.querySelector('.commerce-shipping'));
    const standard = doc.querySelector('.commerce-total dd').textContent;
    doc.querySelector('input[value="pickup"]').click(); await wait(); assert.notEqual(doc.querySelector('.commerce-total dd').textContent, standard);
    doc.querySelector('input[value="express"]').click(); await wait();
    submit(window, doc.querySelector('.commerce-form')); await wait();
    const demoButtons = () => [...doc.querySelectorAll('.commerce-card-fields .commerce-actions button')];
    demoButtons()[1].click(); await wait(); doc.querySelector('[name="demoAcknowledgement"]').click();
    submit(window, doc.querySelector('.commerce-form')); await wait();
    assert.match(doc.querySelector('.commerce-form [role="alert"]').textContent, /reddedildi/);
    assert.equal(JSON.parse(window.localStorage.getItem('hm1864.demo.cart')).length, 1);
    demoButtons()[0].click(); await wait(); submit(window, doc.querySelector('.commerce-form'));
    await ready(() => doc.querySelector('.commerce-receipt'));
    assert.equal(window.location.pathname, '/siparis/sonuc.html');
    assert.match(doc.querySelector('.commerce-receipt').textContent, /DEMO-/);
    assert.match(doc.querySelector('.commerce-receipt').textContent, /Hızlı kargo/);
    assert.deepEqual(JSON.parse(window.localStorage.getItem('hm1864.demo.cart')), []);
    const stored = [...Array(window.localStorage.length)].map((_, i) => window.localStorage.getItem(window.localStorage.key(i))).join('');
    assert.ok(!stored.includes(DEMO_CARDS.approved)); assert.ok(!stored.includes('guest@example.test')); assert.ok(!stored.includes('demoCvc'));
    assert.equal(requests.length, 1, 'only the catalogue is fetched; payment submits no network request');
  } finally { window.happyDOM.abort(); }
});

test('sample account registration, logout, login failure and login work without credential storage', async () => {
  const { window, doc } = await app('/hesabim/kayit.html');
  try {
    for (const [name, value] of Object.entries({ fullName: 'Demo Member', email: 'member@example.test', password: 'Example1864!', confirmPassword: 'Different1864!' })) { fill(window, doc, name, value); await wait(); }
    submit(window, doc.querySelector('.commerce-auth form')); await wait(); assert.match(doc.querySelector('[role="alert"]').textContent, /eşleşmiyor/);
    fill(window, doc, 'confirmPassword', 'Example1864!'); await wait();
    submit(window, doc.querySelector('.commerce-auth form')); await wait(); assert.match(doc.querySelector('.commerce-account-status').textContent, /Demo Member/);
    doc.querySelector('.commerce-account-status button').click(); await wait(); doc.querySelector('.commerce-auth-tabs button:first-child').click(); await wait();
    fill(window, doc, 'email', 'member@example.test'); fill(window, doc, 'password', 'Wrong1864!'); await wait();
    submit(window, doc.querySelector('.commerce-auth form')); await wait(); assert.match(doc.querySelector('[role="alert"]').textContent, /hatalı/);
    fill(window, doc, 'password', 'Example1864!'); await wait(); submit(window, doc.querySelector('.commerce-auth form')); await wait();
    assert.match(doc.querySelector('.commerce-account-status').textContent, /Demo Member/);
    for (let i = 0; i < window.localStorage.length; i++) { const value = window.localStorage.getItem(window.localStorage.key(i)); assert.ok(!value.includes('Example1864!')); assert.ok(!value.includes('member@example.test')); }
  } finally { window.happyDOM.abort(); }
});
