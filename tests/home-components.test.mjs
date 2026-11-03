import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { build } from 'vite';
import { Window } from 'happy-dom';
import { loadAuthoringData } from '../src/data-loader.js';

const authored = await loadAuthoringData(async file => JSON.parse(await fs.readFile('public/assets/data/' + file, 'utf8')));
const sections = JSON.parse(await fs.readFile('src/components/home/sections.json', 'utf8'));
const titleForYear = year => { const item = sections.heritage.years.find(item => item.year === year); return authored.content.texts[(item.events?.[0] || item).titleKey].tr; };
const lastYear = sections.heritage.years.at(-1).year;
const wait = () => new Promise(resolve => setTimeout(resolve, 50));
const ready = async predicate => {
  for (let i = 0; i < 100; i++) { if (predicate()) return; await wait(); }
  throw Error('Homepage did not become ready');
};

test('home sections can be reused with alternate content, products and independent tab IDs', async () => {
  const entry = '\0home-reuse-test.jsx';
  const result = await build({ configFile: false, logLevel: 'silent', plugins: [{
    name: 'home-reuse-test', resolveId: id => id === 'home-reuse-test' ? entry : undefined,
    load: id => id === entry ? `
      import React from 'react';
      import {createRoot} from 'react-dom/client';
      import {AppContext} from '/src/context/AppContext.jsx';
      import Collection from '/src/components/home/CollectionSection.jsx';
      import Featured from '/src/components/home/FeaturedProductsSection.jsx';
      import Heritage from '/src/components/home/HeritageSection.jsx';
      import sections from '/src/components/home/sections.json';
      const a=window.__fixtures;
      const context={data:a.catalog,content:a.content,regions:a.regions,preferences:{language:'tr',currency:'TRY',country:'TR'}};
      createRoot(document.getElementById('root')).render(<AppContext.Provider value={context}>
        <Collection config={{...sections.collection,image:'assets/images/medya/custom.png',href:'custom-collection.html'}} />
        <Featured products={a.catalog.products.slice(0,2)} />
        <Featured products={a.catalog.products.slice(2,3)} />
        <Heritage id="history-one" initialYear="1888" />
        <Heritage id="history-two" initialYear="1926" />
      </AppContext.Provider>);
    ` : undefined,
  }], build: { write: false, minify: false, rollupOptions: { input: 'home-reuse-test', output: { format: 'iife' } } } });
  const window = new Window({ settings: { enableJavaScriptEvaluation: true } });
  try {
      window.__fixtures = authored;
      window.document.body.innerHTML = '<div id="root"></div>';
      window.eval(result.output.find(file => file.type === 'chunk').code);
      await ready(() => window.document.getElementById('history-two-content'));
      const doc = window.document;
      assert.ok(doc.querySelector('.collection-content img[src="/assets/images/medya/custom.png"]'));
      assert.equal(doc.querySelector('.collection-content a').getAttribute('href'), '/custom-collection.html');
      assert.deepEqual([...doc.querySelectorAll('.product-section')].map(section => section.querySelectorAll('.product-card').length), [2, 1]);
      assert.equal(doc.querySelector('#history-one-content h3').textContent, titleForYear('1888'));
      assert.equal(doc.querySelector('#history-two-content h3').textContent, titleForYear('1926'));
      const ids = [...doc.querySelectorAll('[id]')].map(node => node.id);
      assert.equal(new Set(ids).size, ids.length);
      for (const tab of doc.querySelectorAll('[role="tab"]')) assert.ok(doc.getElementById(tab.getAttribute('aria-controls')));
      doc.getElementById('history-one-year-1923').click(); await wait();
      assert.equal(doc.querySelector('#history-one-content h3').textContent, titleForYear('1923'));
      assert.equal(doc.querySelector('#history-two-content h3').textContent, titleForYear('1926'));
      const moved = [[], []];
      [...doc.querySelectorAll('.carousel')].forEach((node, index) => node.scrollBy = options => moved[index].push(options.left));
      doc.querySelectorAll('.carousel-controls')[1].querySelector('button:last-child').click();
      assert.deepEqual(moved, [[], [400]]);
  } finally { window.happyDOM.abort(); }
});

