
export const visibleItems=items=>(items||[]).filter(item=>item.enabled!==false);
export const menuText=(value,language='tr')=>typeof value==='string'?value:value?.[language]||value?.tr||'';
export function categoryMenu(data,entries,language='tr',mode='online'){
  return visibleItems(entries).flatMap(entry=>{
    const category=data.categories.find(c=>c.id===entry.categoryId);
    if(!category)return [];
    const children=visibleItems(entry.children).flatMap(item=>{
      const sub=data.subcategories.find(s=>s.id===item.subcategoryId&&s.categoryId===category.id);
      return sub?[{...sub,catalogName:sub.name,name:menuText(item.label,language)||sub.name,url:item.url||(mode==='store'?'/magaza-menu/'+category.id+'/'+sub.id.split('/').at(-1)+'/index.html':sub.url)}]:[];
    });
    return [{...category,catalogName:category.name,name:menuText(entry.label,language)||category.name,url:entry.url||(mode==='store'?'/magaza-menu/'+category.id+'/index.html':category.url),children}];
  });
}
export function primaryMenu(data,language){
  return visibleItems(data.menus.header.primary).flatMap(item=>{
    const c=data.categories.find(c=>c.id===item.categoryId);
    return item.id==='all'?[{...item,name:menuText(item.label,language)}]:c?[{...item,name:menuText(item.label,language)||c.name}]:[];
  });
}
export function validateMenus(menus,catalog){
  const fail=message=>{throw Error('Menü ayarı geçersiz: '+message)};
  const text=value=>typeof value==='string'?!!value.trim():value&&typeof value==='object'&&!Array.isArray(value)&&typeof value.tr==='string'&&!!value.tr.trim()&&Object.values(value).every(v=>typeof v==='string');
  const url=value=>typeof value==='string'&&!!value.trim()&&!/[\\\s<>]/.test(value)&&!value.includes('..')&&!value.startsWith('//')&&!/^(?!https?:|mailto:|tel:)[a-z][a-z0-9+.-]*:/i.test(value);
  const list=(items,key,idKey='id')=>{if(!Array.isArray(items))fail(key);const ids=new Set();for(const item of items){if(!item||typeof item[idKey]!=='string'||!item[idKey]||ids.has(item[idKey]))fail(key+' kimlik');ids.add(item[idKey]);if(item.enabled!==undefined&&typeof item.enabled!=='boolean')fail(key+' enabled');if(item.label!==undefined&&!text(item.label))fail(key+' label');if(item.url!==undefined&&!url(item.url)&&!(key==='social'&&item.url===''))fail(key+' url');}return items};
  const links=(items,key)=>{for(const item of list(items,key))if(!text(item.label)||!url(item.url))fail(key+' bağlantı')};
  const categories=(items,key)=>{for(const entry of list(items,key,'categoryId')){if(!catalog.categories.some(c=>c.id===entry.categoryId))fail(key+' kategori: '+entry.categoryId);for(const sub of list(entry.children,key+'/children','subcategoryId'))if(!catalog.subcategories.some(s=>s.id===sub.subcategoryId&&s.categoryId===entry.categoryId))fail(key+' alt kategori: '+sub.subcategoryId)}};
  for(const key of ['header','mega','mobile','footer','social','category','brand'])if(menus[key]?.schemaVersion!==1)fail(key+' dosyası');
  links(menus.header.service,'header.service');links(menus.header.collection,'header.collection');
  for(const key of ['actionsLeft','actionsRight'])for(const item of list(menus.header[key],key))if((item.action ? !['mobile','search','profile','cart','region'].includes(item.action) : !url(item.url))||!text(item.label)||!item.icon)fail(key+' action');
  for(const item of list(menus.header.primary,'header.primary'))if(item.id==='all'?!text(item.label):!catalog.categories.some(c=>c.id===item.categoryId))fail('header.primary kategori');
  const tabs=list(menus.mega.tabs,'mega.tabs');if(!visibleItems(tabs).length)fail('En az bir mega menü sekmesi açık olmalı');for(const tab of tabs){if(!['online','store'].includes(tab.id)||!text(tab.label))fail('mega.tabs');categories(tab.categories,'mega.'+tab.id)}
  categories(menus.mobile.categories,'mobile.categories');links(menus.mobile.links,'mobile.links');if(!text(menus.mobile.allCategoryLabel))fail('mobile.allCategoryLabel');
  categories(menus.category.groups,'category.groups');
  for(const group of list(menus.footer.groups,'footer.groups')){if(!text(group.title)||typeof group.accordion!=='boolean')fail('footer.group');links(group.items,'footer.'+group.id)}
  if(!Array.isArray(menus.footer.order)||new Set(menus.footer.order).size!==menus.footer.order.length||menus.footer.order.some(id=>!['partners','social',...menus.footer.groups.map(g=>g.id)].includes(id)))fail('footer.order');
  if(!text(menus.social.title))fail('social.title');for(const item of list(menus.social.items,'social'))if(!text(item.label)||!item.icon)fail('social.item');
  if(!text(menus.brand.chaptersTitle)||!text(menus.brand.relatedTitle)||!Number.isInteger(menus.brand.relatedLimit)||menus.brand.relatedLimit<0)fail('brand labels/limit');
  for(const entry of list(menus.brand.pages,'brand.pages','pageId')){const page=catalog.brandPages.find(p=>p.id===entry.pageId);if(!page)fail('brand.pageId');for(const chapter of list(entry.chapters,'brand.chapters','sectionId'))if(!page.sections.some(s=>s.id===chapter.sectionId))fail('brand.sectionId')}
  for(const group of list(menus.brand.groups,'brand.groups','groupId')){if(!catalog.brandGroups.some(g=>g.id===group.groupId))fail('brand.groupId');for(const entry of list(group.pages,'brand.related','pageId'))if(!catalog.brandPages.some(p=>p.id===entry.pageId&&p.groupId===group.groupId))fail('brand.related.pageId')}
  links(menus.brand.endLinks,'brand.endLinks');return menus;
}
