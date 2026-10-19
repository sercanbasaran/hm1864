import React, { useEffect, useRef, useState } from 'react';
import { DEMO_CARDS, validateDemoCard } from '../../commerce.js';
import { useText } from '../../hooks/useText.js';
const blank = { holder: '', number: '', expiry: '', cvc: '' };
export default function PaymentForm({ onApprove, onBack, disabled }) {
  const t = useText(), [card, setCard] = useState(blank), [error, setError] = useState(''), [busy, setBusy] = useState(false);
  const timer = useRef();
  useEffect(() => () => clearTimeout(timer.current), []);
  const fill = kind => { setError(''); setCard({ holder: 'DEMO USER', number: DEMO_CARDS[kind].replace(/(.{4})(?=.)/g, '$1 '), expiry: '12/' + String(new Date().getFullYear() + 2).slice(-2), cvc: '123' }); };
  const submit = event => {
    event.preventDefault(); if (busy || disabled) return;
    const issue = validateDemoCard(card);
    if (issue) { setError(issue); setCard(previous => ({ ...previous, cvc: '' })); return; }
    setError(''); setBusy(true);
    timer.current = setTimeout(() => { setCard(blank); setBusy(false); onApprove(); }, 650);
  };
  return <form className="commerce-form" onSubmit={submit} autoComplete="off" aria-busy={busy}>
    <h2>{t('commerce.payment')}</h2><p>{t('commerce.testCardHelp')}</p>
    <fieldset disabled={busy || disabled} className="commerce-card-fields">
      <div className="commerce-demo-card"><span>HM 1864 · DEMO</span><strong>{card.number || '•••• •••• •••• ••••'}</strong><small>{card.holder || 'DEMO USER'} · {card.expiry || 'AA/YY'}</small></div>
      <div className="commerce-actions"><button type="button" className="commerce-text-button" onClick={() => fill('approved')}>{t('commerce.fillCard')}</button><button type="button" className="commerce-text-button" onClick={() => fill('declined')}>{t('commerce.fillDeclined')}</button></div>
      <label>{t('commerce.cardHolder')}<input name="demoCardholder" required maxLength={80} value={card.holder} onChange={event => setCard({ ...card, holder: event.target.value })} autoComplete="off" /></label>
      <label>{t('commerce.cardNumber')}<input name="demoCardNumber" required inputMode="numeric" maxLength={19} value={card.number} onChange={event => setCard({ ...card, number: event.target.value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})(?=.)/g, '$1 ') })} autoComplete="off" /></label>
      <div className="commerce-form-grid"><label>{t('commerce.expiry')}<input name="demoExpiry" required inputMode="numeric" placeholder="12/30" maxLength={5} value={card.expiry} onChange={event => { const digits = event.target.value.replace(/\D/g, '').slice(0, 4); setCard({ ...card, expiry: digits.length > 2 ? digits.slice(0, 2) + '/' + digits.slice(2) : digits }); }} autoComplete="off" /></label>
        <label>{t('commerce.cvc')}<input name="demoCvc" required type="password" inputMode="numeric" maxLength={3} value={card.cvc} onChange={event => setCard({ ...card, cvc: event.target.value.replace(/\D/g, '').slice(0, 3) })} autoComplete="off" /></label></div>
      <label className="commerce-checkbox"><input name="demoAcknowledgement" type="checkbox" required />{t('commerce.acknowledge')}</label>
    </fieldset>
    {error && <p role="alert" className="commerce-error">{t('commerce.' + error)}</p>}
    {disabled && <p role="alert" className="commerce-error">{t('commerce.paymentDisabled')}</p>}
    <div className="commerce-actions"><button type="button" className="commerce-text-button" onClick={onBack} disabled={busy}>{t('commerce.back')}</button><button className="button" type="submit" disabled={busy || disabled}>{t('commerce.' + (busy ? 'processing' : 'pay'))}</button></div>
  </form>;
}
