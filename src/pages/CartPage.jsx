import React from 'react';
import { useApp } from '../context/AppContext.jsx';
import { useText } from '../hooks/useText.js';
import DemoNotice from '../components/commerce/DemoNotice.jsx';
import CartItems from '../components/commerce/CartItems.jsx';
import OrderSummary from '../components/commerce/OrderSummary.jsx';
export default function CartPage() {
  const { commerce } = useApp(), t = useText();
  return <section className="commerce-page"><h1>{t('commerce.cart')}</h1><DemoNotice />
    {!commerce.rows.length ? <div className="commerce-empty"><p>{t('commerce.empty')}</p><a className="button" href="/urunler/index.html">{t('commerce.shop')}</a></div> : <div className="commerce-layout"><div><CartItems editable /><a href="/urunler/index.html">{t('commerce.shop')}</a></div><OrderSummary shipping={false}>
      {commerce.rows.every(row => row.available) ? <a className="button" href="/odeme/index.html">{t('commerce.checkout')}</a> : <p role="alert" className="commerce-error">{t('commerce.paymentDisabled')}</p>}
    </OrderSummary></div>}
  </section>;
}
