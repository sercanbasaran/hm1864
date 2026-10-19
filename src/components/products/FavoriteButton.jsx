import React from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { useText } from '../../hooks/useText.js';
import { plainText } from '../../formatted-text.js';
import Icon from '../Icon.jsx';
import RichText from '../../RichText.jsx';
export default function FavoriteButton({ product, compact = false }) {
  const { favorites } = useApp(), t = useText();
  const active = favorites?.keys.includes(product.key) || false;
  const label = t(active ? 'favorites.remove' : 'favorites.add');
  return <button type="button" className={'favorite-button' + (compact ? ' favorite-compact' : '')}
    aria-pressed={active} aria-label={plainText(label) + ': ' + plainText(product.name)} title={plainText(label)}
    onClick={() => favorites?.toggle(product.key)}>
    <Icon name="heart" weight={active ? 'fill' : 'regular'} size={22} />
    {!compact && <RichText value={label} />}
  </button>;
}
