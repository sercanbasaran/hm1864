const translatedFields=['name','label','description','ingredients','allergenInfo','servingSuggestion','storage','longTermStorage','delivery','packaging','portion','weight'];
export function validateRegions(config,languages){
  if(config?.schemaVersion!==2||!Array.isArray(config.groups)||!Array.isArray(config.countries)||!Array.isArray(config.currencies)||!Array.isArray(languages))throw Error('Bölge dosyasının yapısı geçersiz.');
  const countries=new Set(config.countries.map(c=>c.code));
  const languageCodes=new Set(languages.map(l=>l.code));
  const currencies=new Set(config.currencies);
  const groups=new Map(config.groups.map(g=>[g.id,g]));
  if(groups.size!==config.groups.length||countries.size!==config.countries.length||languageCodes.size!==languages.length||currencies.size!==config.currencies.length||!countries.has(config.defaultCountry)||!languageCodes.has(config.defaultLanguage)||!currencies.has(config.defaultCurrency)||config.currencies.some(c=>!/^[A-Z]{3}$/.test(c)))throw Error('Bölge, dil veya para birimi tanımları geçersiz.');
  for(const group of config.groups){
    if(!group.id||!Array.isArray(group.countries)||!group.countries.length||!Array.isArray(group.supportedLanguages)||!group.supportedLanguages.length||!Array.isArray(group.currencies)||!group.currencies.length||!group.supportedLanguages.includes(group.defaultLanguage)||!group.currencies.includes(group.defaultCurrency)||group.supportedLanguages.some(l=>!languageCodes.has(l))||group.currencies.some(c=>!currencies.has(c))||group.countries.some(code=>!countries.has(code)))throw Error('Pazar grubu tanımı geçersiz.');
  }
  for(const country of config.countries){
    const group=groups.get(country.group);
    if(!group||group.countries.filter(code=>code===country.code).length!==1||country.defaultLanguage&&!group.supportedLanguages.includes(country.defaultLanguage)||country.defaultCurrency&&!group.currencies.includes(country.defaultCurrency))throw Error('Ülke ve pazar grubu eşleşmesi geçersiz.');
  }
  if(config.groups.flatMap(g=>g.countries).length!==config.countries.length)throw Error('Ülkeler tek bir pazar grubunda olmalı.');
  return {...config,languages};
}

export function countryDefaults(config,code){
  const country=config.countries.find(c=>c.code===code);
  const group=config.groups.find(g=>g.id===country?.group);
  return country&&group?{group:group.id,language:country.defaultLanguage||group.defaultLanguage,currency:country.defaultCurrency||group.defaultCurrency}:null;
}

export function normalizePreferences(value,config,content){
  if(!value||!config)return null;
  const country=config.countries.find(c=>c.code===value.country||content?.texts?.['region.country.'+c.code]?.tr===value.country);
  const language=config.languages.find(l=>l.code===value.language||l.name===value.language);
  const defaults=countryDefaults(config,country?.code);
  const currency=value.currency===undefined?defaults?.currency:value.currency;
  if(!country||!language||!config.currencies.includes(currency))return null;
  const countryName=country.code==='OTHER'&&typeof value.countryName==='string'?value.countryName.trim().slice(0,100):'';
  return {group:defaults.group,country:country.code,language:language.code,currency,...(countryName?{countryName}:{})};
}

export function validateRegionalCatalog(data,config){
  const countries=new Set(config.countries.map(c=>c.code));
  const groups=new Set(config.groups.map(g=>g.id));
  const languages=new Set(config.languages.map(l=>l.code));
  const currencies=new Set(config.currencies);
  for(const item of [...data.categories,...data.subcategories,...data.products]){
    if(item.markets!==undefined&&(!Array.isArray(item.markets)||!item.markets.length||item.markets.some(code=>!countries.has(code)&&!groups.has(code))))throw Error('Ürün veya kategori bölge kodu geçersiz.');
    if(item.translations!==undefined&&(typeof item.translations!=='object'||item.translations===null||Array.isArray(item.translations)||Object.entries(item.translations).some(([code,text])=>!languages.has(code)||!text||typeof text!=='object'||Array.isArray(text)||Object.entries(text).some(([key,value])=>!translatedFields.includes(key)||typeof value!=='string'))))throw Error('Ürün veya kategori çevirisi geçersiz.');
    if(item.pricesByCurrency!==undefined&&(!item.pricesByCurrency||typeof item.pricesByCurrency!=='object'||Array.isArray(item.pricesByCurrency)||Object.entries(item.pricesByCurrency).some(([code,price])=>!currencies.has(code)||typeof price!=='number'||!Number.isFinite(price)||price<0)))throw Error('Para birimine göre fiyat geçersiz.');
  }
  for(const product of data.products){
    if(!currencies.has(product.currency))throw Error('Ürün para birimi geçersiz.');
    for(const item of [product,...product.variants]){for(const key of ['onlineSale','commonMarket'])if(item[key]!=null&&typeof item[key]!=='boolean')throw Error('Satış kanalı değeri geçersiz.');if(item.translations&&Object.entries(item.translations).some(([lang,fields])=>!languages.has(lang)||!fields||Object.entries(fields).some(([key,value])=>!translatedFields.includes(key)||typeof value!=='string')))throw Error('Varyant çevirisi geçersiz.');}
    for(const variant of product.variants){
      if(variant.pricesByCurrency!==undefined&&(!variant.pricesByCurrency||typeof variant.pricesByCurrency!=='object'||Array.isArray(variant.pricesByCurrency)||Object.entries(variant.pricesByCurrency).some(([code,price])=>!currencies.has(code)||typeof price!=='number'||!Number.isFinite(price)||price<0)))throw Error('Varyant para birimi fiyatı geçersiz.');
    }
  }
  return data;
}

export function regionalCatalog(data,preferences,config){
  const country=preferences?.country||config.defaultCountry;
  const group=countryDefaults(config,country).group;
  const language=preferences?.language||config.defaultLanguage;
  const visible=item=>(item.onlineSale!==false||item.commonMarket!==false)&&(!Array.isArray(item.markets)||item.markets.includes(country)||item.markets.includes(group));
  const translated=item=>{
    const text=item.translations?.[language]||{};
    return {...item,...Object.fromEntries(translatedFields.filter(key=>typeof text[key]==='string'&&text[key].trim()).map(key=>[key,text[key]]))};
  };
  const visibleCategories=data.categories.filter(visible);
  const categories=visibleCategories.map(translated);
  const visibleSubcategories=data.subcategories.filter(s=>visible(s)&&visibleCategories.some(c=>c.name===s.category));
  const subcategories=visibleSubcategories.map(s=>{
    const parent=data.categories.find(c=>c.name===s.category);
    return {...translated(s),category:parent?.translations?.[language]?.name||s.category};
  });
  const products=data.products.filter(p=>visible(p)&&visibleCategories.some(c=>c.name===p.category)&&visibleSubcategories.some(s=>s.category===p.category&&s.name===p.subcategory)).map(p=>{
    const parent=data.categories.find(c=>c.name===p.category);
    const sub=data.subcategories.find(s=>s.category===p.category&&s.name===p.subcategory);
    return {...translated(p),variants:p.variants.map(translated),category:parent?.translations?.[language]?.name||p.category,subcategory:sub?.translations?.[language]?.name||p.subcategory};
  });
  return {...data,categories,subcategories,products};
}
