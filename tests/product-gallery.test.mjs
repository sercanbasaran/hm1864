import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { Window } from 'happy-dom';
import { loadAuthoringData } from '../src/data-loader.js';

const wait = () => new Promise(resolve => setTimeout(resolve, 50));
const ready = async condition => {
  for (let i = 0; i < 100; i++) { if (condition()) return; await wait(); }
  throw Error('Product gallery did not become ready');
};

test('product gallery arrows, five-second autoplay, hover pause and variant changes stay in sync', async () => {
  const authored = await loadAuthoringData(async file => JSON.parse(await fs.readFile('public/assets/data/' + file, 'utf8')));
  const p = authored.catalog.products.find(p => p.code === '100.0102');
  const photos = p.images.slice(0, 2).concat('baklavalar/packaging/hm1864-xl-closed-front-left.webp');
  assert.equal(new Set(photos).size, 3);
  p.variants.find(v => v.code === 'XL').images = photos;
  p.variants.find(v => v.code === 'XS').images = [photos[0]];
  const window = new Window({ url: 'http://localhost/' + p.url, settings: { enableJavaScriptEvaluation: true } });
  window.localStorage.setItem('hm1864.react.preferences', JSON.stringify({ country: 'TR', language: 'tr', currency: 'TRY' }));
  window.fetch = async () => ({ ok: true, json: async () => authored });
  window.scrollTo = () => {};
  window.document.body.innerHTML = '<div id="root"></div>';
  Object.defineProperty(window.document, 'hidden', { value: false, configurable: true });
  const timers = new Map();
  const originalTimeout = window.setTimeout.bind(window), originalClear = window.clearTimeout.bind(window);
  let nextId = -1;
  window.setTimeout = (callback, delay, ...args) => {
    if (delay !== 5000) return originalTimeout(callback, delay, ...args);
    const id = nextId--; timers.set(id, () => callback(...args)); return id;
  };
  window.clearTimeout = id => { if (id < 0) timers.delete(id); else originalClear(id); };
  const tick = async () => {
    assert.equal(timers.size, 1, 'exactly one five-second gallery timer');
    const [id, callback] = timers.entries().next().value; timers.delete(id); callback(); await wait();
  };
  try {
    const files = await fs.readdir('dist/assets');
    window.eval(await fs.readFile('dist/assets/' + files.find(file => file.endsWith('.js')), 'utf8'));
    await ready(() => window.document.querySelector('.product-image-next')); await wait();
    const doc = window.document, gallery = doc.querySelector('.product-photo-gallery');
    const current = () => doc.querySelector('.product-main-image img').getAttribute('src');
    const expectPhoto = index => {
      assert.equal(current(), '/assets/images/urunler/' + photos[index]);
      assert.equal(doc.querySelector('.product-image-count').textContent, `${index + 1} / 3`);
      assert.equal([...doc.querySelectorAll('.gallery-thumb')].findIndex(el => el.getAttribute('aria-current') === 'true'), index);
    };
    expectPhoto(0);
    doc.querySelector('.product-image-previous').click(); await wait(); expectPhoto(2);
    doc.querySelector('.product-image-next').click(); await wait(); expectPhoto(0);
    assert.equal(doc.querySelector('[role="dialog"]'), null, 'arrows do not enlarge the image');
    await tick(); expectPhoto(1);
    gallery.dispatchEvent(new window.PointerEvent('pointerover', { bubbles: true, pointerType: 'mouse' })); await wait();
    assert.equal(timers.size, 0, 'hover cancels autoplay');
    doc.querySelector('.product-image-next').click(); await wait(); expectPhoto(2);
    assert.equal(timers.size, 0, 'manual navigation remains available while hovered');
    gallery.dispatchEvent(new window.PointerEvent('pointerout', { bubbles: true, pointerType: 'mouse' })); await wait();
    await tick(); expectPhoto(0);
    gallery.dispatchEvent(new window.KeyboardEvent('keydown', { bubbles: true, key: 'ArrowLeft' })); await wait(); expectPhoto(2);
    doc.querySelectorAll('.gallery-thumb')[1].click(); await wait(); expectPhoto(1);
    Object.defineProperty(doc, 'hidden', { value: true, configurable: true });
    doc.dispatchEvent(new window.Event('visibilitychange')); await wait(); assert.equal(timers.size, 0);
    Object.defineProperty(doc, 'hidden', { value: false, configurable: true });
    doc.dispatchEvent(new window.Event('visibilitychange')); await wait(); assert.equal(timers.size, 1);
    doc.querySelector('input[value="XS"]').click(); await wait();
    assert.equal(doc.querySelector('.product-image-arrow'), null); assert.equal(timers.size, 0);
    assert.equal(current(), '/assets/images/urunler/' + photos[0]);
    doc.querySelector('input[value="XL"]').click(); await wait(); assert.ok(doc.querySelector('.product-image-next'));
    await tick();
    doc.querySelector('.product-main-image').click(); await wait(); assert.equal(timers.size, 0, 'lightbox pauses autoplay');
  } finally { window.happyDOM.abort(); }
});
