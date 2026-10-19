import React from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { usePrice } from '../../hooks/usePrice.js';
import { useText } from '../../hooks/useText.js';
import { money, imageUrl } from '../../model.js';
import { plainText } from '../../formatted-text.js';
import Media from '../Media.jsx';
export default function CartItems({ editable = false }) {
  const { commerce } = useApp(), { currency, language, missing } = usePrice(), t = useText();
  return <ul className="commerce-items">{commerce.rows.map(row => <li key={row.id} className="commerce-item">
    <Media src={imageUrl(row.selected?.images?.[0])} alt={row.product?.name || ''} />
    <div><a href={'/' + (row.product?.url || 'urunler/index.html')}>{plainText(row.product?.name || row.key)}</a>
      <small>{plainText(row.selected?.label || row.variant)} · {row.selected?.weight}</small>
      {!row.available && <p className="commerce-error" role="alert">{t('commerce.unavailable')}</p>}
      {editable ? <div className="commerce-item-controls"><label>{t('commerce.quantity')}<input type="number" min="1" max="99" value={row.quantity} onChange={event => { const quantity = Number(event.target.value); if (quantity >= 1) commerce.updateQuantity(row.id, quantity); }} /></label>
        <button type="button" className="commerce-text-button" onClick={() => commerce.updateQuantity(row.id, 0)}>{t('commerce.remove')}</button></div> : <small>{t('commerce.quantity')}: {row.quantity}</small>}
    </div><strong>{money(row.total, currency, missing, language)}</strong>
  </li>)}</ul>;
}
