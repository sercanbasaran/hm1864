const displayText=(value,language)=>typeof value==='string'?value:value?.[language]||value?.tr||'';
export const validSliceCount=value=>value===null||value===undefined||Number.isInteger(value)&&value>=0||typeof value==='string'&&/^\d+(?:\/\d+)?$/.test(value);
export function resolveContents(items,products,language='tr'){
  return (items||[]).filter(item=>item.enabled!==false&&item.quantity!==0).map(item=>{
    const product=products.find(p=>p.key===item.productKey);
    return {...item,name:displayText(item.name,language)||product?.name||'',image:item.image||product?.sliceImage||''};
  }).filter(item=>item.name);
}
export function validateProductContents(data){
  const fail=path=>{throw Error('Ürün kutu/paket içeriği geçersiz: '+path)};
  const validImage=value=>typeof value==='string'&&(!value||!value.includes('..')&&!/[\\:?#]/.test(value)&&!value.startsWith('/'));
  for(const product of data.products){
    if(product.defaultVariant!==undefined&&!product.variants.some(v=>v.code===product.defaultVariant))fail(product.key+'/defaultVariant');
    if(product.quantityUnit!==undefined&&!['slice','portion'].includes(product.quantityUnit))fail(product.key+'/quantityUnit');
    if(product.sliceImage!==undefined&&!validImage(product.sliceImage))fail(product.key+'/sliceImage');
    for(const item of [product,...product.variants]){
      const path=product.key+'/'+(item===product?'product':item.code);
      if(!validSliceCount(item.sliceCount))fail(path+'/sliceCount');
      for(const field of ['boxContents','packageContents']){
        if(item[field]===undefined)continue;
        if(!Array.isArray(item[field]))fail(path+'/'+field);
        const ids=new Set();
        for(const row of item[field]){
          if(!row||!row.id||typeof row.id!=='string'||ids.has(row.id))fail(path+'/'+field+'/id');ids.add(row.id);
          if(row.enabled!==undefined&&typeof row.enabled!=='boolean')fail(path+'/'+field+'/enabled');
          if(row.productKey!==undefined&&!data.products.some(p=>p.key===row.productKey))fail(path+'/'+field+'/productKey');
          if(row.name!==undefined&&!(typeof row.name==='string'||row.name&&typeof row.name==='object'&&!Array.isArray(row.name)&&typeof row.name.tr==='string'&&Object.values(row.name).every(v=>typeof v==='string')))fail(path+'/'+field+'/name');
          if(!row.productKey&&!displayText(row.name,'tr').trim())fail(path+'/'+field+'/name');
          if(row.image!==undefined&&!validImage(row.image))fail(path+'/'+field+'/image');
          if(field==='boxContents'?!validSliceCount(row.quantity):row.quantity!==null&&(!Number.isInteger(row.quantity)||row.quantity<0))fail(path+'/'+field+'/quantity');
        }
      }
    }
  }
  return data;
}
