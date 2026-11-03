import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
export const remainingLanguages=['ar','fr','es','ru','zh-CN','ja','hi','ur','fa','pt'];
const present=value=>typeof value==='string'&&value.trim();
export async function auditLocalizations(root=path.resolve('public/assets/data'),languages=remainingLanguages){
 const result=Object.fromEntries(languages.map(language=>[language,{siteMissing:0,productMissing:0,sliderMissing:0,examples:[]}]));
 const missing=(language,scope,pointer)=>{result[language][scope]++;if(result[language].examples.length<5)result[language].examples.push(pointer);};
 function compare(source,target,language,scope,pointer){
  if(present(source)){if(!present(target))missing(language,scope,pointer);}
  else if(Array.isArray(source))source.forEach((v,i)=>compare(v,target?.[i],language,scope,pointer+'/'+i));
  else if(source&&typeof source==='object')for(const [key,value]of Object.entries(source))compare(value,target?.[key],language,scope,pointer+'/'+key);
 }
 function localizedNodes(value,pointer){
  if(Array.isArray(value))return value.forEach((v,i)=>localizedNodes(v,pointer+'/'+i));
  if(!value||typeof value!=='object')return;
  if(present(value.tr))for(const language of languages)if(!present(value[language]))missing(language,'siteMissing',pointer);
  if(value.tr&&typeof value.tr==='object'&&!Array.isArray(value.tr)){
   for(const language of languages)compare(value.en||value.tr,value[language],language,'siteMissing',pointer);
   return;
  }
  for(const [key,v]of Object.entries(value))localizedNodes(v,pointer+'/'+key);
 }
 async function files(dir){
  const entries=await fs.readdir(dir,{withFileTypes:true});
  for(const entry of entries){
   const full=path.join(dir,entry.name);
   if(entry.isDirectory()){if(entry.name!=='products')await files(full);}
   else if(entry.name.endsWith('.json')&&full!==path.join(root,'home/slider.json'))localizedNodes(JSON.parse(await fs.readFile(full,'utf8')),path.relative(root,full));
  }
 }
 await files(root);
 const slider=JSON.parse(await fs.readFile(path.join(root,'home/slider.json'),'utf8'));
 for(const language of languages)for(const slide of slider.slides)compare(slide.content.en||slide.content.tr,slide.content[language],language,'sliderMissing','slider/'+slide.id);
 const manifest=JSON.parse(await fs.readFile(path.join(root,'catalog/manifest.json'),'utf8'));
 for(const category of manifest.categories){
  const source=JSON.parse(await fs.readFile(path.join(root,category.content.en),'utf8')).products;
  for(const language of languages){
   const file=category.content[language];
   const translated=file?JSON.parse(await fs.readFile(path.join(root,file),'utf8')).products:{};
   compare(source,translated,language,'productMissing','products/'+category.id);
  }
 }
 return result;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 auditLocalizations().then(result=>{console.log(JSON.stringify(result,null,2));if(process.argv.includes('--strict')&&Object.values(result).some(x=>x.siteMissing+x.productMissing+x.sliderMissing))process.exitCode=1;}).catch(error=>{console.error(error.message);process.exitCode=1;});
}
