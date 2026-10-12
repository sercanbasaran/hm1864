export function validateContent(content){
  if(content?.schemaVersion!==1||!Array.isArray(content.languages)||!content.texts||typeof content.texts!=='object')throw Error('Metin dosyasının yapısı geçersiz.');
  const codes=content.languages.map(l=>l.code);
  if(new Set(codes).size!==codes.length||!codes.includes('tr')||content.languages.some(l=>!l.code||!l.name))throw Error('Dil seçenekleri geçersiz.');
  for(const [key,entry] of Object.entries(content.texts)){
    if(!key||!entry||typeof entry!=='object'||typeof entry.tr!=='string'||!entry.tr||codes.some(code=>typeof entry[code]!=='string'))throw Error('Metin veya çeviri alanı geçersiz: '+key);
  }
  return content;
}

export function translate(content,language,key){
  const entry=content?.texts[key];
  return entry?.[language]||entry?.tr||key;
}

export function templateText(content,language,value){
  if(typeof value!=='string')return value;
  const match=value.match(/^(\s*)@text:([\w.]+)(\s*)$/);
  return match?match[1]+translate(content,language,match[2])+match[3]:value;
}

export function formatText(content,language,key,values={}){
  return translate(content,language,key).replace(/\{(\w+)\}/g,(match,name)=>Object.hasOwn(values,name)?String(values[name]):match);
}
