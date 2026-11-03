import React, { useId } from 'react';
import { satietyRows } from '../../utils/product-satiety.js';

export default function ProductSatiety({ value, t }) {
  const titleId = useId();
  const rows = satietyRows(value);
  if (!rows.length) return null;

  return <section className="product-satiety" aria-labelledby={titleId} aria-live="polite">
    <h2 id={titleId}>{t('ui.satiety.title')}</h2>
    <dl>
      {rows.map((row, index) => <div className="product-satiety-row" key={row.ingredient + index}>
        <dt>{t('ui.satiety.ingredient.' + row.ingredient)}</dt>
        <dd>
          <span className="product-satiety-scale" aria-hidden="true">
            {[1, 2, 3, 4, 5].map(level => <span key={level} className={level <= row.level ? 'is-filled' : ''} />)}
          </span>
          <span className="product-satiety-value"><bdi dir="ltr">{row.level}/5</bdi> · {t('ui.satiety.level.' + row.level)}</span>
        </dd>
      </div>)}
    </dl>
  </section>;
}
