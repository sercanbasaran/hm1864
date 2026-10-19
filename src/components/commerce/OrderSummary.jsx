import React from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { usePrice } from '../../hooks/usePrice.js';
import { useText } from '../../hooks/useText.js';
import { money } from '../../model.js';
import { totals } from '../../commerce.js';
import CartItems from './CartItems.jsx';
export default function OrderSummary({ method = 'standard', shipping = true, children }) {
  const { commerce } = useApp(), { currency, language, missing } = usePrice(), t = useText();
  const amount = totals(commerce.rows, method, currency), format = value => money(value, currency, missing, language);
  return <aside className="commerce-summary"><h2>{t('commerce.summary')}</h2><CartItems />
    <dl><div><dt>{t('commerce.subtotal')}</dt><dd>{format(amount.subtotal)}</dd></div>
      {shipping && <div><dt>{t('commerce.shipping')}</dt><dd>{format(amount.shipping)}</dd></div>}
      <div className="commerce-total"><dt>{t('commerce.total')}</dt><dd>{format(shipping ? amount.total : amount.subtotal)}</dd></div></dl>
    {!shipping && <p className="muted">{t('commerce.shippingLater')}</p>}{children}
  </aside>;
}
