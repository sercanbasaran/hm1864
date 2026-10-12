import React from "react";
import { useApp } from "../../context/AppContext.jsx";
import { useText } from "../../hooks/useText.js";
import RichText from "../../RichText.jsx";
import { usePrice } from "../../hooks/usePrice.js";
import { local } from "../../utils/urls.js";
import { plainText } from "../../formatted-text.js";
import { match, cardPrice, imageUrl } from "../../model.js";
import Media from "../Media.jsx";

export default function SearchContent({ query, setQuery }) {
  const { data } = useApp();
  const t = useText();
  const { currency, language, missing } = usePrice();
  const matches = data.products.filter((p) => match(p, query));
  return (
    <>
      <input
        autoFocus
        type="search"
        aria-label={plainText(t("ui.copy.036"))}
        placeholder={plainText(t("ui.copy.037"))}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <p role="status">{t("ui.countFound", { count: matches.length })}</p>
      <div>
        {matches.map((p) => (
          <article className="search-result" key={p.key}>
            <a href={local(p.url)}>
              <Media src={imageUrl(p.images[0])} alt={p.name} />
            </a>
            <a href={local(p.url)}>
              <h4>
                <RichText value={p.name} />
              </h4>
              <small>
                {cardPrice(p, missing, t("ui.from"), currency, language)}
              </small>
            </a>
            <a href={local(p.url)}>
              <RichText value={t("ui.copy.011")} />
            </a>
          </article>
        ))}
      </div>
    </>
  );
}
