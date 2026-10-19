import React from 'react';
import { useApp } from '../context/AppContext.jsx';
import { useText } from '../hooks/useText.js';
import { usePrice } from '../hooks/usePrice.js';
import { money } from '../model.js';
import { plainText } from '../formatted-text.js';
import DemoNotice from '../components/commerce/DemoNotice.jsx';
export function OrderReceipt({ order }) {
  const t = useText(), { language } = usePrice();
  return <article className="commerce-receipt"><h2>{t('commerce.orderNumber')}: {order.id}</h2><ul>{order.lines.map(line => <li key={line.key + line.variant}>{plainText(line.name)} · {plainText(line.label)} × {line.quantity}<strong>{money(line.total, order.currency, '', language)}</strong></li>)}</ul><p>{t('commerce.shippingStep')}: {t('commerce.' + order.method)}</p><p>{t('commerce.total')}: <strong>{money(order.amount.total, order.currency, '', language)}</strong></p></article>;
}
export default function OrderResultPage() {
  const { commerce } = useApp(), t = useText(), order = commerce.orders[0];
  return <section className="commerce-page commerce-result"><h1>{t('commerce.' + (order ? 'success' : 'noOrder'))}</h1><DemoNotice />{order && <><p>{t('commerce.successNote')}</p><OrderReceipt order={order} /></>}<a className="button" href="/urunler/index.html">{t('commerce.shop')}</a></section>;
}
