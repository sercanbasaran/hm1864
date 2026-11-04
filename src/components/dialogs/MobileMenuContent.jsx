import React, {useState} from 'react';
import {useApp} from '../../context/AppContext.jsx';
import {local} from '../../utils/urls.js';
import RichText from '../../RichText.jsx';
import Icon from '../Icon.jsx';
import MenuItems from '../layout/MenuItems.jsx';
import {categoryMenu,menuText} from '../../menus.js';
export default function MobileMenuContent(){
  const {data,catalogData,channel,preferences,regions}=useApp(),language=preferences?.language||regions.defaultLanguage,menu=data.menus.mobile;
  const [mode,setMode]=useState(channel||"online");
  const tabs=data.menus.mega.tabs;
  return <nav className="mobile-menu-content"><div className="mobile-channel-tabs">{tabs.map(tab=><button type="button" key={tab.id} aria-pressed={mode===tab.id} onClick={()=>setMode(tab.id)}><RichText value={menuText(tab.label,language)}/></button>)}</div>{categoryMenu(catalogData||data,menu.categories,language,mode).map(c=><details key={c.id}><summary><RichText value={c.name}/><Icon name="chevron" size={20}/></summary><a href={local(c.url)} data-menu-channel={mode}><RichText value={menuText(menu.allCategoryLabel,language).replace('{name}',c.name)}/></a>{c.children.map(s=><a key={s.id} href={local(s.url)} data-menu-channel={mode}><RichText value={s.name}/></a>)}</details>)}<MenuItems items={menu.links}/></nav>;
}
