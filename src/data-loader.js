import {validate} from './model.js';
import {validateContent} from './i18n.js';
import {validateRegions,validateRegionalCatalog} from './market.js';

const safePath=path=>typeof path==='string'&&/^[a-zA-Z0-9_./-]+\.json$/.test(path)&&!path.includes('..')&&!path.startsWith('/');
const meaningful=value=>typeof value==='string'?!!value.trim():Array.isArray(value)?value.some(meaningful):value&&typeof value==='object'?Object.values(value).some(meaningful):value!==null&&value!==undefined;
const compactTranslation=object=>Object.fromEntries(Object.entries(object||{}).filter(([,value])=>Array.isArray(value)?value.some(meaningful):meaningful(value)));
const without=(object,keys)=>Object.fromEntries(Object.entries(object||{}).filter(([key])=>!keys.includes(key)));
const validateEditorialText=(text,key)=>{if(text===undefined)return;if(!text||typeof text!=='object'||Array.isArray(text)||Object.entries(text).some(([field,value])=>!['title','image','imageAlt','paragraphs'].includes(field)||(field==='paragraphs'?(!Array.isArray(value)||value.some(p=>typeof p!=='string')):typeof value!=='string')))throw Error('Hikâye/kutu içerik şablonu geçersiz: '+key)};

// Used by Vite in development/build and by route generation and tests.
// Authoring files remain the only editable sources; the runtime bundle is generated.
export async function loadAuthoringData(readJSON){
  const read=async path=>{if(!safePath(path))throw Error('Geçersiz veri dosyası yolu: '+path);const value=await readJSON(path);if(value.schemaVersion!==1&&path!=='settings/regions.json')throw Error('Veri dosyası sürümü geçersiz: '+path);return value};
  const manifest=await read('catalog/manifest.json');
  const [taxonomy,languageSettings,regionSettings,platformSettings,uiFiles]=await Promise.all([read(manifest.catalog),read(manifest.settings.languages),read(manifest.settings.regions),read(manifest.settings.platforms),Promise.all(manifest.ui.map(read))]);
  const texts={};for(const file of uiFiles)for(const [key,value]of Object.entries(file.texts)){if(Object.hasOwn(texts,key))throw Error('UI metin anahtarı tekrar ediyor: '+key);texts[key]=value}
  const content=validateContent({schemaVersion:1,languages:languageSettings.languages,texts});
  const regions=validateRegions(regionSettings,content.languages);
  const categories=taxonomy.categories.map(c=>({...c,products:[]}));
  const subcategories=taxonomy.subcategories.map(s=>{const parent=categories.find(c=>c.id===s.categoryId);if(!parent)throw Error('Alt kategori ana kategorisi bulunamadı: '+s.id);return {...s,category:parent.name,products:[]}});
  const products=(await Promise.all(manifest.categories.map(async entry=>{
    const [source,prices,localeFiles]=await Promise.all([read(entry.products),read(entry.prices),Promise.all(Object.entries(entry.content).map(async([lang,path])=>{const file=await read(path);if(file.language!==lang)throw Error('İçerik dili eşleşmiyor: '+path);return [lang,file.products]}))]);
    if(source.categoryId!==entry.id||prices.categoryId!==entry.id)throw Error('Kategori dosyaları eşleşmiyor: '+entry.id);
    const localized=Object.fromEntries(localeFiles),ids=new Set(source.products.map(p=>p.key));
    for(const file of [prices.products,...Object.values(localized)])for(const key of Object.keys(file))if(!ids.has(key))throw Error('Ürüne ait olmayan içerik/fiyat anahtarı: '+key);
    return source.products.map(p=>{
      const category=categories.find(c=>c.id===p.categoryId),subcategory=subcategories.find(s=>s.id===p.subcategoryId&&s.categoryId===p.categoryId);
      if(!category||!subcategory||p.categoryId!==entry.id)throw Error('Ürün kategori bağlantısı geçersiz: '+p.key);
      const tr=localized.tr?.[p.key];if(!tr?.name)throw Error('Türkçe ürün adı eksik: '+p.key);
      const price=prices.products[p.key];if(!price?.base||!price.variants)throw Error('Ürün fiyat alanı eksik: '+p.key);
      for(const map of [price.base,...Object.values(price.variants)])for(const [code,n]of Object.entries(map))if(!regions.currencies.includes(code)||(n!==null&&(typeof n!=='number'||!Number.isFinite(n)||n<0)))throw Error('Fiyat/para birimi geçersiz: '+p.key);
      const variantCodes=new Set(p.variants.map(v=>v.code));
      for(const key of Object.keys(price.variants))if(!variantCodes.has(key))throw Error('Fiyat varyantı bulunamadı: '+p.key+'/'+key);
      for(const fields of Object.values(localized))for(const key of Object.keys(fields[p.key]?.variants||{}))if(!variantCodes.has(key))throw Error('İçerik varyantı bulunamadı: '+p.key+'/'+key);
      const translations=Object.fromEntries(Object.entries(localized).filter(([lang])=>lang!=='tr').map(([lang,fields])=>[lang,compactTranslation(without(fields[p.key],['variants','editorial']))]));
      const variants=p.variants.map(v=>{const pricing=price.variants[v.code];if(!pricing)throw Error('Varyant fiyat alanı eksik: '+p.key+'/'+v.code);return {...v,...(tr.variants?.[v.code]||{}),price:pricing[p.currency]??null,pricesByCurrency:Object.fromEntries(Object.entries(pricing).filter(([code,n])=>code!==p.currency&&n!==null)),translations:Object.fromEntries(Object.entries(localized).filter(([lang])=>lang!=='tr').map(([lang,fields])=>[lang,compactTranslation(fields[p.key]?.variants?.[v.code])]))}});
      const sectionTypes=new Set();
      const editorial=(p.editorial||[]).map(section=>{if(!['story','boxReuse'].includes(section.type)||sectionTypes.has(section.type)||typeof section.enabled!=='boolean'||typeof section.image!=='string')throw Error('Ürün hikâye/kutu görsel ayarı geçersiz: '+p.key);sectionTypes.add(section.type);for(const [lang,fields]of Object.entries(localized))validateEditorialText(fields[p.key]?.editorial?.[section.type],p.key+'/'+lang+'/'+section.type);return {...section,...compactTranslation(tr.editorial?.[section.type]),translations:Object.fromEntries(Object.entries(localized).filter(([lang])=>lang!=='tr').map(([lang,fields])=>[lang,compactTranslation(fields[p.key]?.editorial?.[section.type])]))}});
      category.products.push(p.key);subcategory.products.push(p.key);
      return {...p,...without(tr,['variants','editorial']),category:category.name,subcategory:subcategory.name,price:price.base[p.currency]??null,pricesByCurrency:Object.fromEntries(Object.entries(price.base).filter(([code,n])=>code!==p.currency&&n!==null)),variants,translations,editorial};
    });
  }))).flat();
  const catalog=validateRegionalCatalog(validate({schemaVersion:1,...manifest.catalogMeta,categories,subcategories,products,orderPlatforms:platformSettings.platforms}),regions);
  return {schemaVersion:1,catalog,content,regions:regionSettings};
}

export function localizedEditorial(sections,language){
  return (sections||[]).map(section=>{const text=section.translations?.[language]||{};return {...section,...Object.fromEntries(Object.entries(text).filter(([,value])=>Array.isArray(value)?value.some(meaningful):meaningful(value)))}});
}
