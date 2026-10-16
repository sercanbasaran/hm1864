import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {Window} from 'happy-dom';
import {loadAuthoringData} from '../src/data-loader.js';
import {choice,resolve,validate} from '../src/model.js';
import {resolveContents} from '../src/utils/product-contents.js';
import {productCardContent} from '../src/utils/product-card-content.js';
const authored=await loadAuthoringData(async file=>JSON.parse(await fs.readFile('public/assets/data/'+file,'utf8'))),data=authored.catalog;
const source=JSON.parse(await fs.readFile('tests/fixtures/baklava-source.json','utf8'));
test('all 30 Excel rows retain exact SKUs, nine prices, slices, copy and channels',()=>{
 const products=data.products.filter(p=>p.categoryId==='baklavalar');assert.equal(products.length,30);
 for(const row of source.rows){
  const p=products.find(p=>p.variants.some(v=>v.sku===row[0]));assert.ok(p,row[0]);
  assert.equal(p.name,row[3].trim());assert.equal(p.code,row[0].split('.').slice(0,2).join('.'));assert.equal(p.defaultVariant,'XL');
  assert.equal(p.onlineSale,row[5]);assert.equal(p.commonMarket,row[6]);assert.equal(choice(p,'XL').weight,row[9]);
  assert.equal(choice(p,'XL').sliceCount,row[8]===null||row[8]==='-'?null:row[8]);
  for(const [i,currency]of source.columns.slice(10,19).entries())assert.equal(choice(p,'XL',currency).price,row[10+i]);
  for(const [field,i]of Object.entries({description:4,ingredients:19,allergenInfo:20,storage:21,servingSuggestion:22,longTermStorage:23}))assert.equal(choice(p,'XL')[field],row[i]);
  assert.equal(resolve('/'+p.url,data,{}).product.key,p.key);assert.deepEqual(choice(p,'XL').packageContents.map(i=>i.quantity),[8,8,8]);
  for(const code of ['XS','S','M','L']){const v=choice(p,code);assert.equal(v.price,null);assert.equal(v.weight,'');assert.equal(v.sliceCount,null);assert.equal(v.sku,p.code);assert.deepEqual(v.packageContents.map(i=>i.quantity),[null,null,null]);}
 }
 assert.equal(products.filter(p=>choice(p,'XL').sliceCount!=null).length,14);
 assert.equal(products.find(p=>p.code==='100.0202').variants.find(v=>v.code==='XL').sku,'100.0202.07');
});
test('slice counts, mixed box contents and independent variant quantities resolve without leaking XL data',()=>{
 const p=structuredClone(data.products.find(p=>p.code==='100.0102'));
 assert.deepEqual(productCardContent(p,[],count=>count+' dilim').variants.at(-1).dimensions,['46/48 dilim','2500 gram']);
 const rows=resolveContents([{id:'a',productKey:p.key,quantity:2,image:'baklavalar/slice.png'},{id:'b',name:{tr:'Karışık',en:'Mixed'},quantity:3},{id:'off',name:'Hidden',quantity:0}],data.products,'en');
 assert.equal(rows.length,2);assert.equal(rows[0].image,'baklavalar/slice.png');assert.equal(rows[1].name,'Mixed');
 for(const mutate of [p=>p.variants[0].sliceCount=-1,p=>p.variants[0].packageContents[0].quantity=1.5,p=>p.variants[0].boxContents[0].image='../wrong.png',p=>p.variants[0].boxContents[0].productKey='missing',p=>p.defaultVariant='unknown']){
 const copy=structuredClone(data);const product=copy.products.find(p=>p.code==='100.0102');mutate(product);assert.throws(()=>validate(copy),/içeriği geçersiz/);
 }
});
const wait=()=>new Promise(resolve=>setTimeout(resolve,50));
const ready=async condition=>{for(let i=0;i<100;i++){if(condition())return;await wait()}throw Error('Baklava UI not ready')};
test('product page defaults to XL and updates slice/box/package contents with variant selection',async()=>{
 const edited=structuredClone(data),p=edited.products.find(p=>p.code==='100.0102'),s=p.variants.find(v=>v.code==='S');
 s.sliceCount=3;s.boxContents[0].quantity=3;s.packageContents.forEach((row,i)=>row.quantity=[2,1,4][i]);
 const window=new Window({url:'http://localhost/'+p.url,settings:{enableJavaScriptEvaluation:true}});
 window.localStorage.setItem('hm1864.react.preferences',JSON.stringify({country:'TR',language:'tr',currency:'TRY'}));
 window.fetch=async()=>({ok:true,json:async()=>({...authored,catalog:edited})});window.scrollTo=()=>{};window.document.body.innerHTML='<div id="root"></div>';
 const files=await fs.readdir('dist/assets');
 try{
 window.eval(await fs.readFile('dist/assets/'+files.find(f=>f.endsWith('.js')),'utf8'));await ready(()=>window.document.querySelector('.box-contents'));await wait();
 const doc=window.document;assert.equal(doc.querySelector('input[value="XL"]').checked,true);
 assert.match(doc.querySelector('.product-variants').textContent,/46\/48 dilim/);assert.match(doc.querySelector('.box-contents tbody').textContent,/46\/48/);
 assert.deepEqual([...doc.querySelectorAll('.shipping-package-contents tbody td')].map(el=>el.textContent),['8','8','8']);
 assert.match(doc.querySelector('.shipping-package-contents').textContent,/Kolonyalı mendil/);assert.match(doc.querySelector('.shipping-package-contents').textContent,/Peçete/);
 doc.querySelector('input[value="S"]').click();await wait();assert.match(doc.querySelector('.product-variants').textContent,/3 dilim/);
 assert.equal(doc.querySelector('.box-contents tbody td:last-child').textContent,'3');assert.deepEqual([...doc.querySelectorAll('.shipping-package-contents tbody td')].map(el=>el.textContent),['2','1','4']);
 doc.querySelector('input[value="XS"]').click();await wait();assert.ok(!doc.querySelector('.product-variants').textContent.includes('46/48'));
 assert.deepEqual([...doc.querySelectorAll('.shipping-package-contents tbody td')].map(el=>el.textContent),['—','—','—']);
 assert.equal(doc.querySelector('.box-contents tbody td:last-child').textContent,'—');
 }finally{window.happyDOM.abort()}
});
