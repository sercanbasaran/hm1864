import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {Window} from 'happy-dom';
import {validate,choice,match,resolve,menuCategories,menuSubcategories} from '../src/model.js';
import {validateRegions,validateRegionalCatalog,normalizePreferences,regionalCatalog} from '../src/market.js';
import {validateContent,translate,formatText,templateText} from '../src/i18n.js';
const data=JSON.parse(await fs.readFile('public/assets/data/products.json','utf8'));
const rawRegions=JSON.parse(await fs.readFile('public/assets/data/regions.json','utf8'));
const content=validateContent(JSON.parse(await fs.readFile('public/assets/data/content.json','utf8')));
const regions=validateRegions(rawRegions,content.languages);
const routes=JSON.parse(await fs.readFile('src/routes.json','utf8'));
const templateJSON=await fs.readFile('src/templates.json','utf8');
test('catalogue, all 376 routes, and variant data are retained',()=>{validate(data);assert.equal(data.products.length,163);assert.equal(data.products.filter(p=>p.variants.length).length,79);for(const url of Object.keys(routes))assert.ok(resolve('/'+url,data,routes));for(const p of data.products){assert.equal(resolve('/'+p.url,data,routes).product.key,p.key);assert.equal(resolve('/'+p.url.replace(/\.html$/,''),data,routes).product.key,p.key);}assert.equal(resolve('/unknown.html',data,routes).kind,'404');assert.ok(match(data.products.find(p=>p.code==='100-01-02'),'FISTIKLI'));const p={...data.products[0],price:100,stock:5,variants:[{code:'S',price:0,stock:0}]};assert.equal(choice(p,'S').price,0);assert.equal(choice(p,'S').stock,0);});
test('region preferences, localized names and explicit product availability',()=>{
 validateRegions(rawRegions,content.languages);
 assert.deepEqual(normalizePreferences({country:'Türkiye',language:'Türkçe'},regions,content),{country:'TR',language:'tr'});
 assert.equal(normalizePreferences({country:'XX',language:'en'},regions,content),null);
 const sample=structuredClone(data),product=sample.products[0];
 product.markets=['TR'];product.translations={en:{name:'Water Börek'}};
 sample.categories[0].translations={en:{name:'Breakfast'}};
 sample.subcategories[0].translations={en:{name:'Pastries'}};
 validateRegionalCatalog(sample,regions);
 assert.throws(()=>validateRegionalCatalog({...sample,products:[{...product,markets:['ZZ']}]},regions));
 const tr=regionalCatalog(sample,{country:'TR',language:'en'},regions);
 const ae=regionalCatalog(sample,{country:'AE',language:'en'},regions);
 assert.equal(tr.products[0].name,'Water Börek');
 assert.equal(tr.products[0].category,'Breakfast');
 assert.equal(tr.products[0].subcategory,'Pastries');
 assert.ok(!ae.products.some(p=>p.key===product.key));
 assert.equal(ae.products.length,sample.products.length-1);
 assert.equal(sample.products[0].name,'Su Böreği');
});
const wait=()=>new Promise(r=>setTimeout(r,50));
test('returning visitor retains the selection without another first-visit dialog',async()=>{
 const window=new Window({url:'http://localhost/index.html',settings:{enableJavaScriptEvaluation:true}});
 window.localStorage.setItem('hm1864.react.preferences',JSON.stringify({country:'Birleşik Arap Emirlikleri',language:'English'}));
 window.fetch=async url=>({ok:true,json:async()=>url.includes('regions.json')?rawRegions:url.includes('content.json')?content:data});
 window.scrollTo=()=>{};window.document.body.innerHTML='<div id="root"></div>';
 const files=await fs.readdir('dist/assets');const js=await fs.readFile('dist/assets/'+files.find(f=>f.endsWith('.js')),'utf8');
 try{window.eval(js);await wait();await wait();assert.equal(window.document.documentElement.lang,'en');assert.equal(window.document.querySelector('dialog.region-dialog'),null);assert.match(window.document.querySelector('.header-service').textContent,/United Arab Emirates/)}finally{window.happyDOM.abort()}
});
test('built React application: navigation, variant update, dialogs, menu and slider',async()=>{
 const window=new Window({url:'http://localhost/index.html',settings:{enableJavaScriptEvaluation:true}});
 const edited=structuredClone(data);const p=edited.products.find(p=>p.code==='100-01-02');p.variants[0].price=111;p.variants[1].price=222;p.variants[1].weight='500 g';
 edited.products[0].markets=['TR'];
 const hidden=edited.categories.find(c=>c.name==='Kahvaltılıklar');hidden.megaMenuOnline=false;
 edited.subcategories.find(s=>s.name==='Cevizli Baklavalar').megaMenuOnline=false;
 const featured=edited.categories.find(c=>c.name==='Drajeler');featured.highlightOnHeader=true;
 assert.equal(menuCategories(edited).length,13);
 assert.equal(menuCategories(edited,'store').length,14);
 assert.equal(menuSubcategories(edited,'Baklavalar').length,1);
 window.console=console;window.fetch=async url=>({ok:true,json:async()=>url.includes('regions.json')?rawRegions:url.includes('content.json')?content:edited});window.scrollTo=()=>{};
 window.document.body.innerHTML='<div id="root"></div>';
 const files=await fs.readdir('dist/assets');const js=await fs.readFile('dist/assets/'+files.find(f=>f.endsWith('.js')),'utf8');
 try{
 window.eval(js);await wait();await wait();
 assert.ok(window.document.querySelector('dialog.region-dialog[open]'));
 assert.equal(window.document.querySelector('.region-dialog .dialog-close'),null);
 window.document.querySelector('.region-dialog select[name="country"]').value='AE';
 window.document.querySelector('.region-dialog select[name="country"]').dispatchEvent(new window.Event('change',{bubbles:true}));await wait();
 window.document.querySelector('.region-dialog select[name="language"]').value='en';
 window.document.querySelector('.region-dialog select[name="language"]').dispatchEvent(new window.Event('change',{bubbles:true}));await wait();
 window.document.querySelector('.region-dialog form button[type="submit"]').click();await wait();
 assert.equal(JSON.parse(window.localStorage.getItem('hm1864.react.preferences')).country,'AE');
 assert.equal(window.document.documentElement.lang,'en');
 window.document.querySelector('[aria-label="Arama"]').click();await wait();assert.equal(window.document.querySelectorAll('.search-result').length,162);
 window.document.querySelector('[aria-label="Kapat"]').click();await wait();
 window.document.querySelector('.header-service button').click();await wait();
 window.document.querySelector('.region-dialog select[name="country"]').value='TR';
 window.document.querySelector('.region-dialog select[name="country"]').dispatchEvent(new window.Event('change',{bubbles:true}));await wait();
 window.document.querySelector('.region-dialog form button[type="submit"]').click();await wait();
 assert.equal(window.document.documentElement.lang,'tr');
 assert.ok(window.document.querySelector('.header-gold'));
 assert.ok([...window.document.querySelectorAll('.header-categories .nav-button')].some(b=>b.textContent.includes('Drajeler')));
 assert.ok(![...window.document.querySelectorAll('.header-categories .nav-button')].some(b=>b.textContent.includes('Kahvaltılıklar')));
 assert.equal(window.document.querySelectorAll('.react-slide').length,4);
 window.document.querySelector('.all-menu').dispatchEvent(new window.MouseEvent('click',{bubbles:true}));await new Promise(r=>setTimeout(r,600));assert.ok(window.document.querySelector('#mega-menu'));assert.equal(window.document.querySelectorAll('.mega-columns h3').length,13);
 assert.ok(!window.document.querySelector('.mega-columns').textContent.includes('Kahvaltılıklar'));
 assert.ok(!window.document.querySelector('.mega-columns').textContent.includes('Cevizli Baklavalar'));
 window.document.querySelectorAll('.mega-tabs button')[1].click();await wait();assert.equal(window.document.querySelectorAll('.mega-columns h3').length,14);
 window.document.querySelector('.menu-scrim').click();await wait();
 window.document.querySelector('[aria-label="Sonraki slayt"]').click();await wait();assert.match(window.document.querySelector('.hero-track').getAttribute('style'),/-100%/);
 window.document.getElementById('year-1888').click();await wait();assert.match(window.document.getElementById('heritage-content').textContent,/1888/);
 const link=window.document.createElement('a');link.href='/'+p.url;window.document.querySelector('#main').appendChild(link);link.click();await wait();
 assert.equal(window.document.querySelector('h1').textContent,p.name);assert.match(window.document.querySelector('.detail-price').textContent,/111/);
 for(const href of ['/index.html','/urunler/index.html','/'+p.url,'/index.html','/'+p.url]){
   const nav=window.document.createElement('a');nav.href=href;window.document.querySelector('#main').appendChild(nav);nav.click();await wait();
   assert.equal(window.document.querySelectorAll('header.site-header').length,1,`Header repeated at ${href}`);
 }
 const option=window.document.querySelector('input[value="S"]');option.click();await wait();assert.match(window.document.querySelector('.detail-price').textContent,/222/);assert.match(window.document.querySelector('.product-variants').textContent,/500 g/);
 window.document.querySelector('[aria-label="Arama"]').click();await wait();assert.ok(window.document.querySelector('dialog[open]'));assert.equal(window.document.querySelectorAll('.search-result').length,163);
 window.document.querySelector('[aria-label="Kapat"]').click();await wait();assert.equal(window.document.querySelector('dialog'),null);

 }finally{window.happyDOM.abort();}
});

test('centralized static text keys and language fallback',()=>{
 assert.equal(translate(content,'en','ui.allMenu'),'ALL MENU');
 assert.equal(translate(content,'en','ui.copy.001'),content.texts['ui.copy.001'].tr);
 assert.equal(formatText(content,'en','ui.countProducts',{count:12}),'12 products');
 assert.equal(templateText(content,'en','@text:ui.allMenu'),'ALL MENU');
 const templates=JSON.parse(templateJSON);
 const used=new Set();const scan=v=>{if(typeof v==='string'){const m=v.match(/^\s*@text:([\w.]+)\s*$/);if(m)used.add(m[1])}else if(Array.isArray(v))v.forEach(scan);else if(v&&typeof v==='object')Object.values(v).forEach(scan)};scan(templates);
 for(const r of Object.values(routes))if(r.titleKey)used.add(r.titleKey);
 for(const key of used)assert.ok(content.texts[key],`Missing static text: ${key}`);
 assert.ok(used.size>200);
 assert.equal(Object.keys(content.texts).length>400,true);
});
