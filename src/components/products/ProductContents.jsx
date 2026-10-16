import React from 'react';
import Icon from '../Icon.jsx';
import Media from '../Media.jsx';
import RichText from '../../RichText.jsx';
import {imageUrl} from '../../model.js';
export default function ProductContents({boxRows,packageRows,t}){
  const quantity=row=>row.quantity==null?<span aria-label={t('ui.quantityUnspecified')}>—</span>:<RichText value={row.quantity}/>;
  return <>
    {boxRows.length>0&&<details className="box-contents" key="box">
      <summary><RichText value={t('ui.boxContents')}/><Icon name="chevron" className="disclosure-icon" size={18}/></summary>
      <div className="product-contents-wrap"><table className="product-contents-table">
        <caption className="sr-only">{t('ui.boxContents')}</caption>
        <thead><tr><th scope="col">{t('ui.contentsImage')}</th><th scope="col">{t('ui.contentsProduct')}</th><th scope="col">{t('ui.contentsQuantity')}</th></tr></thead>
        <tbody>{boxRows.map(row=><tr key={row.id}><td><Media src={imageUrl(row.image)} alt={row.name} className="contents-thumbnail"/></td><th scope="row"><RichText value={row.name}/></th><td>{quantity(row)}</td></tr>)}</tbody>
      </table></div>
    </details>}
    {packageRows.length>0&&<details className="shipping-package-contents" key="package">
      <summary><RichText value={t('ui.shippingPackageContents')}/><Icon name="chevron" className="disclosure-icon" size={18}/></summary>
      <div className="product-contents-wrap"><table className="product-contents-table package-contents-table">
        <caption className="sr-only">{t('ui.shippingPackageContents')}</caption>
        <thead><tr><th scope="col">{t('ui.contentsProduct')}</th><th scope="col">{t('ui.contentsQuantity')}</th></tr></thead>
        <tbody>{packageRows.map(row=><tr key={row.id}><th scope="row"><RichText value={row.name}/></th><td>{quantity(row)}</td></tr>)}</tbody>
      </table></div>
    </details>}
  </>;
}
