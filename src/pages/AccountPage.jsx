import React from 'react';
import { useApp } from '../context/AppContext.jsx';
import { useText } from '../hooks/useText.js';
import AuthForm from '../components/commerce/AuthForm.jsx';
import DemoNotice from '../components/commerce/DemoNotice.jsx';
import { OrderReceipt } from './OrderResultPage.jsx';
export default function AccountPage({ mode = 'login' }) {
  const { commerce } = useApp(), t = useText();
  const orders = commerce.orders.filter(order => order.address.email.toLowerCase() === commerce.user?.email);
  return <section className="commerce-page commerce-account"><h1>{t('commerce.' + (commerce.user ? 'account' : mode === 'reset' ? 'forgot' : mode))}</h1><DemoNotice /><AuthForm initialMode={mode} />
    {commerce.user && <section><h2>{t('commerce.orders')}</h2><p className="muted">{t('commerce.accountDemo')}</p>{orders.length ? orders.map(order => <OrderReceipt key={order.id} order={order} />) : <p>{t('commerce.noOrder')}</p>}</section>}
  </section>;
}
