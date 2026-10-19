import React from 'react';
import { shippingMethods } from '../../commerce.js';
import { money, validPrice } from '../../model.js';
import { usePrice } from '../../hooks/usePrice.js';
import { useText } from '../../hooks/useText.js';
export default function ShippingOptions({ selected, onSelect, onContinue, onBack }) {
  const t = useText(), { currency, language, missing } = usePrice();
  return <form className="commerce-form" onSubmit={event => { event.preventDefault(); onContinue(); }}><h2>{t('commerce.shippingStep')}</h2>
    <p className="muted">{t('commerce.shippingDemo')}</p><fieldset className="commerce-shipping"><legend className="sr-only">{t('commerce.shippingStep')}</legend>
      {shippingMethods.map(method => <label key={method.id} className={selected === method.id ? 'selected' : ''}>
        <input type="radio" name="shipping" value={method.id} checked={selected === method.id} disabled={!validPrice(method.fees[currency])} onChange={() => onSelect(method.id)} required />
        <span><strong>{t('commerce.' + method.title)}</strong><small>{t('commerce.' + method.detail)}</small></span>
        <strong>{money(method.fees[currency], currency, missing, language)}</strong>
      </label>)}
    </fieldset><div className="commerce-actions"><button type="button" className="commerce-text-button" onClick={onBack}>{t('commerce.back')}</button><button className="button" type="submit">{t('commerce.next')}</button></div>
  </form>;
}
