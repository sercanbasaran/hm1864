import React, { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { useText } from "../../hooks/useText.js";
import { descendants } from "../../utils/templates.js";
import RichText from "../../RichText.jsx";
import templates from "../../templates/index.js";
import Template from "../templates/TemplateRenderer.jsx";
import { match } from "../../model.js";

export default function StoreLocator({ embedded = false }) {
  const { preferences } = useApp(),
    t = useText();
  const Heading = embedded ? "h2" : "h1";
  const allCards = descendants(templates.stores, (n) =>
    (n.attrs.class || "").split(" ").includes("store-card"),
  );
  const countries = [...new Set(allCards.map((n) => n.attrs["data-country"]))];
  const [country, setCountry] = useState(
    countries.includes(preferences?.country)
      ? preferences.country
      : countries[0],
  );
  const [query, setQuery] = useState("");
  const cards = allCards.filter(
    (n) =>
      n.attrs["data-country"] === country &&
      match({ name: n.attrs["data-store-name"] }, query),
  );
  return (
    <section className="store-locator">
      <div className="map-panel">
        <div className="map-placeholder">
          <h2>
            <RichText value={t("template.0167")} />
          </h2>
          <p>
            <RichText value={t("template.0168")} />
          </p>
        </div>
      </div>
      <div className="store-list">
        <Heading>
          <RichText value={t("template.0170")} />
        </Heading>
        <label>
          <RichText value={t("ui.copy.009")} />
          <select
            name="store-country"
            value={country}
            onChange={(e) => {
              setCountry(e.target.value);
              setQuery("");
            }}
          >
            {countries.map((code) => (
              <option key={code} value={code}>
                {t("region.country." + code)}
              </option>
            ))}
          </select>
        </label>
        <label>
          <RichText value={t("ui.copy.010")} />
          <input
            name="store-query"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <p role="status">{t("ui.countStores", { count: cards.length })}</p>
        <div className="store-results">
          {cards.map((c, i) => (
            <Template node={c} key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
