import React from "react";
import { useText } from "../../hooks/useText.js";
import { usePrice } from "../../hooks/usePrice.js";
import { local } from "../../utils/urls.js";
import RichText from "../../RichText.jsx";
import Media from "../Media.jsx";
import { cardPrice, imageUrl } from "../../model.js";

export default function Card({ product: p }) {
  const t = useText(),
    { currency, language, missing } = usePrice();
  return (
    <article className="product-card">
      <a className="product-picture" href={local(p.url)}>
        <Media src={imageUrl(p.images[0])} alt={p.name} />
      </a>
      <div className="product-card-body">
        <h3>
          <a href={local(p.url)}>
            <RichText value={p.name} />
          </a>
        </h3>
        {p.description && (\n          <p className="product-card-description">\n            <RichText value={p.description} />\n          </p>\n        )}\n        {p.variants?.length > 0 && (\n          <ul className="product-card-variants" aria-label={t("ui.copy.004")}>\n            {p.variants.map((variant) => (\n              <li key={variant.code}>\n                <RichText value={variant.label || variant.code} />\n                {variant.description && variant.description !== p.description && (\n                  <span className="product-card-variant-description">\n                    <RichText value={variant.description} />\n                  </span>\n                )}\n              </li>\n            ))}\n          </ul>\n        )}\n        <p className="muted">
          <RichText value={t("ui.productCode")} /> {p.code}
        </p>
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
