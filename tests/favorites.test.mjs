import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { Window } from 'happy-dom';
import { loadAuthoringData } from '../src/data-loader.js';
import { cleanFavorites } from '../src/hooks/useFavorites.js';
const fixture = await loadAuthoringData(async file => JSON.parse(await fs.readFile('public/assets/data/' + file, 'utf8')));
const bundle = (await fs.readdir('dist/assets')).find(file => file.endsWith('.js'));
const script = await fs.readFile('dist/assets/' + bundle, 'utf8');
const wait = () => new Promise(resolve => setTimeout(resolve, 40));
async function ready(predicate) { for (let i=0;i<100;i++) { if(predicate()) return; await wait(); } throw Error('UI not ready'); }
function mount(path, saved = []) {
  const window = new Window({ url: 'http://localhost' + path, settings: { enableJavaScriptEvaluation: true } });
  window.localStorage.setItem('hm1864.react.preferences', JSON.stringify({country:'TR',language:'tr',currency:'TRY'}));
  window.localStorage.setItem('hm1864.favorites', JSON.stringify(saved));
  window.fetch = async () => ({ok:true,json:async()=>fixture});
  window.scrollTo = () => {};
  window.document.body.innerHTML = '<div id="root"></div>';
  window.eval(script); return window;
}
test('favorite keys reject malformed data and deduplicate',()=>{
 assert.deepEqual(cleanFavorites(null),[]);
 assert.deepEqual(cleanFavorites(['a','a',null,{},'',42,'b']),['a','b']);
});
test('card favorites persist, synchronize with detail, and can be removed from favorites page',async()=>{
 let window=mount('/urunler/baklavalar/index.html');
 try {
  await ready(()=>window.document.querySelector('.favorite-button'));
  const card=window.document.querySelector('.product-card');
  const path=card.querySelector('.product-picture').getAttribute('href');
  const button=card.querySelector('.favorite-button');
  assert.equal(button.getAttribute('aria-pressed'),'false');button.click();await wait();
  assert.equal(button.getAttribute('aria-pressed'),'true');
  assert.equal(window.location.pathname,'/urunler/baklavalar/index.html');
  const saved=JSON.parse(window.localStorage.getItem('hm1864.favorites'));
  assert.equal(saved.length,1);assert.equal(typeof saved[0],'string');
  await window.happyDOM.abort();window=mount(path,saved);
  await ready(()=>window.document.querySelector('.product-info > .favorite-button'));
  assert.equal(window.document.querySelector('.product-info > .favorite-button').getAttribute('aria-pressed'),'true');
  window.document.querySelector('.favorites-link').click();
  await ready(()=>window.document.querySelector('.favorites-page .product-card'));
  assert.equal(window.document.querySelectorAll('.favorites-page .product-card').length,1);
  window.document.querySelector('.favorites-page .favorite-button').click();
  await ready(()=>window.document.querySelector('.favorites-page [role="status"]')?.textContent.includes('Henüz'));
  assert.deepEqual(JSON.parse(window.localStorage.getItem('hm1864.favorites')),[]);
 } finally { await window.happyDOM.abort(); }
});
test('favorites page ignores products missing from current catalog',async()=>{
 const window=mount('/hesabim/favorilerim.html',['missing-product']);
 try { await ready(()=>window.document.querySelector('.favorites-page'));assert.equal(window.document.querySelectorAll('.favorites-page .product-card').length,0);assert.ok(window.document.querySelector('.favorites-page .button').textContent.includes('Alışveriş')); }
 finally { await window.happyDOM.abort(); }
});
