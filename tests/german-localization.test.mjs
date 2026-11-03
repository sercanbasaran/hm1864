import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {Window} from 'happy-dom';
import {loadAuthoringData} from '../src/data-loader.js';
import {regionalCatalog} from '../src/market.js';
const root='public/assets/data/';
const authored=await loadAuthoringData(async path=>JSON.parse(await fs.readFile(root+path,'utf8')));
const numbers=text=>(text.match(/-?\d+(?:[.,]\d+)?/g)||[]).map(s=>Number(s.replace(',','.')));
const check=(tr,de,path)=>{
 if(typeof tr==='string' && tr.trim())assert.ok(typeof de==='string'&&de.trim(),path);
 else if(Array.isArray(tr))tr.forEach((v,i)=>check(v,de?.[i],path+'/'+i));
 else if(tr && typeof tr==='object')for(const [k,v] of Object.entries(tr))check(v,de?.[k],path+'/'+k);
};
test('German content covers every product, variant, UI message, menu and editorial page',async()=>{
 const manifest=JSON.parse(await fs.readFile(root+'catalog/manifest.json','utf8'));
 let products=0,variants=0;
 for(const category of manifest.categories){
  const tr=JSON.parse(await fs.readFile(root+category.content.tr,'utf8')).products;
  const de=JSON.parse(await fs.readFile(root+category.content.de,'utf8')).products;
  check(tr,de,category.id);
  for(const [id,p] of Object.entries(tr)){
   products++;variants+=Object.keys(p.variants).length;
   for(const [a,b] of [[p,de[id]],...Object.entries(p.variants).map(([v,x])=>[x,de[id].variants[v]])]){
    for(const field of ['ingredients','weight','portion'])assert.deepEqual(numbers(a[field]||''),numbers(b[field]||''),id+'/'+field);
    assert.deepEqual(numbers(a.nutrition?.summary||''),numbers(b.nutrition?.summary||''),id+'/nutrition');
    assert.ok(!/conwaterming|Please consider|May contain|kişilik|içerir/.test(b.allergenInfo||''));
   }
  }
 }
 assert.equal(products,117);assert.equal(variants,390);
 for(const [key,entry] of Object.entries(authored.content.texts))assert.ok(entry.de?.trim(),'Missing German text: '+key);
 const audit=(x,path)=>{
  if(Array.isArray(x))return x.forEach((v,i)=>audit(v,path+'/'+i));
  if(x && typeof x==='object'){
   if(typeof x.tr==='string'&&x.tr.trim())assert.ok(x.de?.trim(),'Missing German content: '+path);
   for(const [k,v] of Object.entries(x))audit(v,path+'/'+k);
  }
 };
 for(const dir of ['pages','menus'])for(const name of await fs.readdir(root+dir))audit(JSON.parse(await fs.readFile(root+dir+'/'+name,'utf8')),dir+'/'+name);
 const de=regionalCatalog(authored.catalog,{country:'TR',language:'de',currency:'TRY'},authored.regions);
 assert.ok(de.categories.every(c=>c.name===c.translations.de.name));
 assert.ok(de.products.every(p=>p.name===p.translations.de.name));
});
test('German storefront and selection page render without Turkish or English fallback prose',async()=>{
 const files=await fs.readdir('dist/assets');const script=await fs.readFile('dist/assets/'+files.find(x=>x.endsWith('.js')),'utf8');
 const w=new Window({url:'http://localhost/',settings:{enableJavaScriptEvaluation:true}});
 const ready=async fn=>{for(let i=0;i<150;i++){if(fn())return;await new Promise(r=>setTimeout(r,25));}throw Error('German page not ready');};
 try{
  w.localStorage.setItem('hm1864.react.preferences',JSON.stringify({country:'TR',language:'de',currency:'TRY'}));w.fetch=async()=>({ok:true,json:async()=>authored});w.scrollTo=()=>{};
  w.document.body.innerHTML='<div id="root"></div>';w.eval(script);
  await ready(()=>w.document.querySelector('.collection-content h2')&&w.document.documentElement.lang==='de');
  assert.equal(w.document.querySelector('.collection-content h2').textContent,'Pierre-Loti-Auswahl');
  assert.ok(w.document.querySelector('.heritage-section h2').textContent.includes('VON 1864'));
  assert.ok(w.document.querySelector('.heritage-images img').alt.length>0);
  w.document.querySelector('.collection-content a').click();await ready(()=>w.document.querySelector('.selection-hero'));
  assert.ok(w.document.querySelector('.selection-hero h1').textContent.includes('Auswahl'));
  assert.ok(w.document.querySelector('.selection-page').textContent.includes('Die Geschichte der Box entdecken'));
  assert.ok(!/Seçkisi|Discover the story/.test(w.document.querySelector('.selection-page').textContent));
 }finally{await w.happyDOM.abort();}
});
