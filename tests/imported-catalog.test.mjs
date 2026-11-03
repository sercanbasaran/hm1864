import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { Window } from 'happy-dom';
import { loadAuthoringData } from '../src/data-loader.js';
import { catalogForChannel, channelUrl, menuChannel } from '../src/catalog-channel.js';
import { cartRows } from '../src/commerce.js';
import { categoryMenu } from '../src/menus.js';
const authored=await loadAuthoringData(async p=>JSON.parse(await fs.readFile('public/assets/data/'+p,'utf8')));
const data=authored.catalog,report=JSON.parse(await fs.readFile('docs/catalog-import-report.json','utf8'));
const allVariants=data.products.flatMap(product=>product.variants.map(variant=>({product,variant})));
test('production catalogue contains only the 117 exported products and all 390 variant identities/prices',()=>{
 assert.equal(data.products.length,117);assert.equal(allVariants.length,390);assert.equal(data.categories.length,6);
 assert.equal(data.sourceExportSha256,'b4243506d7bf22d8e82f24f1df292246a3140500854a10e04860d4b06af0d576');
 assert.equal(new Set(allVariants.map(x=>x.variant.sku)).size,390);
 assert.ok(data.products.every(p=>p.key.startsWith('usta-')&&/^\d+$/.test(p.code)&&p.variants.length));
 assert.deepEqual(new Set(allVariants.map(x=>x.variant.sourceVariantId)),new Set(report.variantsBySku.map(v=>v.sourceVariantId)));
 for(const expected of report.variantsBySku){const {product,variant}=allVariants.find(x=>x.variant.sku===expected.sku);assert.equal(product.key,expected.productKey);assert.equal(variant.price,expected.price);assert.equal(variant.onlineSale,['pastalar','muhallebiler'].includes(product.categoryId)?false:expected.online);assert.equal(variant.storeSale,expected.store);}
 const sample=allVariants.find(x=>x.variant.sku==='1011.11201');assert.equal(sample.product.name,'Cevizli Sarı Burma');assert.equal(sample.variant.price,6720);assert.equal(sample.variant.netWeight,1920);assert.equal(sample.variant.sliceCount,48);
 assert.ok(sample.variant.ingredients.includes('ceviz'));assert.equal(sample.variant.boxContents[0].quantity,48);assert.equal(sample.variant.boxContents[0].unitWeight,40);
 assert.equal(sample.variant.dimensions.length,345);assert.ok(sample.variant.sourceImageUrls[0].startsWith('https://1864usta.netlify.app/'));
 assert.equal(allVariants.filter(x=>x.variant.boxContents.length>1).length,7);
 assert.ok(allVariants.every(({variant})=>variant.boxContents.every(row=>data.products.some(p=>p.key===row.productKey))));
});
test('online has 70 products / 280 variants; store has 117 / 390 and closed variants cannot be purchased',()=>{
 const online=catalogForChannel(data),store=catalogForChannel(data,'store');
 assert.equal(online.products.length,70);assert.equal(online.products.flatMap(p=>p.variants).length,280);
 assert.equal(store.products.length,117);assert.equal(store.products.flatMap(p=>p.variants).length,390);
 for(const {product,variant} of allVariants){const present=online.products.find(p=>p.key===product.key)?.variants.some(v=>v.code===variant.code)||false;assert.equal(present,variant.onlineSale);if(!variant.onlineSale)assert.equal(cartRows([{key:product.key,variant:variant.code,quantity:1}],data,'TRY')[0].available,false);}
 assert.equal(allVariants.filter(x=>!x.variant.onlineSale).length,110);
 for(const tab of data.menus.mega.tabs){for(const category of categoryMenu(data,tab.categories,'tr',tab.id)){assert.ok((tab.id==='store'?store:online).categories.some(c=>c.id===category.id));assert.equal(menuChannel(new URL(category.url,'https://x/').search),tab.id);}}
 assert.equal(channelUrl('urunler/baklavalar/index.html','store'),'urunler/baklavalar/index.html?menu=store');
 assert.equal(channelUrl('urunler/baklavalar/index.html?menu=store','online'),'urunler/baklavalar/index.html');
});
test('old product routes and removed product groups are absent from production route generation',async()=>{
 const routes=JSON.parse(await fs.readFile('src/routes.json','utf8'));
 assert.ok(!Object.keys(routes).some(url=>url.startsWith('magaza-menu/')));
 assert.ok(!data.products.some(p=>p.code==='100.0102'));
 const manifest=JSON.parse(await fs.readFile('public/assets/data/catalog/manifest.json','utf8'));
 assert.equal(manifest.categories.length,6);assert.ok(!manifest.categories.some(c=>c.id==='kahveler'));
 for(const p of data.products)await fs.access('dist/'+p.url);
 assert.ok(!data.menus.header.primary.some(c=>c.categoryId==='kahveler'));
});
test('all 176 source photos resolve to the matching product, variant and box media in the build',async()=>{
 assert.equal(report.downloadedMedia,176);assert.equal(report.pendingMedia,0);assert.deepEqual(report.mediaErrors,[]);
 const mediaId=url=>url.split('/').at(-2);
 const assertSources=(paths,sources)=>assert.deepEqual(paths.map(p=>p.split('/').at(-1).replace(/\.[^.]+$/,'')),[...new Set(sources.map(mediaId))]);
 for (const product of data.products) {
   assert.ok(product.images.length>0&&product.images.every(path=>path.startsWith('imported/')));
   assertSources(product.images,product.sourceImageUrls);
   for (const file of product.images) { await fs.access('public/assets/images/urunler/'+file); await fs.access('dist/assets/images/urunler/'+file); }
 }
 for (const {variant} of allVariants) {
   assert.ok(variant.images.length>0);
   assertSources(variant.images,[...variant.sourceImageUrls,...variant.sourceBoxImageUrls]);
   for (const file of variant.images) { await fs.access('public/assets/images/urunler/'+file); await fs.access('dist/assets/images/urunler/'+file); }
   if (variant.sourceBoxImageUrls.length) {
     assert.ok(variant.boxImage?.startsWith('imported/'));
     assertSources([variant.boxImage],[variant.sourceBoxImageUrls[0]]);
   }
 }
});
const script=await fs.readFile('dist/assets/'+(await fs.readdir('dist/assets')).find(x=>x.endsWith('.js')),'utf8');
const pause=()=>new Promise(r=>setTimeout(r,35));
async function ready(fn){for(let i=0;i<150;i++){if(fn())return;await pause();}throw Error('Imported catalog UI not ready');}
function mount(path){const w=new Window({url:'http://localhost/'+path,settings:{enableJavaScriptEvaluation:true}});w.localStorage.setItem('hm1864.react.preferences',JSON.stringify({country:'TR',language:'tr',currency:'TRY'}));w.fetch=async()=>({ok:true,json:async()=>authored});w.scrollTo=()=>{};w.document.body.innerHTML='<div id="root"></div>';w.eval(script);return w;}
test('same category path switches between online and store, preserves query in product links and supports back navigation',async()=>{
 const mixed=data.products.find(p=>p.categoryId==='baklavalar'&&p.variants.some(v=>v.onlineSale)&&p.variants.some(v=>!v.onlineSale));assert.ok(mixed);
 const category=data.categories.find(c=>c.id===mixed.categoryId);const w=mount(category.url),doc=w.document;
 try{
  const card=()=>[...doc.querySelectorAll('.product-card')].find(c=>c.querySelector('.product-picture').getAttribute('href')?.split('?')[0]==='/'+mixed.url);
  await ready(card);assert.equal(card().querySelectorAll('.card-variant-label').length,mixed.variants.filter(v=>v.onlineSale).length);
  doc.querySelector('.all-menu').click();await pause();doc.querySelectorAll('.mega-tabs button')[1].click();await pause();
  const link=[...doc.querySelectorAll('.mega-category h3 a')].find(a=>a.getAttribute('href')==='/'+category.url+'?menu=store');assert.ok(link);link.click();
  await ready(()=>w.location.search==='?menu=store'&&card()?.querySelectorAll('.card-variant-label').length===mixed.variants.length);
  assert.equal(w.location.pathname,'/'+category.url);
  const productLink=card().querySelector('.card-view-product');assert.equal(productLink.getAttribute('href'),'/'+mixed.url+'?menu=store');productLink.click();
  await ready(()=>doc.querySelector('.product-variants'));assert.equal(doc.querySelectorAll('.product-variants input').length,mixed.variants.length);
  const closed=mixed.variants.find(v=>!v.onlineSale);doc.querySelector('input[value="'+closed.code+'"]').click();await pause();assert.ok(doc.querySelector('.order-availability'));assert.equal(doc.querySelector('.purchase-row'),null);
  assert.ok([...doc.querySelectorAll('.breadcrumb a')].some(a=>a.getAttribute('href')==='/'+category.url+'?menu=store'));
  w.history.back();await ready(()=>w.location.pathname==='/'+category.url&&!!card());
  w.history.back();await ready(()=>w.location.search===''&&card()?.querySelectorAll('.card-variant-label').length===mixed.variants.filter(v=>v.onlineSale).length);assert.equal(card().querySelectorAll('.card-variant-label').length,mixed.variants.filter(v=>v.onlineSale).length);
 }finally{await w.happyDOM.abort();}
});
test('direct store-only product entry works only in store view; mobile menu offers both channels',async()=>{
 const p=data.products.find(p=>p.variants.every(v=>!v.onlineSale));assert.ok(p);
 const w=mount(p.url+'?menu=store');try{await ready(()=>w.document.querySelector('.product-variants'));assert.equal(w.document.querySelectorAll('.product-variants input').length,p.variants.length);assert.ok(w.document.querySelector('.order-availability'));w.document.querySelector('.mobile-toggle').click();await ready(()=>w.document.querySelector('.mobile-channel-tabs'));assert.equal(w.document.querySelectorAll('.mobile-channel-tabs button').length,2);}finally{await w.happyDOM.abort();}
 const online=mount(p.url);try{await ready(()=>online.document.querySelector('main h1'));assert.equal(online.document.querySelector('.product-variants'),null);}finally{await online.happyDOM.abort();}
});
