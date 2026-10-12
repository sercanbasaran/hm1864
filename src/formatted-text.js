const allowed=new Set(['strong','b','br','em','i','u','s','small','mark','sup','sub']);
const blocked=new Set(['script','style','iframe','object','embed','svg','math','template','img','video','audio','source','link','meta','base','input','button','form']);

// Parse in an inert template, then construct a small, attribute-free text tree.
// No source HTML or attributes are inserted into the live page.
export function parseFormattedText(value,document=globalThis.document){
  const text=String(value??'');
  if(!document||!/[<&]/.test(text))return [{text}];
  const template=document.createElement('template');template.innerHTML=text;
  const walk=node=>{
    if(node.nodeType===3)return [{text:node.textContent}];
    if(node.nodeType!==1)return [];
    const tag=node.tagName.toLowerCase();if(blocked.has(tag))return [];
    if(tag==='br')return [{tag:'br',children:[]}];
    const children=[...node.childNodes].flatMap(walk);
    return allowed.has(tag)?[{tag,children}]:children;
  };
  return [...template.content.childNodes].flatMap(walk);
}

export function plainText(value,document=globalThis.document){
  const flatten=nodes=>nodes.map(node=>'text'in node?node.text:node.tag==='br'?'\n':flatten(node.children)).join('');
  return flatten(parseFormattedText(value,document));
}
