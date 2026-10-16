import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {loadAuthoringData} from '../src/data-loader.js';
import {categoryMenu,primaryMenu,menuText,validateMenus} from '../src/menus.js';
import {footerMenuNodes} from '../src/utils/menu-template.js';
const {catalog:data}=await loadAuthoringData(async file=>JSON.parse(await fs.readFile('public/assets/data/'+file,'utf8')));
test('independent menu sources control ordering, visibility and labels without changing taxonomy',()=>{
 const copy=structuredClone(data),first=copy.menus.mobile.categories[0];
 first.enabled=false;copy.menus.mobile.categories.reverse();
 assert.notEqual(categoryMenu(copy,copy.menus.mobile.categories)[0].id,first.categoryId);
 assert.equal(categoryMenu(copy,copy.menus.mobile.categories).length,copy.menus.mobile.categories.length-1);
 assert.equal(categoryMenu(copy,copy.menus.mega.tabs[0].categories).length,copy.menus.mega.tabs[0].categories.length);
 copy.menus.header.primary[1].label={tr:'Yeni başlık',en:'New title'};
 assert.equal(primaryMenu(copy,'en')[1].name,'New title');
 const category=copy.menus.mega.tabs[0].categories[0];category.label={tr:'Özel başlık'};category.children[0].url='/custom/index.html';
 assert.equal(categoryMenu(copy,[category])[0].name,'Özel başlık');
 assert.equal(categoryMenu(copy,[category])[0].children[0].url,'/custom/index.html');
 assert.equal(categoryMenu(copy,[category],'en','store')[0].url,'/magaza-menu/'+category.categoryId+'/index.html');
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
