import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { useText } from '../../hooks/useText.js';
export default function AuthForm({ initialMode = 'login', onSuccess }) {
  const { commerce } = useApp(), t = useText();
  const [mode, setMode] = useState(initialMode), [show, setShow] = useState(false), [status, setStatus] = useState('');
  const [fields, setFields] = useState({ name: '', email: '', password: '', confirm: '' });
  const change = (key, value) => setFields(previous => ({ ...previous, [key]: value }));
  const switchMode = mode => { setMode(mode); setStatus(''); setFields(previous => ({ ...previous, password: '', confirm: '' })); };
  const submit = event => {
    event.preventDefault();
    if (mode === 'reset') { setStatus('resetSent'); return; }
    if (mode === 'register' && fields.password !== fields.confirm) { setStatus('passwordMismatch'); return; }
    const error = mode === 'register' ? commerce.register(fields) : commerce.login(fields);
    setStatus(error || 'signedIn');
    if (!error) { setFields({ name: '', email: '', password: '', confirm: '' }); onSuccess?.(); }
  };
  if (commerce.user) return <div className="commerce-account-status"><h3>{t('commerce.welcome')}, {commerce.user.name}</h3><p>{commerce.user.email}</p><a className="button" href="/hesabim/index.html">{t('commerce.viewAccount')}</a><button type="button" className="commerce-text-button" onClick={commerce.logout}>{t('commerce.logout')}</button></div>;
  return <div className="commerce-auth">
    <div className="commerce-auth-tabs"><button type="button" aria-pressed={mode === 'login'} onClick={() => switchMode('login')}>{t('commerce.login')}</button><button type="button" aria-pressed={mode === 'register'} onClick={() => switchMode('register')}>{t('commerce.register')}</button></div>
    <p className="muted">{t('commerce.accountDemo')}</p>
    <form onSubmit={submit}>
      {mode === 'register' && <label>{t('commerce.name')}<input name="fullName" required minLength={2} autoComplete="name" value={fields.name} onChange={e => change('name', e.target.value)} /></label>}
      <label>{t('commerce.email')}<input name="email" type="email" required autoComplete="email" value={fields.email} onChange={e => change('email', e.target.value)} /></label>
      {mode !== 'reset' && <><label>{t('commerce.password')}<input name="password" type={show ? 'text' : 'password'} required minLength={8} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} value={fields.password} onChange={e => change('password', e.target.value)} /></label>
        <button className="commerce-text-button" type="button" aria-pressed={show} onClick={() => setShow(!show)}>{t('commerce.' + (show ? 'hide' : 'show'))}</button></>}
      {mode === 'register' && <><label>{t('commerce.confirmPassword')}<input name="confirmPassword" type={show ? 'text' : 'password'} required minLength={8} autoComplete="new-password" value={fields.confirm} onChange={e => change('confirm', e.target.value)} /></label><small>{t('commerce.passwordHelp')}</small><label className="commerce-checkbox"><input type="checkbox" required />{t('commerce.accountConsent')}</label></>}
      {status && <p role={status === 'resetSent' || status === 'signedIn' ? 'status' : 'alert'} className="commerce-error">{t('commerce.' + status)}</p>}
      <button className="button" type="submit">{t('commerce.' + (mode === 'reset' ? 'reset' : mode))}</button>
      {mode === 'login' && <><button type="button" className="commerce-text-button" onClick={() => switchMode('reset')}>{t('commerce.forgot')}</button><p className="muted">{t('commerce.demoCredentials')}</p><button type="button" className="commerce-text-button" onClick={() => setFields({ name: '', email: 'demo@hm1864.com', password: 'Demo1864!', confirm: '' })}>{t('commerce.fillLogin')}</button></>}
    </form>
  </div>;
}
