#!/usr/bin/env python3
"""Replace storefront catalogue with a validated USTA variant export. No API credentials used."""
import argparse, collections, hashlib, json, pathlib, re, shutil, unicodedata, urllib.request, urllib.error, concurrent.futures
ROOT=pathlib.Path(__file__).resolve().parents[1]
BASE=ROOT/'public/assets/data'
def slug(s):
 s=str(s).lower().replace('ı','i');s=unicodedata.normalize('NFD',s);s=''.join(c for c in s if not unicodedata.combining(c));return re.sub('[^a-z0-9]+','-',s).strip('-')
def load(p):return json.loads(p.read_text())
def write(p,d):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
def unpack(row,key):return json.loads(row[key])
def urls(s):return list(dict.fromkeys(re.findall(r'https://1864usta\.netlify\.app/api/media/[a-zA-Z0-9-]+/content',s or '')))
def clean(s):return str(s or '').replace('\\n','\n').strip()
def nutrition(s):return {'basis':'100 g için','values':[],'summary':clean(s),'note':''}
def download_media(links):
 mapping={};errors=[];folder=ROOT/'public/assets/images/urunler/imported';folder.mkdir(parents=True,exist_ok=True)
 def fetch(url):
  try:
   with urllib.request.urlopen(url,timeout=25) as response:
    body=response.read(20*1024*1024+1)
    if len(body)>20*1024*1024:raise ValueError('Image exceeds 20 MB')
    ext='png' if body.startswith(b'\x89PNG') else 'jpg' if body.startswith(b'\xff\xd8') else 'webp' if body.startswith(b'RIFF') and body[8:12]==b'WEBP' else None
    if not ext:raise ValueError('Response is not a supported raster image')
    name=url.split('/')[-2]+'.'+ext;(folder/name).write_bytes(body);return url,'imported/'+name,None
  except Exception as error:return url,None,str(error)
 ordered=sorted(links)
 if not ordered:return mapping,errors
 first=fetch(ordered[0])
 if first[2] and ('401' in first[2] or '403' in first[2]):return {},[{'url':first[0],'error':first[2],'remaining':'Same protected API was not retried without authorization.'}]
 results=[first]
 with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:results+=list(pool.map(fetch,ordered[1:]))
 for url,path,error in results:
  if path:mapping[url]=path
  else:errors.append({'url':url,'error':error})
 return mapping,errors

