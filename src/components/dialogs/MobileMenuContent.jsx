import React from 'react';
import {useApp} from '../../context/AppContext.jsx';
import {local} from '../../utils/urls.js';
import RichText from '../../RichText.jsx';
import MenuItems from '../layout/MenuItems.jsx';
import {categoryMenu,menuText} from '../../menus.js';
export default function MobileMenuContent(){
  const {data,preferences,regions}=useApp(),language=preferences?.language||regions.defaultLanguage,menu=data.menus.mobile;
  return <nav className="mobile-menu-content">{categoryMenu(data,menu.categories,language).map(c=><details key={c.id}><summary><RichText value={c.name}/></summary><a href={local(c.url)}><RichText value={menuText(menu.allCategoryLabel,language).replace('{name}',c.name)}/></a>{c.children.map(s=><a key={s.id} href={local(s.url)}><RichText value={s.name}/></a>)}</details>)}<MenuItems items={menu.links}/></nav>;
}
