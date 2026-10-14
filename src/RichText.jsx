import React from 'react';
import {parseFormattedText} from './formatted-text.js';
import {lhfDisplayText} from './utils/lhf-text.js';

export default function RichText({value, lhf=false}){
  const render=(nodes,prefix='text')=>nodes.map((node,i)=>'text'in node?(lhf?lhfDisplayText(node.text):node.text):React.createElement(node.tag,{key:prefix+'-'+i},node.tag==='br'?undefined:render(node.children,prefix+'-'+i)));
  return <>{render(parseFormattedText(value))}</>;
}
