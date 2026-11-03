import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {convertPrice,convertPriceMap,validatedRates,updateExchangePrices} from '../scripts/update-exchange-prices.mjs';
import {money} from '../src/model.js';

test('currency conversion rounds decimal halves up and preserves null and original TRY prices',()=>{
 assert.equal(convertPrice(1.005,100),101);
 assert.equal(convertPrice(10,.25),3);
 assert.equal(convertPrice(10,.24),2);
 assert.equal(convertPrice(1,1e-7),0);
 assert.equal(convertPrice(null,1),null);
 assert.equal(convertPrice(0,.25),0);
 assert.deepEqual(convertPriceMap({TRY:12.75,USD:999},{USD:{rate:.2}}),{TRY:12.75,USD:3});
 assert.deepEqual(convertPriceMap({TRY:null,USD:999},{USD:{rate:.2}}),{TRY:null,USD:null});
 for(const n of [-1,NaN,Infinity,'10'])assert.throws(()=>convertPrice(n,1));
 for(const r of [0,-1,NaN,Infinity,'1'])assert.throws(()=>convertPrice(10,r));
 assert.throws(()=>convertPriceMap({},{}));
 assert.doesNotMatch(money(135,'USD','','en'),/\.00/);
 assert.match(money(135,'TRY','','en'),/\.00/);
});
test('incomplete, invalid and duplicate exchange feeds cannot change any stored prices',async()=>{
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'hm1864-fx-'));
 try{
  await fs.mkdir(path.join(root,'settings'));
  await fs.mkdir(path.join(root,'catalog'));
  const file=path.join(root,'catalog/prices.json');
  const original='{"TRY":42}';await fs.writeFile(file,original);
  await fs.writeFile(path.join(root,'settings/regions.json'),JSON.stringify({currencies:['TRY','USD','AED']}));
  const row={base:'TRY',quote:'USD',date:'2026-11-03',rate:.02};
  for(const rows of [[row],[row,row],[{...row,rate:-1}],[{...row,base:'EUR'}],[{...row,date:'2026-02-30'}]]){
   await assert.rejects(updateExchangePrices(root,async()=>({ok:true,json:async()=>rows})));
   assert.equal(await fs.readFile(file,'utf8'),original);
  }
  await assert.rejects(updateExchangePrices(root,async()=>({ok:false,status:503})));
  assert.deepEqual(validatedRates([row],['USD']),{USD:{rate:.02,date:'2026-11-03'}});
 }finally{await fs.rm(root,{recursive:true,force:true});}
});
test('every configured foreign currency has rounded prices from the saved source rates',async()=>{
 const root='public/assets/data/';
 const settings=JSON.parse(await fs.readFile(root+'settings/regions.json','utf8'));
 const snapshot=JSON.parse(await fs.readFile(root+'settings/exchange-rates.json','utf8'));
 const manifest=JSON.parse(await fs.readFile(root+'catalog/manifest.json','utf8'));
 const currencies=settings.currencies.filter(c=>c!=='TRY');
 assert.deepEqual(Object.keys(snapshot.rates).sort(),currencies.sort());
 assert.equal(snapshot.provider,'Frankfurter');assert.equal(snapshot.base,'TRY');
 let variants=0,converted=0;
 for(const category of manifest.categories){
  const file=JSON.parse(await fs.readFile(root+category.prices,'utf8'));
  for(const p of Object.values(file.products)){
   for(const prices of [p.base,...Object.values(p.variants)])for(const currency of currencies){
    assert.equal(prices[currency],convertPrice(prices.TRY,snapshot.rates[currency].rate));
    if(prices[currency]!==null){assert.ok(Number.isSafeInteger(prices[currency]));converted++;}
   }
   variants+=Object.keys(p.variants).length;
  }
 }
 assert.equal(variants,390);assert.equal(converted,3120);
});
