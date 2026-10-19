import React from 'react';
import { useApp } from '../context/AppContext.jsx';
import { useText } from '../hooks/useText.js';
import RichText from '../RichText.jsx';
import Card from '../components/products/ProductCard.jsx';
export default function FavoritesPage() {
  const { data, favorites } = useApp(), t = useText();
  const products = favorites.keys.map(key => data.products.find(product => product.key === key)).filter(Boolean);
  return <section className="favorites-page product-section">
    <h1><RichText value={t('favorites.title')} /></h1>
    <p className="muted"><RichText value={t('favorites.localNotice')} /></p>
    <p role="status"><RichText value={t(products.length ? 'favorites.count' : 'favorites.empty', { count: products.length })} /></p>
    {products.length ? <div className="product-grid">{products.map(product => <Card key={product.key} product={product} />)}</div>
      : <a className="button" href="/urunler/baklavalar/index.html"><RichText value={t('commerce.shop')} /></a>}
  </section>;
}