def run(source,download=False):
 rows=load(source)
 if not isinstance(rows,list) or not rows:raise ValueError('Expected non-empty exported variant array')
 ids=[r['Varyant kimliği'] for r in rows]
 if len(set(ids))!=len(ids) or len({r['Varyant kodu'] for r in rows})!=len(rows):raise ValueError('Duplicate variant IDs or SKUs')
 manifest=load(BASE/'catalog/manifest.json');languages=list(manifest['categories'][0]['content']);oldtax=load(BASE/'catalog/categories.json')
 oldcats={c['name']:c for c in oldtax['categories']};oldsubs={(s['categoryId'],s['name']):s for s in oldtax['subcategories']}
 source_products={};grouped=collections.OrderedDict();paths={}
 for row in rows:
  if row['E-Mağaza'] not in ['Açık','Kapalı']:raise ValueError('Unknown E-Mağaza value')
  v=unpack(row,'Varyant tüm verileri (JSON)')
  if v['sku']!=row['Varyant kodu'] or v['id']!=row['Varyant kimliği']:raise ValueError('Variant identities disagree')
  if (row['E-Mağaza']=='Açık')!=v['effectiveSales']['online']:raise ValueError('Channel fields disagree')
  if not isinstance(row['Satış fiyatı'],(int,float)) or row['Satış fiyatı']<0:raise ValueError('Invalid price')
  for p in unpack(row,'İçerikteki ürünlerin tüm verileri (JSON)'):source_products[str(p['id'])]=p
  code=str(row['Ürün kodu']);grouped.setdefault(code,[]).append(row)
  category=row['Kategori'].split(' / ');paths[code]=(category[0],category[1] if len(category)>1 else category[0],len(category)==1)
 product_keys={str(p['id']):'usta-'+str(p['productCode']) for p in source_products.values()}
 all_media=set(u for row in rows for field in ['Varyant fotoğraf linkleri','Ürün fotoğraf linkleri','Kutu fotoğraf linkleri'] for u in urls(row[field]))
 mapping,media_errors=download_media(all_media) if download else ({},[])
 available=lambda links:list(dict.fromkeys(mapping[u] for u in links if u in mapping))
 cats={};subs={};products_by_cat=collections.defaultdict(list);tr_by_cat=collections.defaultdict(dict);prices_by_cat=collections.defaultdict(dict);media_links=set();variant_summary=[]
 for code,variants in grouped.items():
  first=variants[0];tech=unpack(first,'Teknik kimlikler (JSON)');p=source_products[str(tech['sourceProductId'])]
  catname,subname,is_root=paths[code];cid=slug(catname);sid=cid+'/'+slug(subname)
  if cid not in cats:
   old=oldcats.get(catname,{})
   cats[cid]={'id':cid,'name':catname,'url':f'urunler/{cid}/index.html','subcategories':[],'megaMenuOnline':False,'highlightOnHeader':False,'translations':old.get('translations',{})}
  if sid not in subs:
   old=oldsubs.get((cid,subname),{})
   subs[sid]={'id':sid,'categoryId':cid,'name':subname,'category':catname,'url':f'urunler/{cid}/index.html' if is_root else f'urunler/{sid}/index.html','megaMenuOnline':False,'translations':old.get('translations',{})};cats[cid]['subcategories'].append(subname)
  key='usta-'+code;images=urls(first['Ürün fotoğraf linkleri']);media_links.update(images)
  product={'key':key,'code':code,'sourceProductId':p['id'],'url':f'urunler/{cid if is_root else sid}/{slug(first["Ürün adı"])}.html','currency':'TRY','categoryId':cid,'subcategoryId':sid,'images':available(images),'sourceImageUrls':images,'stock':None,'onlineSale':any(r['E-Mağaza']=='Açık' for r in variants),'commonMarket':True,'editorial':[],'unitPricing':p.get('unitPricing',{}),'dimensions':p.get('dimensions',{}),'satiety':p.get('satiety',[]),'variants':[]}
  if cid=='baklavalar':product['quantityUnit']='slice'
  tr={'name':first['Ürün adı'],'description':clean(p.get('description')),'ingredients':clean(p.get('ingredients')),'allergenInfo':clean(p.get('allergens')),'servingSuggestion':clean(p.get('servingSuggestion')),'storage':clean(p.get('storageConditions')),'longTermStorage':clean(p.get('longTermStorage')),'nutrition':nutrition(p.get('nutrition')),'variants':{}}
  pricing={'base':{'TRY':None},'variants':{}}
  for row in variants:
   v=unpack(row,'Varyant tüm verileri (JSON)');pack=unpack(row,'Kutu tüm verileri (JSON)') if row['Kutu tüm verileri (JSON)'] else {};channel=v['effectiveSales'];vid=row['Varyant kodu']
   photos=urls(row['Varyant fotoğraf linkleri']);boxphotos=urls(row['Kutu fotoğraf linkleri']);media_links.update(photos+boxphotos)
   variant={'code':vid,'sku':vid,'sourceVariantId':v['id'],'name':row['Varyant adı'],'images':available(photos+boxphotos),'sourceImageUrls':photos,'sourceBoxImageUrls':boxphotos,'onlineSale':row['E-Mağaza']=='Açık','storeSale':row['Mağaza']=='Açık','commonMarket':True,'stock':None,'active':v['active'],'cardDescription':clean(row['Kart açıklaması']),'type':row['Varyant tipi'],'unit':row['Birim'],'quantity':row['Miktar'],'netWeight':row['Net gramaj (g)'],'dimensions':{k:pack.get(k) for k in ['length','width','height','diameter'] if pack.get(k) is not None},'satiety':v.get('information',{}).get('satiety',[]),'salesChannels':channel,'boxContents':[],'packageContents':[]}
   if available(boxphotos):variant['boxImage']=available(boxphotos)[0]
   if cid=='baklavalar':variant['sliceCount']=row['Dilim adedi']
   for item in v['items']:
    part=source_products[str(item['productId'])]
    variant['boxContents'].append({'id':str(item['productId']),'productKey':product_keys[str(item['productId'])],'name':part['name'],'quantity':item['quantity'],'unit':part.get('unitPricing',{}).get('unit',''),'image':next(iter(available(part.get('photoUrls',[]))),''),'dimensions':part.get('dimensions',{}),'unitWeight':part.get('unitPricing',{}).get('weight'),'unitPrice':part.get('unitPricing',{}).get('price'),'portion':part.get('portion',{})})
   for i,line in enumerate(clean(row['Sarf malzemeler']).splitlines()):
    m=re.match(r'(.+):\s*(\d+)\s*$',line)
    if m:variant['packageContents'].append({'id':str(i),'name':m[1],'quantity':int(m[2])})
   short=re.search(r'\[([^]]+)\]',row['Varyant adı']);info=v.get('information',{})
   text={'label':short.group(1) if short else row['Varyant adı'],'description':clean(v.get('description')) or clean(p.get('description')) or clean(row['Kart açıklaması']),'weight':f'{row["Net gramaj (g)"]} g','portion':clean(row['Porsiyon bilgisi']),'ingredients':clean(row['İçindekiler']),'allergenInfo':clean(row['Alerjen uyarısı']),'nutrition':nutrition(row['Besin değerleri (100 g için)']),'servingSuggestion':clean(row['Servis Önerisi']),'storage':clean(row['Saklama koşulları']),'longTermStorage':clean(row['Uzun süreli muhafaza']),'packaging':clean(row['Ambalaj / servis'])+(f'\nKutu ölçüleri: {row["Kutu ölçüleri (mm)"]} mm' if row['Kutu ölçüleri (mm)'] else '')}
   product['variants'].append(variant);tr['variants'][vid]=text;pricing['variants'][vid]={'TRY':row['Satış fiyatı']}
   variant_summary.append({'productKey':key,'sku':vid,'online':variant['onlineSale'],'store':variant['storeSale'],'price':row['Satış fiyatı'],'sourceVariantId':v['id']})
  product['defaultVariant']=min(product['variants'],key=lambda v:(not v['onlineSale'],pricing['variants'][v['code']]['TRY']))['code']
  products_by_cat[cid].append(product);tr_by_cat[cid][key]=tr;prices_by_cat[cid][key]=pricing
  if product['onlineSale']:cats[cid]['megaMenuOnline']=True;subs[sid]['megaMenuOnline']=True
 for c in cats.values():c['highlightOnHeader']=c['megaMenuOnline'] and c['id'] in ['baklavalar','lokumlar','kadayiflar']
 # Only exported categories/products remain in the authoring catalogue.
 shutil.rmtree(BASE/'products');manifest['categories']=[]
 for cid,products in products_by_cat.items():
  folder=BASE/'products'/cid;write(folder/'products.json',{'schemaVersion':1,'categoryId':cid,'products':products});write(folder/'prices.json',{'schemaVersion':1,'categoryId':cid,'products':prices_by_cat[cid]})
  for lang in languages:write(folder/'content'/f'{lang}.json',{'schemaVersion':1,'categoryId':cid,'language':lang,'products':tr_by_cat[cid] if lang=='tr' else {}})
  manifest['categories'].append({'id':cid,'products':f'products/{cid}/products.json','prices':f'products/{cid}/prices.json','content':{lang:f'products/{cid}/content/{lang}.json' for lang in languages}})
 manifest['catalogMeta']={'currency':'TRY','catalogChannels':True,'sourceExportSha256':hashlib.sha256(source.read_bytes()).hexdigest()};write(BASE/'catalog/manifest.json',manifest);write(BASE/'catalog/categories.json',{'schemaVersion':1,'categories':list(cats.values()),'subcategories':list(subs.values())})
 def groups(online):
  return [{'categoryId':c['id'],'enabled':True,'children':[{'subcategoryId':s['id'],'enabled':True} for s in subs.values() if s['categoryId']==c['id'] and s['url']!=c['url'] and (not online or s['megaMenuOnline'])]} for c in cats.values() if not online or c['megaMenuOnline']]
 mega=load(BASE/'menus/mega.json');mega['tabs'][0]['categories']=groups(True);mega['tabs'][1]['categories']=groups(False);write(BASE/'menus/mega.json',mega)
 header=load(BASE/'menus/header.json');header['primary']=[header['primary'][0]]+[{'id':c['id'],'categoryId':c['id'],'enabled':True} for c in cats.values() if c['highlightOnHeader']];write(BASE/'menus/header.json',header)
 mobile=load(BASE/'menus/mobile.json');mobile['categories']=groups(False);write(BASE/'menus/mobile.json',mobile);write(BASE/'menus/category.json',{'schemaVersion':1,'groups':groups(False)})
 footer=load(BASE/'menus/footer.json')
 for g in footer['groups']:
  if g['id']=='products':g['items']=[{'id':c['id'],'enabled':True,'label':{'tr':c['name']},'url':c['url']} for c in cats.values()]
  else:g['items']=[i for i in g['items'] if not str(i.get('url','')).lstrip('/').startswith(('urunler/','magaza-menu/'))]
 write(BASE/'menus/footer.json',footer)
 routefile=ROOT/'src/routes.json';routes=load(routefile);routes={k:v for k,v in routes.items() if not k.startswith(('urunler/','magaza-menu/'))};routes['urunler/index.html']={'kind':'overview','titleKey':'page.0013'};write(routefile,routes)
 sectionfile=ROOT/'src/components/home/sections.json';sections=load(sectionfile);featured=[]
 for cid in ['baklavalar','lokumlar','kadayiflar','pastalar']:
  candidates=[p for p in products_by_cat[cid] if p['onlineSale']]
  if candidates:featured.append(candidates[0]['key'])
 sections['featuredProducts']['productKeys']=featured;write(sectionfile,sections)
 report={'sourceFile':source.name,'sourceSha256':manifest['catalogMeta']['sourceExportSha256'],'products':len(grouped),'variants':len(rows),'onlineVariants':sum(r['E-Mağaza']=='Açık' for r in rows),'storeOnlyVariants':sum(r['E-Mağaza']=='Kapalı' for r in rows),'categories':len(cats),'subcategories':len(subs),'mediaUrls':sorted(media_links),'downloadedMedia':len(mapping),'pendingMedia':len(media_links)-len(mapping),'mediaErrors':media_errors,'mediaStatus':'Source media requires authorized/public access; no legacy images reused.' if len(mapping)<len(media_links) else 'All source media imported.','variantsBySku':variant_summary}
 write(ROOT/'docs/catalog-import-report.json',report);print(json.dumps({k:v for k,v in report.items() if k not in ['mediaUrls','variantsBySku']},ensure_ascii=False))
if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('source',type=pathlib.Path);parser.add_argument('--download-media',action='store_true');args=parser.parse_args();run(args.source,args.download_media)
