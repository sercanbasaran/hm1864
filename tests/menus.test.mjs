import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {loadAuthoringData} from '../src/data-loader.js';
import {categoryMenu,primaryMenu,menuText,validateMenus} from '../src/menus.js';
import {catalogForChannel,channelUrl} from '../src/catalog-channel.js';
import {footerMenuNodes} from '../src/utils/menu-template.js';
const {catalog:data}=await loadAuthoringData(async file=>JSON.parse(await fs.readFile('public/assets/data/'+file,'utf8')));
test('independent menu sources control ordering, visibility and labels without changing taxonomy',()=>{
 const copy=structuredClone(data),first=copy.menus.mobile.categories[0];
 first.enabled=false;copy.menus.mobile.categories.reverse();
 assert.notEqual(categoryMenu(copy,copy.menus.mobile.categories)[0].id,first.categoryId);
 assert.equal(categoryMenu(copy,copy.menus.mobile.categories).length,catalogForChannel(copy).categories.filter(c=>c.id!==first.categoryId).length);
 assert.equal(categoryMenu(copy,copy.menus.mega.tabs[0].categories).length,copy.menus.mega.tabs[0].categories.length);
 copy.menus.header.primary[1].label={tr:'Yeni başlık',en:'New title'};
 assert.equal(primaryMenu(copy,'en')[1].name,'New title');
 const category=copy.menus.mega.tabs[0].categories[0];category.label={tr:'Özel başlık'};category.children[0].url='/custom/index.html';
 assert.equal(categoryMenu(copy,[category])[0].name,'Özel başlık');
 assert.equal(categoryMenu(copy,[category])[0].children[0].url,'/custom/index.html');
 assert.equal(categoryMenu(copy,[category],'en','store')[0].url,channelUrl(copy.categories.find(c=>c.id===category.categoryId).url,'store'));
 assert.equal(menuText({tr:'Yedek',en:''},'en'),'Yedek');
});
test('footer order, titles, disabled links and social destinations are authored',()=>{
 const menus=structuredClone(data.menus);menus.footer.order=['contact','corporate','social'];
 menus.footer.groups.find(g=>g.id==='contact').title={tr:'İletişim menüsü'};
 menus.footer.groups.find(g=>g.id==='corporate').items[0].enabled=false;
 menus.social.items[0].url='https://www.instagram.com/example/';
 const nodes=footerMenuNodes(menus,'tr',[]);
 assert.equal(nodes[0].children[0].children[0],'İletişim menüsü');
 assert.equal(nodes[1].children[1].children.length,menus.footer.groups[0].items.length-1);
 assert.equal(nodes[2].children[1].children[0].tag,'a');
 assert.equal(nodes[2].children[1].children[1].tag,'span');
});
test('invalid destinations, duplicate IDs and broken category/page references stop the build',()=>{
 for(const mutate of [m=>m.header.service[0].url='javascript:alert(1)',m=>m.header.service.push(m.header.service[0]),m=>m.mobile.categories[0].categoryId='missing',m=>m.mobile.categories[0].children[0].subcategoryId='missing',m=>m.brand.pages[0].chapters[0].sectionId='missing',m=>m.footer.order.push('unknown'),m=>m.mega.tabs.forEach(t=>t.enabled=false)]){
 const menus=structuredClone(data.menus);mutate(menus);assert.throws(()=>validateMenus(menus,data),/Menü ayarı geçersiz/);
 }
});


test('both mega menu tabs link to the canonical product hierarchy', async()=>{
 for(const tab of data.menus.mega.tabs){
  for(const category of categoryMenu(data,tab.categories,'tr',tab.id)){
   assert.equal(category.url,channelUrl(data.categories.find(c=>c.id===category.id).url,tab.id));
   assert.match(category.url,/^urunler\//);
   await fs.access('dist/'+category.url.split('?')[0]);
   for(const sub of category.children){
    assert.equal(sub.url,channelUrl(data.subcategories.find(s=>s.id===sub.id).url,tab.id));
    assert.ok(sub.url.startsWith('urunler/'+category.id+'/'));
    await fs.access('dist/'+sub.url.split('?')[0]);
   }
  }
 }
});
test('old store-menu URL overrides fall back to the matching catalog destination',()=>{
 const entry=structuredClone(data.menus.mega.tabs[1].categories[0]);
 entry.url='/magaza-menu/old/index.html';entry.children[0].url='/magaza-menu/old/sub/index.html';
 const result=categoryMenu(data,[entry],'tr','store')[0];
 assert.equal(result.url,channelUrl(data.categories.find(c=>c.id===entry.categoryId).url,'store'));
 assert.equal(result.children[0].url,channelUrl(data.subcategories.find(s=>s.id===entry.children[0].subcategoryId).url,'store'));
});


test('explicit online denial on category, subcategory or product overrides enabled variants', () => {
 const source=data.products.find(p=>p.variants.some(v=>v.onlineSale===true && v.storeSale===true));
 assert.ok(source);
 for(const level of ['category','subcategory','product']) {
  for(const flag of (level==='product'?['onlineSale']:['onlineSale','megaMenuOnline'])) {
   const copy=structuredClone(data);
   const product=copy.products.find(p=>p.key===source.key);
   const category=copy.categories.find(c=>c.id===product.categoryId);
   const sub=copy.subcategories.find(s=>s.id===product.subcategoryId);
   const target=level==='category'?category:level==='subcategory'?sub:product;
   assert.ok(target);target[flag]=false;
   const online=catalogForChannel(copy,'online'),store=catalogForChannel(copy,'store');
   assert.ok(!online.products.some(p=>p.key===product.key));
   assert.ok(store.products.some(p=>p.key===product.key));
   const entries=[{categoryId:category.id,children:[{subcategoryId:sub.id}]}];
   const onlineMenu=categoryMenu(copy,entries,'tr','online');
   if(level==='category')assert.equal(onlineMenu.length,0);
   if(level==='subcategory')assert.ok(!onlineMenu.some(c=>c.children.some(s=>s.id===sub.id)));
   assert.ok(categoryMenu(copy,entries,'tr','store').some(c=>c.children.some(s=>s.id===sub.id)));
  }
 }
});
