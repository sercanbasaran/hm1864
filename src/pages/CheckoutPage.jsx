import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { useText } from '../hooks/useText.js';
import { usePrice } from '../hooks/usePrice.js';
import { totals } from '../commerce.js';
import DemoNotice from '../components/commerce/DemoNotice.jsx';
import OrderSummary from '../components/commerce/OrderSummary.jsx';
import DeliveryForm from '../components/commerce/DeliveryForm.jsx';
import ShippingOptions from '../components/commerce/ShippingOptions.jsx';
import PaymentForm from '../components/commerce/PaymentForm.jsx';
export default function CheckoutPage() {
  const { commerce, preferences, setModal, goTo } = useApp(), t = useText(), { currency } = usePrice();
  const [step, setStep] = useState(0), [method, setMethod] = useState('standard');
  const [address, setAddress] = useState(() => ({ name: commerce.user?.name || '', email: commerce.user?.email || '', country: preferences?.country || 'TR', billingSame: true }));
  useEffect(() => setStep(0), [currency, commerce.items]);
  useEffect(() => { if (commerce.user) setAddress(previous => ({ ...previous, name: previous.name || commerce.user.name, email: previous.email || commerce.user.email })); }, [commerce.user]);
  const amount = totals(commerce.rows, method, currency);
  const finish = () => {
    if (!amount.valid) return;
    commerce.completeOrder({ currency, amount: { subtotal: amount.subtotal, shipping: amount.shipping, total: amount.total }, method, address: { ...address },
      lines: commerce.rows.map(row => ({ key: row.key, variant: row.variant, quantity: row.quantity, name: row.product.name, label: row.selected.label || row.variant, total: row.total })) });
    goTo('/siparis/sonuc.html');
  };
  return <section className="commerce-page"><h1>{t('commerce.checkout')}</h1><DemoNotice />
    {!commerce.rows.length ? <div className="commerce-empty"><p>{t('commerce.empty')}</p><a className="button" href="/urunler/index.html">{t('commerce.shop')}</a></div> : <>
      <ol className="commerce-steps">{['delivery','shippingStep','payment'].map((key, index) => <li key={key} aria-current={step === index ? 'step' : undefined}><span>{index + 1}</span>{t('commerce.' + key)}</li>)}</ol>
      <div className="commerce-layout"><div>
        <p className="commerce-guest">{commerce.user ? `${t('commerce.welcome')}, ${commerce.user.name}` : <>{t('commerce.guest')} <button type="button" className="commerce-text-button" onClick={() => setModal('profile')}>{t('commerce.login')}</button></>}</p>
        {step === 0 && <DeliveryForm value={address} onChange={setAddress} onContinue={() => setStep(1)} />}
        {step > 0 && <div className="commerce-address-review"><strong>{address.name}</strong><p>{address.address}, {address.district}, {address.city} · {address.postal}</p><small>{address.email} · {address.phone}</small><button type="button" className="commerce-text-button" onClick={() => setStep(0)}>{t('commerce.edit')}</button></div>}
        {step === 1 && <ShippingOptions selected={method} onSelect={setMethod} onContinue={() => setStep(2)} onBack={() => setStep(0)} />}
        {step === 2 && <PaymentForm disabled={!amount.valid} onApprove={finish} onBack={() => setStep(1)} />}
      </div><OrderSummary method={method} /></div>
    </>}
  </section>;
}
