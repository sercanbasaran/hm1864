import fs from 'node:fs/promises';
import path from 'node:path';
const routes=JSON.parse(await fs.readFile('src/routes.json','utf8'));
const data=JSON.parse(await fs.readFile('public/assets/data/products.json','utf8'));
const entries=new Set([...Object.keys(routes),...data.products.map(x=>x.url),...data.categories.map(x=>x.url),...data.subcategories.map(x=>x.url)]);
const html=await fs.readFile('dist/index.html','utf8');
for(const url of entries){if(url==='index.html')continue;if(url.includes('..')||!url.endsWith('.html'))throw Error('Unsafe route');const dest=path.join('dist',url);await fs.mkdir(path.dirname(dest),{recursive:true});await fs.writeFile(dest,html);}
console.log(`${entries.size} direct-entry HTML routes generated for React.`);
