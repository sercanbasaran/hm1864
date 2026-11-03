"""Apply authored site strings and reuse identical existing translations."""
import importlib.util,json,re
from pathlib import Path
spec=importlib.util.spec_from_file_location('authored',Path(__file__).with_name('apply-translations.py'));m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
LANGS=m.LANGS;BASE=m.BASE
D={l:{} for l in LANGS}
for table in m.TABLES.values():
 for l in LANGS:D[l].update(table[l])
for l in LANGS:D[l].update(m.NAMES[l])
files=[p for p in BASE.rglob('*.json') if '/products/' not in str(p)]
def gather(x):
 if isinstance(x,dict):
  if isinstance(x.get('en'),str):
   for l in LANGS:
    if isinstance(x.get(l),str) and x[l]:D[l].setdefault(x['en'],x[l])
  for v in x.values():gather(v)
 elif isinstance(x,list):
  for v in x:gather(v)
for p in files:gather(json.loads(p.read_text()))
for l in LANGS:
 D[l].update({k.casefold():v for k,v in list(D[l].items())})
MISSING={l:set() for l in LANGS}
def translate(s,l):
 if s in D[l]:return D[l][s]
 if s.casefold() in D[l]:return D[l][s.casefold()]
 if ' — ' in s:
  lead,tail=s.split(' — ',1)
  if re.fullmatch(r'[0-9–]+|1980s',lead):
   t=translate(tail,l)
   if t:return (translate(lead,l) or lead)+' — '+t
 for ending,template in [(' Store','{name} Store'),(' store','{name} Store'),(' archive document','{name} archive document'),(' archive photograph','{name} archive image'),(' archive image','{name} archive image'),(' award','{name} award'),(' · Honorary President','{name} · Honorary President'),(' · Loading…','{name} · Loading…'),(' home','{name} home')]:
  if s.endswith(ending):
   stem=s[:-len(ending)]
   if stem in ['Bahçekapı','BAHÇEKAPI','Nişantaşı','Sirkeci','Porta Vadi','Edebiyat Kıraathanesi','Tersane Istanbul','Paris 1923','Paris 1928','Liège 1925','Brussels 1935','BBC Good Food','Hafız Mustafa 1864','Avni Ongurlar','BBC Good Food Middle East']:
    return D[l][template].format(name=stem)
 if s.endswith(' · 1923') or s.endswith(' · 1925') or s.endswith(' · 1928') or s.endswith(' · 1935') or s=='1864 · Bahçekapı':return s
 if s.endswith(' — Store Menu'):
  stem=translate(s[:-13],l)
  menu=D[l].get('store menu')
  if stem and menu:return stem+' — '+menu
 if s.startswith('Product code:'):
  label=D[l].get('product code:')
  if label:return label+s[len('Product code:'):]
 # Proper names, postal addresses, phone numbers, scientific certification IDs
 # and official exhibition titles are invariant references, not untranslated prose.
 if not re.search('[A-Za-zÇçĞğİıÖöŞşÜü]',s):return s
 if s in ['TR','AE','GB','Avni Ongurlar','Eren Ongurlar','Emre Ongurlar','Bahçekapı','Hafız Mustafa 1864','BBC Good Food Middle East','BBC Good Food Middle East Magazine Awards','Legacy Honor – Cultural Heritage Pride','Superior Taste Award','International Taste Institute','DHL   UPS   COURIER','Discover   Apple Pay','VISA   Mastercard   AMEX','Facebook · YouTube','Instagram · TikTok','LinkedIn']:return s
 if s.startswith(('ISO ','HAFIZ MUSTAFA 1864','HACI ISMAIL','Hamidiye,','Harbiye,','Hobyar,','Hoca Paşa','Divan Yolu','Exposition Internationale','Exposition Universelle','Exposition Du Bien Etre','Internationale Du Confort','EXPOSITION DU CONFORT MODERNE')):return s
 if s==' | Hafız Mustafa 1864':return s
 return None

def fill(source,target,l):
 if isinstance(source,str):
  if isinstance(target,str) and target:return target
  t=translate(source,l)
  if t is None:
   if source:MISSING[l].add(source)
   return target or ''
  return t
 if isinstance(source,dict):
  out=dict(target) if isinstance(target,dict) else {}
  for k,v in source.items():out[k]=fill(v,out.get(k),l)
  return out
 if isinstance(source,list):return [fill(v,target[i] if isinstance(target,list) and i<len(target) else None,l) for i,v in enumerate(source)]
 return source

def walk(x):
 if isinstance(x,dict):
  if isinstance(x.get('tr'),str) and x['tr']:
   for l in LANGS:x[l]=fill(x.get('en') or x['tr'],x.get(l),l)
  elif isinstance(x.get('tr'),dict) and isinstance(x.get('en'),dict):
   for l in LANGS:x[l]=fill(x['en'],x.get(l),l)
   return
  if isinstance(x.get('translations'),dict):
   for l in LANGS:x['translations'][l]=fill(x['translations'].get('en',{}),x['translations'].get(l),l)
  for v in list(x.values()):walk(v)
 elif isinstance(x,list):
  for v in x:walk(v)
if __name__=='__main__':
 for p in files:
  x=json.loads(p.read_text());old=json.dumps(x,ensure_ascii=False);walk(x)
  if json.dumps(x,ensure_ascii=False)!=old:p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
 Path('/tmp/hm-site-authored-missing.json').write_text(json.dumps({l:sorted(v) for l,v in MISSING.items()},ensure_ascii=False,indent=2))
 print({l:len(v) for l,v in MISSING.items()})
