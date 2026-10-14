import Icon from "../Icon.jsx";
import React, { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { local } from "../../utils/urls.js";
import { localizeStore, storeMaps, storeText } from "../../stores.js";
import StoreMap from "./StoreMap.jsx";
const normalize = (value) =>
  value
    .toLocaleLowerCase("tr")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i");
export default function StoreLocator({ embedded = false }) {
  const { data, preferences, regions } = useApp(),
    language = preferences?.language || regions.defaultLanguage;
  const text = (key, values) => storeText(data, language, key, values);
  const stores = (data.stores || []).map((s) => localizeStore(s, language)),
    countries = [...new Set(stores.map((s) => s.country))];
  const [country, setCountry] = useState(
    countries.includes(preferences?.country)
      ? preferences.country
      : countries[0],
  );
  const [query, setQuery] = useState(""),
    [selectedId, setSelectedId] = useState(null);
  const cards = stores.filter(
      (s) =>
        s.country === country &&
        normalize(`${s.name} ${s.address}`).includes(normalize(query.trim())),
    ),
    selected = cards.find((s) => s.id === selectedId) || cards[0];
  const Heading = embedded ? "h2" : "h1";
  return (
    <section className="store-locator">
      <div className="map-panel">
        {selected ? (
          <>
            <StoreMap store={selected} language={language} />
            <div className="store-map-caption">
              <h2>{selected.name}</h2>
              <a
                href={storeMaps(selected, language).directions}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon name="directions" size={18} /> {text("directions")}
              </a>
            </div>
          </>
        ) : (
          <p className="map-placeholder">{text("empty")}</p>
        )}
      </div>
      <div className="store-list">
        <Heading>{text("title")}</Heading>
        <label>
          {text("country")}
          <select
            name="store-country"
            value={country}
            onChange={(e) => {
              setCountry(e.target.value);
              setQuery("");
              setSelectedId(null);
            }}
          >
            {countries.map((code) => (
              <option key={code} value={code}>
                {text("country" + code)}
              </option>
            ))}
          </select>
        </label>
        <label>
          {text("search")}
          <input
            name="store-query"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <p role="status">{text("count", { count: cards.length })}</p>
        <div className="store-results">
          {cards.map((s) => (
            <article
              className={
                "store-card" + (selected?.id === s.id ? " selected" : "")
              }
              key={s.id}
            >
              <h2>{s.name}</h2>
              <p>{s.address}</p>
              {s.phone && (
                <p>
                  <a href={"tel:" + s.phone.replace(/\s/g, "")} dir="ltr">
                    <Icon name="phone" size={16} /> {s.phone}
                  </a>
                </p>
              )}
              {s.hours && <p><Icon name="clock" size={16} /> {s.hours}</p>}
              <div className="store-actions">
                <button
                  type="button"
                  aria-pressed={selected?.id === s.id}
                  onClick={() => setSelectedId(s.id)}
                >
                  <Icon name="pin" size={18} /> {text("showMap")}
                </button>
                <a href={local(s.url)}>{text("details")}</a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
