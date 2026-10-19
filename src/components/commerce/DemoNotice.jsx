import React from 'react';
import { useText } from '../../hooks/useText.js';
export default function DemoNotice() {
  const t = useText();
  return <p className="commerce-demo-notice"><strong>{t('commerce.demo')}</strong><br />{t('commerce.demoNotice')}</p>;
}
