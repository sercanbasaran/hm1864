import {buildBreadcrumbs} from '../src/routing/breadcrumbs.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {Window} from 'happy-dom';
import {validate,choice,cardPrice,money,match,resolve,menuCategories,menuSubcategories,storeOnly,variantImages,slug} from '../src/model.js';
import {validateRegions,validateRegionalCatalog,normalizePreferences,regionalCatalog,countryDefaults} from '../src/market.js';
import {validateContent,translate,formatText,templateText} from '../src/i18n.js';
import {loadAuthoringData,localizedEditorial} from '../src/data-loader.js';
import {parseFormattedText,plainText} from '../src/formatted-text.js';
const authored=await loadAuthoringData(async file=>JSON.parse(await fs.readFile('public/assets/data/'+file,'utf8')));
const data=authored.catalog;
const rawRegions=authored.regions;
const content=validateContent(authored.content);
const regions=validateRegions(rawRegions,content.languages);
const routes=JSON.parse(await fs.readFile('src/routes.json','utf8'));
const templateJSON=JSON.stringify(Object.fromEntries(await Promise.all(['header','footer','home','stores'].map(async name=>[name,JSON.parse(await fs.readFile('src/templates/'+name+'.json','utf8'))]))));
test('catalogue, legacy routes, and variant data are retained',()=>{validate(data);assert.equal(data.products.length,164);assert.equal(data.products.filter(p=>p.variants.length).length,97);for(const url of Object.keys(routes))assert.ok(resolve('/'+url,data,routes));for(const p of data.products){assert.equal(resolve('/'+p.url,data,routes).product.key,p.key);assert.equal(resolve('/'+p.url.replace(/\.html$/,''),data,routes).product.key,p.key);}assert.equal(resolve('/unknown.html',data,routes).kind,'404');assert.ok(match(data.products.find(p=>p.code==='100-01-02'),'FISTIKLI'));const p={...data.products[0],price:100,stock:5,variants:[{code:'S',price:0,stock:0}]};assert.equal(choice(p,'S').price,0);assert.equal(choice(p,'S').stock,0);});
test('region preferences, localized names and explicit product availability',()=>{
 validateRegions(rawRegions,content.languages);
 assert.deepEqual(normalizePreferences({country:'Türkiye',language:'Türkçe'},regions,content),{group:'turkey',country:'TR',language:'tr',currency:'TRY'});
 assert.equal(normalizePreferences({country:'XX',language:'en'},regions,content),null);
 assert.deepEqual(normalizePreferences({country:'AE',language:'tr',currency:'GBP'},regions,content),{group:'gcc',country:'AE',language:'tr',currency:'GBP'});
 assert.equal(normalizePreferences({country:'AE',language:'en',currency:'XXX'},regions,content),null);
 assert.equal(countryDefaults(regions,'AE').currency,'AED');
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
 product.markets=['gcc'];validateRegionalCatalog(sample,regions);
 assert.ok(regionalCatalog(sample,{country:'AE',language:'en'},regions).products.some(p=>p.key===product.key));
 assert.ok(!regionalCatalog(sample,{country:'TR',language:'en'},regions).products.some(p=>p.key===product.key));
 assert.throws(()=>validateRegionalCatalog({...sample,products:[{...product,pricesByCurrency:{USD:-1}}]},regions));
});
const wait=()=>new Promise(r=>setTimeout(r,50));
const waitFor=async predicate=>{for(let i=0;i<80;i++){if(predicate())return;await wait()}throw Error('UI did not become ready')};
test('returning visitor retains the selection without another first-visit dialog',async()=>{
 const window=new Window({url:'http://localhost/index.html',settings:{enableJavaScriptEvaluation:true}});
 window.localStorage.setItem('hm1864.react.preferences',JSON.stringify({country:'Birleşik Arap Emirlikleri',language:'English'}));
 window.fetch=async url=>({ok:true,json:async()=>({catalog:data,regions:rawRegions,content})});
 window.scrollTo=()=>{};window.document.body.innerHTML='<div id="root"></div>';
 const files=await fs.readdir('dist/assets');const js=await fs.readFile('dist/assets/'+files.find(f=>f.endsWith('.js')),'utf8');
 try{window.eval(js);await waitFor(()=>window.document.querySelector('header.site-header'));await wait();assert.equal(window.document.documentElement.lang,'en');assert.equal(window.document.querySelector('dialog.region-dialog'),null);assert.match(window.document.querySelector('.header-service').textContent,/AED/);assert.match(window.document.querySelector('.header-service').textContent,/United Arab Emirates/)}finally{window.happyDOM.abort()}
});
test('built React application: navigation, variant update, dialogs, menu and slider',async()=>{
 const window=new Window({url:'http://localhost/index.html',settings:{enableJavaScriptEvaluation:true}});
 const edited=structuredClone(data);const p=edited.products.find(p=>p.code==='100-01-02');p.variants[0].price=111;p.variants[1].price=222;p.variants[1].pricesByCurrency={USD:9.99};p.variants[1].description='<strong onclick="window.bad=1">Deneme</strong><br><b>Kalın</b><script>window.bad=1</script>';p.variants[1].weight='500 g';p.variants[0].images=['pastalar/test-xs.png','pastalar/test-xs-2.png'];p.variants[1].images=['pastalar/test-s.png','pastalar/test-s-2.png'];
 edited.products.find(x=>x.name==='Lotus Kulesi').editorial[0].enabled=false;
 edited.products[0].markets=['TR'];
 const hidden=edited.categories.find(c=>c.name==='Kahvaltılıklar');hidden.megaMenuOnline=false;
 edited.subcategories.find(s=>s.name==='Cevizli Baklavalar').megaMenuOnline=false;
 const featured=edited.categories.find(c=>c.name==='Drajeler');featured.highlightOnHeader=true;
 assert.equal(menuCategories(edited).length,13);
 assert.equal(menuCategories(edited,'store').length,14);
 assert.equal(menuSubcategories(edited,'Baklavalar').length,1);
 window.console=console;window.fetch=async url=>({ok:true,json:async()=>({catalog:edited,regions:rawRegions,content})});window.scrollTo=()=>{};
 window.document.body.innerHTML='<div id="root"></div>';
 const files=await fs.readdir('dist/assets');const js=await fs.readFile('dist/assets/'+files.find(f=>f.endsWith('.js')),'utf8');
 try{
 window.eval(js);await waitFor(()=>window.document.querySelector('header.site-header'));await wait();
 assert.ok(window.document.querySelector('dialog.region-dialog[open]'));
 assert.equal(window.document.querySelector('.region-dialog .dialog-close'),null);
 window.document.querySelector('.region-dialog select[name="group"]').value='gcc';
 window.document.querySelector('.region-dialog select[name="group"]').dispatchEvent(new window.Event('change',{bubbles:true}));await wait();
 window.document.querySelector('.region-dialog select[name="country"]').value='AE';
 window.document.querySelector('.region-dialog select[name="country"]').dispatchEvent(new window.Event('change',{bubbles:true}));await wait();
 assert.equal(window.document.querySelector('.region-dialog select[name="currency"]').value,'AED');
 window.document.querySelector('.region-dialog select[name="language"]').value='en';
 window.document.querySelector('.region-dialog select[name="language"]').dispatchEvent(new window.Event('change',{bubbles:true}));await wait();
 window.document.querySelector('.region-dialog form button[type="submit"]').click();await wait();
 assert.deepEqual(JSON.parse(window.localStorage.getItem('hm1864.react.preferences')),{group:'gcc',country:'AE',language:'en',currency:'AED'});
 assert.equal(window.document.documentElement.lang,'en');
 window.document.querySelector('[aria-label="Arama"]').click();await wait();assert.equal(window.document.querySelectorAll('.search-result').length,163);
 window.document.querySelector('[aria-label="Kapat"]').click();await wait();
 window.document.querySelector('.header-service button').click();await wait();
 window.document.querySelector('.region-dialog select[name="group"]').value='turkey';
 window.document.querySelector('.region-dialog select[name="group"]').dispatchEvent(new window.Event('change',{bubbles:true}));await wait();
 window.document.querySelector('.region-dialog select[name="country"]').value='TR';
 window.document.querySelector('.region-dialog select[name="country"]').dispatchEvent(new window.Event('change',{bubbles:true}));await wait();
 window.document.querySelector('.region-dialog form button[type="submit"]').click();await wait();
 assert.equal(window.document.documentElement.lang,'tr');
 assert.equal(window.document.querySelector('.header-service button').textContent.includes('TRY'),true);
 assert.ok(window.document.querySelector('.header-gold'));
 assert.ok([...window.document.querySelectorAll('.header-categories .nav-button')].some(b=>b.textContent.includes('Drajeler')));
 assert.ok(![...window.document.querySelectorAll('.header-categories .nav-button')].some(b=>b.textContent.includes('Kahvaltılıklar')));
 assert.equal(window.document.querySelectorAll('.react-slide').length,4);
 window.document.querySelector('.all-menu').dispatchEvent(new window.MouseEvent('click',{bubbles:true}));await new Promise(r=>setTimeout(r,600));assert.ok(window.document.querySelector('#mega-menu'));assert.equal(window.document.querySelectorAll('.mega-columns h3').length,13);
 assert.ok(!window.document.querySelector('.mega-columns').textContent.includes('Kahvaltılıklar'));
 assert.ok(!window.document.querySelector('.mega-columns').textContent.includes('Cevizli Baklavalar'));
 window.document.querySelectorAll('.mega-tabs button')[1].click();await wait();assert.equal(window.document.querySelectorAll('.mega-columns h3').length,14);
 window.document.querySelector('.menu-scrim').click();await wait();
 const beforeSlide=Number(window.document.querySelector('.hero-track').style.transform.match(/-(\d+)%/)[1])/100;window.document.querySelector('[aria-label="Sonraki slayt"]').click();await wait();assert.equal(Number(window.document.querySelector('.hero-track').style.transform.match(/-(\d+)%/)[1])/100,(beforeSlide+1)%4);
 window.document.getElementById('year-1888').click();await wait();assert.match(window.document.getElementById('heritage-content').textContent,/1888/);
 const link=window.document.createElement('a');link.href='/'+p.url;window.document.querySelector('#main').appendChild(link);link.click();await wait();
 assert.equal(window.document.querySelectorAll('.breadcrumb').length,1);
 assert.deepEqual([...window.document.querySelector('.breadcrumb').querySelectorAll('a,[aria-current="page"]')].map(el=>el.textContent),[translate(content,'tr','template.0165'),p.category,p.subcategory,p.name]);
 assert.equal(window.document.querySelector('h1').textContent,p.name);assert.match(window.document.querySelector('.detail-price').textContent,/111/);
 for(const href of ['/index.html','/urunler/index.html','/'+p.url,'/index.html','/'+p.url]){
   const nav=window.document.createElement('a');nav.href=href;window.document.querySelector('#main').appendChild(nav);nav.click();await wait();
   assert.equal(window.document.querySelectorAll('header.site-header').length,1,`Header repeated at ${href}`);
 }
 assert.match(window.document.querySelector('.product-main-image img').src,/test-xs\.png$/);
 window.document.querySelectorAll('.gallery-thumb')[1].click();await wait();
 assert.match(window.document.querySelector('.product-main-image img').src,/test-xs-2\.png$/);
 const option=window.document.querySelector('input[value="S"]');option.click();await wait();assert.match(window.document.querySelector('.detail-price').textContent,/222/);assert.match(window.document.querySelector('.product-variants').textContent,/500 g/);
 assert.equal(window.document.querySelector('.product-info .product-text strong').textContent,'Deneme');
 assert.equal(window.document.querySelector('.product-info .product-text strong').getAttribute('onclick'),null);
 assert.equal(window.document.querySelector('.product-info .product-text br')!==null,true);
 assert.equal(window.document.querySelector('.product-info .product-text script'),null);
 assert.equal(window.bad,undefined);
 assert.match(window.document.querySelector('.product-main-image img').src,/test-s\.png$/);
 assert.equal(window.document.querySelectorAll('.gallery-thumb').length,2);
 window.document.querySelector('.product-main-image').click();await wait();
 assert.match(window.document.querySelector('.lightbox-dialog img').src,/test-s\.png$/);
 window.document.querySelector('.dialog-close').click();await wait();
 window.document.querySelector('.header-service button').click();await wait();
 assert.equal(window.document.querySelector('.region-dialog select[name="currency"]').value,'TRY');
 window.document.querySelector('.region-dialog select[name="currency"]').value='USD';
 window.document.querySelector('.region-dialog select[name="currency"]').dispatchEvent(new window.Event('change',{bubbles:true}));await wait();
 window.document.querySelector('.region-dialog form button[type="submit"]').click();await wait();
 assert.deepEqual(JSON.parse(window.localStorage.getItem('hm1864.react.preferences')),{group:'turkey',country:'TR',language:'tr',currency:'USD'});
 assert.match(window.document.querySelector('.detail-price').textContent,/9[,.]99/);
 assert.match(window.document.querySelector('.header-service button').textContent,/USD/);

 window.document.querySelector('[aria-label="Arama"]').click();await wait();assert.ok(window.document.querySelector('dialog[open]'));assert.equal(window.document.querySelectorAll('.search-result').length,164);
 window.document.querySelector('[aria-label="Kapat"]').click();await wait();assert.equal(window.document.querySelector('dialog'),null);
 const cake=data.products.find(p=>p.name==='Lotus Kulesi');
 const cakeLink=window.document.createElement('a');cakeLink.href='/'+cake.url;window.document.querySelector('#main').appendChild(cakeLink);cakeLink.click();await wait();
 assert.equal(window.document.querySelector('.purchase-row'),null);
 assert.ok(window.document.querySelector('.order-availability'));
 assert.equal(window.document.querySelectorAll('.order-platforms img').length,2);
 assert.equal(window.document.querySelectorAll('.editorial-section').length,1);
 assert.equal(window.document.querySelectorAll('.editorial-section button,.editorial-section details').length,0);
 assert.equal(window.document.querySelectorAll('.editorial-section img').length,1);
 window.document.querySelector('input[value="baton"]').click();await wait();
 assert.match(window.document.querySelector('.product-variants').textContent,/3900 gram/);
 assert.match(window.document.querySelector('.product-info>small').textContent,/500\.0101\.02/);
 assert.match(window.document.querySelector('.accordions').textContent,/Pandispanya/);
 window.document.querySelector('.nearest-store-button').click();await wait();
 assert.ok(window.document.querySelector('dialog.store-locator-dialog[open]'));
 assert.ok(window.document.querySelector('.store-locator-dialog .store-card'));
 const storeSearch=window.document.querySelector('input[name="store-query"]');Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set.call(storeSearch,'Porta');storeSearch.dispatchEvent(new window.Event('input',{bubbles:true}));await wait();
 assert.equal(window.document.querySelectorAll('.store-locator-dialog .store-card').length,1);
 const storeCountry=window.document.querySelector('select[name="store-country"]');assert.equal(storeCountry.options.length,1);storeCountry.value='TR';storeCountry.dispatchEvent(new window.Event('change',{bubbles:true}));await wait();
 assert.equal(window.document.querySelectorAll('.store-locator-dialog .store-card').length,5);
 window.document.querySelector('.dialog-close').click();await wait();assert.equal(window.document.querySelector('dialog'),null);



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

test('currency selection uses explicit prices, never invents exchange rates',()=>{
 const p={...data.products[0],price:100,currency:'TRY',pricesByCurrency:{USD:5},variants:[{code:'S',price:120,pricesByCurrency:{USD:6}},{code:'L',price:240,pricesByCurrency:{USD:12}}]};
 assert.equal(choice(p,'S','USD').price,6);
 assert.equal(choice(p,'L','USD').price,12);
 assert.equal(choice(p,'S','EUR').price,null);
 assert.equal(choice(p,'S','TRY').price,120);
 assert.match(cardPrice(p,'pending',' from','USD','en'),/6/);
 assert.equal(cardPrice(p,'No AED price','','AED','en'),'No AED price');
 assert.match(money(6,'USD','','en'),/\$/);
 assert.equal(choice({...p,variants:[]},'','USD').price,5);
});

test('the market matrix covers every example country with valid defaults and overrides',()=>{
 assert.equal(regions.groups.length,16);assert.equal(regions.countries.length,34);
 assert.equal(regions.languages.length,14);
 const expected={US:['north-america','en','USD'],CA:['north-america','en','USD'],GB:['uk-global','en','GBP'],AU:['uk-global','en','USD'],TR:['turkey','tr','TRY'],AE:['gcc','ar','AED'],DE:['central-europe','de','EUR'],FR:['france','fr','EUR'],IT:['italy','it','EUR'],MX:['spanish-latin','es','USD'],DK:['nordics','en','DKK'],SE:['nordics','en','SEK'],RU:['eastern-europe','ru','USD'],CN:['china','zh-CN','CNY'],JP:['japan','ja','JPY'],IN:['south-asia','hi','USD'],PK:['south-asia','ur','USD'],IR:['persian-middle-east','fa','USD'],BR:['brazil','pt','USD'],OTHER:['rest-world','en','USD']};
 for(const [code,values] of Object.entries(expected))assert.deepEqual(Object.values(countryDefaults(regions,code)),values,code);
 for(const group of regions.groups){
   assert.ok(group.countries.length);
   for(const country of group.countries)assert.equal(countryDefaults(regions,country).group,group.id);
   assert.ok(group.currencies.includes(group.defaultCurrency));
   assert.ok(group.supportedLanguages.includes(group.defaultLanguage));
 }
 assert.deepEqual(normalizePreferences({country:'GB',language:'fr',currency:'JPY'},regions,content),{group:'uk-global',country:'GB',language:'fr',currency:'JPY'});
 assert.deepEqual(normalizePreferences({country:'OTHER',countryName:'  Yeni Zelanda  ',language:'en'},regions,content),{group:'rest-world',country:'OTHER',countryName:'Yeni Zelanda',language:'en',currency:'USD'});
});

test('cake variants, sales channels and blank translations preserve source fields',()=>{
 const cakes=data.products.filter(p=>p.category==='Pastalar');assert.equal(cakes.length,18);assert.equal(cakes.flatMap(p=>p.variants).length,36);assert.equal(data.subcategories.filter(s=>s.category==='Pastalar').length,8);
 for(const cake of cakes){assert.equal(cake.images.length,1);assert.equal(cake.description,'');assert.equal(cake.nutrition.values.length,0);assert.equal(cake.stock,null);assert.equal(cake.variants.length,2);for(const v of cake.variants){assert.equal(storeOnly(cake,v.code),true);assert.ok(v.sku.startsWith('500.'));assert.ok(v.ingredients);assert.ok(v.allergenInfo);assert.equal(Object.keys(v.pricesByCurrency).length,8);assert.equal(Object.keys(v.translations).length,13);}}
 const cake=cakes.find(p=>p.name==='Lotus Kulesi');assert.equal(resolve('/urunler/pastalar/pasta/lotus-kulesi.html',data,routes).product.key,cake.key);
 assert.equal(choice(cake,'dilim','AED').price,35);assert.equal(choice(cake,'baton').portion,'6-8 Kişilik');
 const translated=structuredClone(data);const example=translated.products.find(p=>p.key===cake.key);example.variants[0].translations.en={label:'Slice',portion:'One person',ingredients:'Approved short ingredients',allergenInfo:'Approved allergen statement'};
 const catalog=regionalCatalog(translated,{country:'TR',language:'en'},regions);const localized=catalog.products.find(p=>p.key===cake.key);assert.equal(localized.name,cake.name);assert.equal(choice(localized,'dilim').label,'Slice');assert.equal(choice(localized,'dilim').allergenInfo,'Approved allergen statement');
 assert.equal(storeOnly({...cake,onlineSale:true,variants:[]}),false);
});

test('modular data sources and static editorial content',async()=>{
 const product=data.products.find(p=>p.name==='Lotus Kulesi');assert.equal(product.editorial.length,2);
 const editorial=structuredClone(product.editorial);editorial[0].title='Türkçe hikâye';editorial[0].paragraphs=['Birinci paragraf','İkinci paragraf'];editorial[0].translations.en={title:'Product story',paragraphs:['First paragraph','Second paragraph'],imageAlt:'Approved image alt'};
 assert.equal(localizedEditorial(editorial,'en')[0].title,'Product story');assert.equal(localizedEditorial(editorial,'de')[0].title,'Türkçe hikâye');
 const manifest=JSON.parse(await fs.readFile('public/assets/data/catalog/manifest.json','utf8'));assert.equal(manifest.categories.length,14);
 for(const category of manifest.categories){const source=JSON.parse(await fs.readFile('public/assets/data/'+category.products,'utf8'));const prices=JSON.parse(await fs.readFile('public/assets/data/'+category.prices,'utf8'));assert.equal(source.categoryId,category.id);assert.equal(Object.keys(prices.products).length,source.products.length);assert.equal(Object.keys(category.content).length,14);}
 await assert.rejects(()=>loadAuthoringData(async file=>{const value=JSON.parse(await fs.readFile('public/assets/data/'+file,'utf8'));if(file==='products/pastalar/prices.json')value.products['missing-product']={base:{TRY:50},variants:{}};return value}),/anahtarı/);
});

test('current product codes and variant image fallback',()=>{
 for(const p of data.products){assert.ok(p.key.startsWith(slug(p.code)+'-'),p.key);for(const old of p.legacyKeys||[])assert.notEqual(old,p.key)}
 const cake=data.products.find(p=>p.name==='Son Aşk');assert.equal(cake.key,'500-0304-son-ask');assert.ok(cake.legacyKeys.includes('500-01-17-son-ask'));
 const p={...data.products[0],images:['general.png'],variants:[{code:'a',images:['a.png','a-2.png']},{code:'b',images:[]}]};
 assert.deepEqual(variantImages(p,'a'),['a.png','a-2.png']);assert.deepEqual(variantImages(p,'b'),['general.png']);assert.equal(choice(p,'a').image,'a.png');
});

test('formatting supports nested inline tags and removes active HTML',()=>{
 const w=new Window();const doc=w.document;
 assert.deepEqual(parseFormattedText('<strong>A <b>B</b></strong><br>C',doc),[{tag:'strong',children:[{text:'A '},{tag:'b',children:[{text:'B'}]}]},{tag:'br',children:[]},{text:'C'}]);
 assert.equal(plainText('<b>A&amp;B</b><br/>C',doc),'A&B\nC');
 const result=parseFormattedText('<img src=x onerror=alert(1)><script>alert(1)</script><svg onload=alert(1)>bad</svg><b onclick=alert(1) style="color:red">Safe</b><a href="javascript:alert(1)">Text</a>',doc);
 assert.deepEqual(result,[{tag:'b',children:[{text:'Safe'}]},{text:'Text'}]);
 assert.equal(plainText('2 < 3',doc),'2 < 3');
 w.happyDOM.abort();
});

 test('breadcrumb hierarchy follows product taxonomy and sitemap for every route',()=>{
 const t=key=>translate(content,'tr',key);
 const make=(path,route=resolve(path,data,routes),catalog=data)=>buildBreadcrumbs({path,route,data:catalog,rawData:data,routes,t});
 const product=data.products.find(p=>p.code==='100-01-02');
 const cat=data.categories.find(c=>c.id===product.categoryId);
 const sub=data.subcategories.find(c=>c.id===product.subcategoryId);
 assert.deepEqual(make('/'+product.url).map(c=>c.label),[t('template.0165'),cat.name,sub.name,product.name]);
 assert.deepEqual(make('/'+product.url).slice(0,-1).map(c=>c.url),['index.html',cat.url,sub.url]);
 assert.deepEqual(make('/'+cat.url).map(c=>c.label),[t('template.0165'),cat.name]);
 assert.deepEqual(make('/'+sub.url).map(c=>c.label),[t('template.0165'),cat.name,sub.name]);
 assert.equal(make('/urunler/index.html').length,2);
 assert.deepEqual(make('/kurumsal/kariyer/').map(c=>c.label),[t('template.0165'),t('page.0021'),t('page.0026')]);
 assert.deepEqual(make('/hesabim/adreslerim.html').slice(0,-1).map(c=>c.url),['index.html','hesabim/index.html']);
 assert.equal(make('/iletisim/index.html').length,2);
 assert.deepEqual(make('/index.html'),[]);
 assert.equal(make('/unknown.html').at(-1).current,true);
 const unavailable=make('/'+product.url,{kind:'unavailable',title:product.name},{...data,products:[]});
 assert.deepEqual(unavailable.map(c=>c.label),[t('template.0165'),cat.name,sub.name,product.name]);
 const english=regionalCatalog(data,{country:'TR',language:'en'},regions);
 const enProduct=english.products.find(p=>p.key===product.key);
 const enTrail=buildBreadcrumbs({path:'/'+enProduct.url,route:resolve('/'+enProduct.url,english,routes),data:english,routes,t:key=>translate(content,'en',key),language:'en'});
 assert.equal(enTrail.at(-1).label,enProduct.name);
 for(const url of Object.keys(routes)) {
  const trail=make('/'+url);
  if(!trail.length)continue;
  assert.equal(trail.filter(c=>c.current).length,1,url);
  assert.equal(trail.at(-1).current,true,url);
  assert.ok(trail.every(c=>typeof c.label==='string'&&c.label.length),url);
  const links=trail.filter(c=>c.url).map(c=>c.url);
  assert.equal(new Set(links).size,links.length,url);
  for(const link of links)assert.notEqual(resolve('/'+link,data,routes).kind,'404',link);
 }
});
