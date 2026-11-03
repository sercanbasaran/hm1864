import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {Window} from 'happy-dom';
import {loadAuthoringData} from '../src/data-loader.js';
import {regionalCatalog} from '../src/market.js';
const root='public/assets/data/';
const authored=await loadAuthoringData(async path=>JSON.parse(await fs.readFile(root+path,'utf8')));
const manifest=JSON.parse(await fs.readFile(root+'catalog/manifest.json','utf8'));
const numbers=text=>(text.match(/-?\d+(?:[.,]\d+)?/g)||[]).map(s=>Number(s.replace(',','.')));
test('every authored product and variant text has English content and retains ingredient and nutrition quantities',async()=>{
 let products=0,variants=0;
 const check=(tr,en,path)=>{
  if(typeof tr==='string' && tr.trim())assert.ok(typeof en==='string'&&en.trim(),path);
  else if(Array.isArray(tr))tr.forEach((v,i)=>check(v,en?.[i],path+'/'+i));
  else if(tr && typeof tr==='object')for(const [k,v] of Object.entries(tr))check(v,en?.[k],path+'/'+k);
 };
 for(const category of manifest.categories){
  const tr=JSON.parse(await fs.readFile(root+category.content.tr,'utf8')).products;
  const en=JSON.parse(await fs.readFile(root+category.content.en,'utf8')).products;
  check(tr,en,category.id);
  for(const [key,p] of Object.entries(tr)){
   products++;variants+=Object.keys(p.variants).length;
   for(const [a,b] of [[p,en[key]],...Object.entries(p.variants).map(([id,v])=>[v,en[key].variants[id]])]){
    for(const field of ['ingredients','weight','portion'])assert.deepEqual(numbers(b[field]||''),numbers(a[field]||''),key+'/'+field);
    assert.deepEqual(numbers(b.nutrition?.summary||''),numbers(a.nutrition?.summary||''),key+'/nutrition');
   }
  }
 }
 assert.equal(products,117);assert.equal(variants,390);
 for(const [key,entry] of Object.entries(authored.content.texts))assert.ok(entry.en?.trim(),'Missing English UI text: '+key);
 const en=regionalCatalog(authored.catalog,{country:'TR',language:'en',currency:'TRY'},authored.regions);
 assert.ok(en.categories.every(c=>c.name===c.translations.en.name));
 assert.ok(en.products.every(p=>p.name===p.translations.en.name));
});

test('English storefront renders translated homepage, category previews and Pierre Loti page',async()=>{
 const files=await fs.readdir('dist/assets');
 const script=await fs.readFile('dist/assets/'+files.find(x=>x.endsWith('.js')),'utf8');
 const w=new Window({url:'http://localhost/',settings:{enableJavaScriptEvaluation:true}});
 const ready=async fn=>{for(let i=0;i<120;i++){if(fn())return;await new Promise(r=>setTimeout(r,25));}throw Error('English page not ready');};
 try {
  w.localStorage.setItem('hm1864.react.preferences',JSON.stringify({country:'TR',language:'en',currency:'TRY'}));
  w.fetch=async()=>({ok:true,json:async()=>authored});w.scrollTo=()=>{};
  w.document.body.innerHTML='<div id="root"></div>';w.eval(script);
  await ready(()=>w.document.querySelector('.collection-content h2') && w.document.documentElement.lang==='en');
  assert.equal(w.document.documentElement.lang,'en');
  assert.equal(w.document.querySelector('.collection-content h2').textContent,'Pierre Loti Selection');
  assert.ok(w.document.querySelector('.heritage-section h2').textContent.includes('FROM 1864'));
  w.document.querySelector('.collection-content a').click();
  await ready(()=>w.document.querySelector('.selection-hero'));
  assert.equal(w.document.querySelector('.selection-hero h1').textContent,'Pierre LotiSelection');
  assert.ok(w.document.querySelector('.selection-page').textContent.includes('Discover the story of the box'));
  assert.ok(!w.document.querySelector('.selection-page').textContent.includes('Seçkisi'));
 }finally{await w.happyDOM.abort();}
});
