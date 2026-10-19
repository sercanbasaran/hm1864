import FavoriteButton from "./FavoriteButton.jsx";
import Icon from "../Icon.jsx";
import React, { useState } from "react";
import { useText } from "../../hooks/useText.js";
import { usePrice } from "../../hooks/usePrice.js";
import { local } from "../../utils/urls.js";
import RichText from "../../RichText.jsx";
import Media from "../Media.jsx";
import { cardPrice, choice, imageUrl, money, validPrice } from "../../model.js";
import { plainText } from "../../formatted-text.js";
import { useApp } from "../../context/AppContext.jsx";
import { productCardContent, isOnlineSaleUnavailable } from "../../utils/product-card-content.js";

export default function Card({ product: p }) {
  const t = useText(),
    { currency, language, missing } = usePrice();
  const { content, commerce, setModal } = useApp();
  const [selection, setSelection] = useState(null);
  const defaultCode = p.variants.reduce((best, variant) => {
    const option = choice(p, variant.code, currency);
    const quantity = commerce?.items.find(item => item.key === p.key && item.variant === variant.code)?.quantity || 0;
    if (option.onlineSale === false || !validPrice(option.price) || quantity >= 99 || (option.stock != null && option.stock <= quantity)) return best;
    return best === null || option.price < choice(p, best, currency).price ? variant.code : best;
  }, null);
  const selectedCode = selection?.productKey === p.key && p.variants.some(variant => variant.code === selection.code) ? selection.code : defaultCode;
  const cartCode = selectedCode ?? (p.variants.length === 1 ? p.variants[0].code : p.variants.length === 0 ? '' : null);
  const cartChoice = cartCode === null ? null : choice(p, cartCode, currency);
  const cartQuantity = commerce?.items.find(item => item.key === p.key && item.variant === cartCode)?.quantity || 0;
  const canAdd = !!cartChoice && cartChoice.onlineSale !== false && validPrice(cartChoice.price)
    && cartQuantity < 99 && (cartChoice.stock == null || cartChoice.stock > cartQuantity);
  const selected = selectedCode === null ? null : choice(p, selectedCode, currency);
  const placeholders = ["ui.copy.039", "ui.copy.043", "ui.infoPending"].flatMap(key => Object.values(content.texts[key] || {}));
  const { description, variants } = productCardContent(p, placeholders, count => t("ui.sliceCount", {count}));
  return (
    <article className="product-card">
      <FavoriteButton product={p} compact />
      <a className="product-picture" href={local(p.url)}>
        <Media src={imageUrl(p.images[0])} alt={p.name} />
      </a>
      <small className="muted">
        <RichText value={t("ui.productCode")} /> {p.code}
      </small>
      <div className="product-card-body">
        <h3>
          <a href={local(p.url)}>
            <RichText value={p.name} />
          </a>
        </h3>
        {description && <p className="card-description" dir="auto"><RichText value={description} /></p>}
        {variants.length > 0 && <div className="card-variant-options">
          <p className="card-variants-title"><RichText value={t("ui.portionOptions")} /></p>
          <ul className="card-variants" aria-label={plainText(t("ui.portionOptions"))}>
          {variants.map(variant => <li key={variant.code}>
            <button type="button" className="card-variant-label"
              aria-label={plainText([variant.label, ...variant.dimensions].join(" · "))}
              aria-pressed={selectedCode === variant.code}
              onClick={() => setSelection({ productKey: p.key, code: variant.code })}>
              <span className="card-variant-size"><RichText value={variant.dimensions.length ? variant.dimensions.join(" · ") : variant.label} /></span>
            </button>
            {variant.description && <p className="card-variant-description" dir="auto"><RichText value={variant.description} /></p>}
          </li>)}
          </ul>
        </div>}
        {(selected ? selected.onlineSale === false : isOnlineSaleUnavailable(p)) && <p className="card-store-only" dir="auto"><Icon name="info" size={16} /> <RichText value={t("ui.cardStoreOnly")} /></p>}
        <div className="card-meta" aria-live="polite" aria-atomic="true">
          <span>{selected ? money(selected.price, currency, missing, language) : cardPrice(p, missing, t("ui.from"), currency, language)}</span>
        </div>
        <div className="card-actions">
          {cartCode === null && !isOnlineSaleUnavailable(p) && <p className="card-cart-hint"><RichText value={t("commerce.chooseVariant")} /></p>}
          <button type="button" className="button card-add-to-cart" disabled={!canAdd}
            onClick={() => { if (canAdd && commerce.addToCart(p, cartCode, 1)) setModal('cart'); }}>
            <RichText value={t("commerce.add")} />
          </button>
          <a className="button card-view-product" href={local(p.url)}>
            <RichText value={t("template.0127")} />
          </a>
        </div>
      </div>
    </article>
  );
}
