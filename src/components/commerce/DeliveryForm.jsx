import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { useText } from '../../hooks/useText.js';
export default function DeliveryForm({ value, onChange, onContinue }) {
  const t = useText(), { regions } = useApp();
  const [error, setError] = useState(false);
  const field = (key, props = {}) => <label key={key}>{t('commerce.' + key)}<input name={key} value={value[key] || ''} required maxLength={key === 'address' ? 250 : 100} onChange={event => onChange({ ...value, [key]: event.target.value })} {...props} /></label>;
  return <form className="commerce-form" onSubmit={event => { event.preventDefault(); const fields = ['name','email','phone','city','district','address','postal', ...(!value.billingSame ? ['billingAddress','billingCity','billingPostal'] : [])]; if (fields.some(key => !value[key]?.trim()) || value.name.trim().length < 2 || value.address.trim().length < 8) { setError(true); return; } setError(false); onContinue(); }}>
    <h2>{t('commerce.delivery')}</h2><div className="commerce-form-grid">
      {field('name', { autoComplete: 'name', minLength: 2 })}{field('email', { type: 'email', autoComplete: 'email' })}
      {field('phone', { type: 'tel', autoComplete: 'tel', pattern: '[+0-9 ]{7,20}' })}
      <label>{t('commerce.country')}<select name="country" required value={value.country} onChange={event => onChange({ ...value, country: event.target.value })}>{regions.countries.map(country => <option key={country.code} value={country.code}>{t('region.country.' + country.code)}</option>)}</select></label>
      {field('city', { autoComplete: 'address-level2', minLength: 2 })}{field('district', { autoComplete: 'address-level3', minLength: 2 })}
      {field('address', { autoComplete: 'street-address', minLength: 8 })}{field('postal', { autoComplete: 'postal-code', minLength: 3, maxLength: 12 })}
    </div><label>{t('commerce.note')}<textarea name="note" maxLength={500} value={value.note || ''} onChange={event => onChange({ ...value, note: event.target.value })} /></label>
    <label className="commerce-checkbox"><input type="checkbox" name="billingSame" checked={value.billingSame} onChange={event => onChange({ ...value, billingSame: event.target.checked })} />{t('commerce.billingSame')}</label>
    {!value.billingSame && <fieldset className="commerce-billing"><legend>{t('commerce.billing')}</legend>{[['billingAddress','address'],['billingCity','city'],['billingPostal','postal']].map(([key,label]) => <label key={key}>{t('commerce.' + label)}<input name={key} required minLength={3} maxLength={250} value={value[key] || ''} onChange={event => onChange({ ...value, [key]: event.target.value })} /></label>)}</fieldset>}
    {error && <p role="alert" className="commerce-error">{t('commerce.deliveryError')}</p>}
    <button className="button" type="submit">{t('commerce.next')}</button>
  </form>;
}
