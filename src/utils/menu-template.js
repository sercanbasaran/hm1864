import {menuText,visibleItems} from '../menus.js';
export function footerMenuNodes(menus,language,partners){
  const node=(tag,attrs={},children=[])=>({tag,attrs,children});
  const link=item=>node('a',{href:item.url},[menuText(item.label,language)]);
  return menus.footer.order.flatMap(id=>{
    if(id==='partners')return partners||[];
    if(id==='social')return [node('div',{class:'footer-col'},[node('h2',{},[menuText(menus.social.title,language)]),node('div',{class:'footer-social-icons'},visibleItems(menus.social.items).map(item=>node(item.url?'a':'span',{class:'footer-social-icon',...(item.url?{href:item.url}:{role:'img'}),'aria-label':menuText(item.label,language),title:menuText(item.label,language)},[node('icon',{name:item.icon})])))])];
    const group=menus.footer.groups.find(g=>g.id===id);if(!group||group.enabled===false)return [];
    const title=menuText(group.title,language),items=visibleItems(group.items).map(link);
    return [group.accordion?node('details',{class:'footer-col',open:''},[node('summary',{},[title]),node('div',{},items)]):node('div',{class:'footer-col'},[node('h2',{},[title]),...items])];
  });
}
