export function validateRegions(config,languages){
  if(config?.schemaVersion!==1||!Array.isArray(config.countries)||!Array.isArray(languages))throw Error('Bölge dosyasının yapısı geçersiz.');
  const countries=new Set(config.countries.map(c=>c.code));
  const languageCodes=new Set(languages.map(l=>l.code));
  if(countries.size!==config.countries.length||languageCodes.size!==languages.length||!countries.has(config.defaultCountry)||!languageCodes.has(config.defaultLanguage)||config.countries.some(c=>!languageCodes.has(c.defaultLanguage)))throw Error('Bölge veya dil tanımları geçersiz.');
  return {...config,languages};
}

export function normalizePreferences(value,config,content){
  if(!value||!config)return null;
  const country=config.countries.find(c=>c.code===value.country||content?.texts?.['region.country.'+c.code]?.tr===value.country);
  const language=config.languages.find(l=>l.code===value.language||l.name===value.language);
  return country&&language?{country:country.code,language:language.code}:null;
}

export function validateRegionalCatalog(data,config){
  const countries=new Set(config.countries.map(c=>c.code));
  const languages=new Set(config.languages.map(l=>l.code));
  for(const item of [...data.categories,...data.subcategories,...data.products]){
    if(item.markets!==undefined&&(!Array.isArray(item.markets)||!item.markets.length||item.markets.some(code=>!countries.has(code))))throw Error('Ürün veya kategori bölge kodu geçersiz.');
    if(item.translations!==undefined&&(typeof item.translations!=='object'||item.translations===null||Array.isArray(item.translations)||Object.entries(item.translations).some(([code,text])=>!languages.has(code)||!text||typeof text!=='object'||Array.isArray(text)||Object.entries(text).some(([key,value])=>!['name','description','ingredients','servingSuggestion','storage','longTermStorage','delivery','packaging'].includes(key)||typeof value!=='string'))))throw Error('Ürün veya kategori çevirisi geçersiz.');
  }
  return data;
}

export function regionalCatalog(data,preferences,config){
  const country=preferences?.country||config.defaultCountry;
  const language=preferences?.language||config.defaultLanguage;
  const visible=item=>!Array.isArray(item.markets)||item.markets.includes(country);
  const translated=item=>{
    const text=item.translations?.[language]||{};
    return {...item,...Object.fromEntries(['name','description','ingredients','servingSuggestion','storage','longTermStorage','delivery','packaging'].filter(key=>typeof text[key]==='string').map(key=>[key,text[key]]))};
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
    return {...translated(p),category:parent?.translations?.[language]?.name||p.category,subcategory:sub?.translations?.[language]?.name||p.subcategory};
  });
  return {...data,categories,subcategories,products};
}
