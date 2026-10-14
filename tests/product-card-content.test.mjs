import test from "node:test";
import assert from "node:assert/strict";
import { productCardContent, isOnlineSaleUnavailable } from "../src/utils/product-card-content.js";

test("store-only card notice respects all variant overrides and never infers unavailability from missing data", () => {
  assert.equal(isOnlineSaleUnavailable({onlineSale:false,variants:[]}),true);
  assert.equal(isOnlineSaleUnavailable({variants:[]}),false);
  assert.equal(isOnlineSaleUnavailable({onlineSale:false,variants:[{code:'S'},{code:'L'}]}),true);
  assert.equal(isOnlineSaleUnavailable({onlineSale:true,variants:[{onlineSale:false},{onlineSale:false}]}),true);
  assert.equal(isOnlineSaleUnavailable({onlineSale:false,variants:[{onlineSale:false},{onlineSale:true}]}),false);
  assert.equal(isOnlineSaleUnavailable({variants:[{code:'S'}]}),false);
});

test("cards show every authored variant, dimensions and distinct descriptions", () => {
  const p = {description:"Kısa ürün açıklaması.",variants:[
    {code:"slice",label:"Dilim",portion:"Tek Kişilik",weight:"150 g",description:"Kısa ürün açıklaması."},
    {code:"cake",label:"Bütün",portion:"6 Kişilik",weight:"1000 g",description:"Paylaşmak için bütün pasta."}
  ]};
  const result=productCardContent(p);
  assert.equal(result.description,p.description);
  assert.deepEqual(result.variants[0].dimensions,["Tek Kişilik","150 g"]);
  assert.equal(result.variants[0].description,"");
  assert.equal(result.variants[1].description,p.variants[1].description);
  assert.equal(result.variants.length,2);
});
test("empty and placeholder descriptions stay hidden; localized strings and code fallback remain", () => {
  assert.deepEqual(productCardContent({description:"Lorem ipsum dolor sit amet.",variants:[]}),{description:"",variants:[]});
  const result=productCardContent({description:"Informationen folgen",variants:[{code:"XS",label:"",weight:null,description:"Bilgi eklenecek"},{code:"S",label:"Slice 150 g",weight:"150 g",description:"A slice of cake."}]},["Informationen folgen"]);
  assert.equal(result.description,"");assert.equal(result.variants[0].label,"XS");
  assert.equal(result.variants[0].description,"");assert.deepEqual(result.variants[1].dimensions,[]);
  assert.equal(result.variants[1].description,"A slice of cake.");
});
