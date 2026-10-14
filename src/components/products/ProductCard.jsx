import React from "react";
import { useText } from "../../hooks/useText.js";
import { usePrice } from "../../hooks/usePrice.js";
import { local } from "../../utils/urls.js";
import RichText from "../../RichText.jsx";
import Media from "../Media.jsx";
import { cardPrice, imageUrl } from "../../model.js";
import { useApp } from "../../context/AppContext.jsx";
import { productCardContent, isOnlineSaleUnavailable } from "../../utils/product-card-content.js";

export default function Card({ product: p }) {
  const t = useText(),
    { currency, language, missing } = usePrice();
  const { content } = useApp();
  const placeholders = ["ui.copy.039", "ui.copy.043", "ui.infoPending"].flatMap(key => Object.values(content.texts[key] || {}));
  const { description, variants } = productCardContent(p, placeholders);
  return (
    <article className="product-card">
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
        {variants.length > 0 && <ul className="card-variants" aria-label={t("ui.availableVariants")}>
          {variants.map(variant => <li key={variant.code}>
            <span className="card-variant-label">{/* <RichText value={variant.label} /> */}
              {variant.dimensions.length > 0 && <span className="card-variant-size"> <RichText value={variant.dimensions.join(" · ")} /></span>}
            </span>
            {variant.description && <p className="card-variant-description" dir="auto"><RichText value={variant.description} /></p>}
          </li>)}
        </ul>}
        {isOnlineSaleUnavailable(p) && <p className="card-store-only" dir="auto"><RichText value={t("ui.cardStoreOnly")} /></p>}
        <div className="card-meta">
          <span>{cardPrice(p, missing, t("ui.from"), currency, language)}</span>
        </div>
        <a className="button" href={local(p.url)}>
          <RichText value={t("template.0127")} />
        </a>
      </div>
    </article>
  );
}
