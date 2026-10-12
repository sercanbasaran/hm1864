import React from 'react';
import {parseFormattedText} from './formatted-text.js';

export default function RichText({value}){
  const render=(nodes,prefix='text')=>nodes.map((node,i)=>'text'in node?node.text:React.createElement(node.tag,{key:prefix+'-'+i},node.tag==='br'?undefined:render(node.children,prefix+'-'+i)));
  return <>{render(parseFormattedText(value))}</>;
}
