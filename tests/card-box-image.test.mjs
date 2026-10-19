import test from 'node:test';
import assert from 'node:assert/strict';
import { cardBoxImage } from '../src/utils/card-box-image.js';
test('card preview uses only selected variant packaging or explicit boxImage',()=>{
 const photo='baklavalar/packaging/xl.webp';
 const p={images:['baklavalar/studio/a.webp','baklavalar/lifestyle.webp'],variants:[{code:'XS',images:[]},{code:'XL',images:['baklavalar/studio/a.webp',photo]}]};
 assert.equal(cardBoxImage(p,'XS'),null);
 assert.equal(cardBoxImage(p,'XL'),photo);
 p.variants[0].boxImage='baklavalar/custom-xs.webp';assert.equal(cardBoxImage(p,'XS'),'baklavalar/custom-xs.webp');
 p.variants[0].boxImage='../unsafe.webp';assert.equal(cardBoxImage(p,'XS'),null);
 assert.equal(cardBoxImage(p,null),null);
 assert.equal(cardBoxImage({images:['kutu/item.webp'],variants:[]},''),'kutu/item.webp');
});
