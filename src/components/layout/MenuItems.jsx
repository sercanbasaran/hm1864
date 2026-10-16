import React from 'react';
import {useApp} from '../../context/AppContext.jsx';
import {local} from '../../utils/urls.js';
import {plainText} from '../../formatted-text.js';
import RichText from '../../RichText.jsx';
import Icon from '../Icon.jsx';
import {menuText,visibleItems} from '../../menus.js';
export default function MenuItems({items,onAction,onNavigate}){
  const {preferences,regions}=useApp();const language=preferences?.language||regions.defaultLanguage;
  return visibleItems(items).map(item=>{
    const label=menuText(item.label,language),children=<>{item.icon&&<Icon name={item.icon}/>}{!item.action&&<RichText value={label}/>}</>;
    return item.action?<button key={item.id} className={item.className} aria-label={plainText(label)} onClick={()=>onAction?.(item.action)}>{children}</button>:<a key={item.id} className={item.className} href={local(item.url)} onClick={onNavigate}>{children}</a>;
  });
}
