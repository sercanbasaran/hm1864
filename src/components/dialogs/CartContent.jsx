import React from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { useText } from '../../hooks/useText.js';
import CartItems from '../commerce/CartItems.jsx';
import OrderSummary from '../commerce/OrderSummary.jsx';
import DemoNotice from '../commerce/DemoNotice.jsx';
export default function CartContent() {
  const { commerce } = useApp(), t = useText();
  return <div className="commerce-cart-dialog"><DemoNotice />{commerce.rows.length ? <><CartItems editable /><OrderSummary shipping={false} /><a className="button" href="/sepet/index.html">{t('commerce.cart')}</a>{commerce.rows.every(row => row.available) && <a className="button" href="/odeme/index.html">{t('commerce.checkout')}</a>}</> : <div className="empty-cart"><h3>{t('commerce.empty')}</h3><a className="button" href="/urunler/index.html">{t('commerce.shop')}</a></div>}</div>;
}
