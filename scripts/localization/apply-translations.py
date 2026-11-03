"""Apply explicitly authored translations; never fill gaps with source-language text.
Glossary columns: English, Arabic, French, Spanish, Russian, Chinese, Japanese,
Hindi, Urdu, Persian, Portuguese. No online translation service is used.
"""
import json,re
from functools import lru_cache
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
BASE=ROOT/'public/assets/data'
LANGS=['ar','fr','es','ru','zh-CN','ja','hi','ur','fa','pt']
DIR=Path(__file__).parent

def table(file):
 out={lang:{} for lang in LANGS}
 for line in (DIR/file).read_text().splitlines():
  if not line.strip():continue
  cells=line.split('|')
  assert len(cells)==11,(file,cells[0],len(cells))
  for lang,text in zip(LANGS,cells[1:]):out[lang][cells[0]]=text
 return out
TABLES={f.stem:table(f.name) for f in DIR.glob('*.tsv')}

def replace(s,terms):
 if not terms:return s
 lookup={k.casefold():v for k,v in terms.items()}
 pattern=r'(?<!\w)(?:'+'|'.join(re.escape(k) for k in sorted(terms,key=len,reverse=True))+r')(?!\w)'
 return re.sub(pattern,lambda m:lookup[m[0].casefold()],s,flags=re.I)

def untranslated(s,terms):
 # Remove recognized English terms and invariant scientific units/size codes.
 rest=replace(s,{k:'' for k in terms})
 rest=re.sub(r'\b(?:XL|XS|L|M|S|g|kg|mm|kcal|kJ|C)\b','',rest)
 return bool(re.search('[A-Za-z]',rest))

ENFILES=list(BASE.glob('products/*/content/en.json'))
names=set()
for p in ENFILES:names.update(x['name'] for x in json.loads(p.read_text())['products'].values())
NAMES={lang:dict(TABLES['product-names'][lang]) for lang in LANGS}
for lang in LANGS:
 for name in names:
  if name in NAMES[lang]:continue
  for prefix in sorted(TABLES['product-flavours'][lang],key=len,reverse=True):
   if name.startswith(prefix+' ') and name[len(prefix)+1:] in NAMES[lang]:
    NAMES[lang][name]=NAMES[lang][name[len(prefix)+1:]]+' — '+TABLES['product-flavours'][lang][prefix];break
  assert name in NAMES[lang],(lang,'Missing name',name)

@lru_cache(maxsize=None)
def product_string(s,key,lang):
 if not s:return s
 exact={**TABLES['product-care'][lang],**TABLES['product-units'][lang],**NAMES[lang],**TABLES.get('product-descriptions',{}).get(lang,{})}
 if s in exact:return exact[s]
 lex={**TABLES['food-glossary'][lang],**NAMES[lang],'pistachio':TABLES['product-flavours'][lang]['Pistachio'],'ve':TABLES['food-glossary'][lang]['and'],'gluten':TABLES['allergens'][lang]['gluten']}
 if key=='ingredients':
  if not untranslated(s,lex):return replace(s,lex)
 if key=='allergenInfo':
  t=s
  patterns=[('May contain traces of (.*?) because products containing (.*?) are made on the same production line\\.', 'May contain traces of {items} because products containing {other} are made on the same production line.'),('May contain traces of (.*?) because it is processed on the same production line\\.','May contain traces of {items} because it is processed on the same production line.'),('May contain traces of (.*?)\\.','May contain traces of {items}.'),('Contains (.*?)\\.','Contains {items}.')]
  # Mask complete sentences so translated results cannot be processed again.
  sent=[]
  for pattern,template in patterns:
   def sub(m):
    item=m[1];other=m[2] if m.lastindex>1 else ''
    if untranslated(item,lex) or (other and untranslated(other,lex)):return m[0]
    sent.append(TABLES['allergens'][lang][template].format(items=replace(item,lex),other=replace(other,lex)))
    return '\x00'+str(len(sent)-1)+'\x00'
   t=re.sub(pattern,sub,t)
  terms={**lex,**NAMES[lang],'Please consider these allergens before consuming.':TABLES['allergens'][lang]['Please consider these allergens before consuming.'], 'This product is made with ingredients that do not contain allergens.':TABLES['product-care'][lang]['This product is made with ingredients that do not contain allergens.']}
  if not untranslated(t,terms):
   t=replace(t,terms)
   return re.sub('\x00(\\d+)\x00',lambda m:sent[int(m[1])],t)
 if key in ['storage','servingSuggestion','longTermStorage']:
  terms={**TABLES['product-care'][lang],**NAMES[lang]}
  if not untranslated(s,terms):return replace(s,terms)
 if key in ['basis','summary','portion','packaging','weight','label']:
  terms={**exact,**TABLES['product-units'][lang]}
  if not untranslated(s,terms):return replace(s,terms)
 return None

missing={lang:{} for lang in LANGS}
def walk(source,existing,lang,key=''):
 if isinstance(source,str):
  if existing and isinstance(existing,str):return existing
  translated=product_string(source,key,lang)
  if translated is None:missing[lang].setdefault(key,set()).add(source);return ''
  return translated
 if isinstance(source,dict):return {k:walk(v,existing.get(k) if isinstance(existing,dict) else None,lang,k) for k,v in source.items()}
 if isinstance(source,list):return [walk(v,existing[i] if isinstance(existing,list) and i<len(existing) else None,lang,key) for i,v in enumerate(source)]
 return source

if __name__=='__main__':
 for p in ENFILES:
  src=json.loads(p.read_text())
  for lang in LANGS:
   target=p.with_name(lang+'.json');current=json.loads(target.read_text()) if target.exists() else {}
   result={**src,'language':lang,'products':walk(src['products'],current.get('products'),lang)}
   target.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
 report={l:{k:sorted(v) for k,v in fields.items()} for l,fields in missing.items()}
 Path('/tmp/hm-authored-missing.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
 print(json.dumps({l:{k:len(v) for k,v in fields.items()} for l,fields in missing.items()},ensure_ascii=False,indent=2))
