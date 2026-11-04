import React, { useEffect, useState } from 'react';
import { useText } from '../../hooks/useText.js';
import { countdownParts } from '../../utils/countdown.js';

export default function SelectionCountdown() {
  const t = useText();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const parts = countdownParts(now);
  return <div className="selection-countdown" role="timer" aria-label={t('home.countdown.title')}>
    <p className="selection-countdown-title">{t('home.countdown.title')}</p>
    <div className="selection-countdown-values" dir="ltr">
      {['days', 'hours', 'minutes', 'seconds'].map(key => <div className="selection-countdown-unit" key={key}>
        <span className="selection-countdown-number">{String(parts[key]).padStart(2, '0')}</span>
        <span className="selection-countdown-label" dir="auto">{t('home.countdown.' + key)}</span>
      </div>)}
    </div>
  </div>;
}