test('homepage retains six ordered sections, catalogue cards, carousel controls and keyboard timeline', async () => {
  const window = new Window({ url: 'http://localhost/index.html', settings: { enableJavaScriptEvaluation: true } });
  window.localStorage.setItem('hm1864.react.preferences', JSON.stringify({ country: 'TR', language: 'tr', currency: 'TRY' }));
  window.fetch = async () => ({ ok: true, json: async () => authored });
  window.scrollTo = () => {};
  window.document.body.innerHTML = '<div id="root"></div>';
  try {
    const files = await fs.readdir('dist/assets');
    window.eval(await fs.readFile('dist/assets/' + files.find(file => file.endsWith('.js')), 'utf8'));
    await ready(() => window.document.querySelector('.heritage-section'));
    const doc = window.document;
    assert.deepEqual([...doc.querySelectorAll('main > section')].map(section => section.className), [
      'hero-slider', 'collection-section', 'product-section', 'corporate', 'split stores-teaser', 'heritage-section',
    ]);
    assert.equal(doc.querySelectorAll('.product-section .product-card').length, 3);
    const expectedLinks = sections.featuredProducts.productKeys.filter(key => authored.catalog.products.find(p => p.key === key)?.onlineSale !== false).map(key => '/' + authored.catalog.products.find(p => p.key === key).url);
    assert.deepEqual([...doc.querySelectorAll('.product-section .product-card .product-picture')].map(a => a.getAttribute('href')), expectedLinks);
    const scrolled = [];
    doc.querySelector('.carousel').scrollBy = value => scrolled.push(value);
    doc.querySelector('.carousel-controls button:last-child').click();
    doc.querySelector('.carousel-controls button:first-child').click();
    assert.deepEqual(scrolled.map(value => ({ left: value.left, behavior: value.behavior })), [{ left: 400, behavior: 'smooth' }, { left: -400, behavior: 'smooth' }]);
    assert.equal(sections.heritage.years.length, 17);
    assert.equal(doc.querySelectorAll('.heritage-tabs [role="tab"]').length, 17);
    let renderedEvents = 0;
    for (const item of sections.heritage.years) {
      doc.getElementById('year-' + item.year).click(); await wait();
      const events = item.events || [item];
      assert.deepEqual([...doc.querySelectorAll('#heritage-content h3')].map(node => node.textContent), events.map(event => authored.content.texts[event.titleKey].tr));
      assert.deepEqual([...doc.querySelectorAll('#heritage-content p')].map(node => node.textContent), events.map(event => authored.content.texts[event.descriptionKey].tr));
      assert.equal(doc.querySelectorAll('.heritage-tabs [aria-selected="true"]').length, 1);
      renderedEvents += events.length;
    }
    assert.equal(renderedEvents, 17);
    assert.equal(lastYear, '2023');
    assert.equal(doc.querySelector('#heritage-content h3').textContent, titleForYear('2023'));
    for (const year of ['2019', '2023']) assert.equal(sections.heritage.years.find(item => item.year === year).events.length, 1);
    for (const year of ['1924','1948','1993','2007','2024','today']) assert.equal(doc.getElementById('year-' + year), null);
    assert.ok(doc.getElementById('year-1980s').textContent.includes('1980'));
    doc.getElementById('year-1888').click(); await wait();
    assert.equal(doc.querySelector('#heritage-content h3').textContent, titleForYear('1888'));
    assert.equal(doc.getElementById('year-1888').getAttribute('aria-selected'), 'true');
    doc.getElementById('year-1888').dispatchEvent(new window.KeyboardEvent('keydown', { key: 'End', bubbles: true })); await wait();
    assert.equal(doc.querySelector('#heritage-content h3').textContent, titleForYear(lastYear));
    assert.equal(doc.activeElement.id, 'year-' + lastYear);
    doc.getElementById('year-' + lastYear).dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Home', bubbles: true })); await wait();
    assert.equal(doc.activeElement.id, 'year-1864');
    assert.equal(doc.querySelector('#heritage-content').getAttribute('aria-labelledby'), 'year-1864');
  } finally { window.happyDOM.abort(); }
});
