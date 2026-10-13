import React from "react";
import { useApp } from "../context/AppContext.jsx";
import { local } from "../utils/urls.js";
import { localizeStore, storeMaps, storeText } from "../stores.js";
import StoreMap from "../components/stores/StoreMap.jsx";
export default function StoreDetailPage({ store: source }) {
  const { data, preferences, regions } = useApp(),
    language = preferences?.language || regions.defaultLanguage;
  const store = localizeStore(source, language),
    text = (key) => storeText(data, language, key);
  return (
    <section className="store-detail">
      <h1>{store.name}</h1>
      <div className="store-detail-grid">
        <div>
          {store.image && (
            <img
              className="store-photo"
              src={local(store.image)}
              alt={store.name}
            />
          )}
          <dl>
            <dt>{text("address")}</dt>
            <dd>{store.address}</dd>
            {store.phone && (
              <>
                <dt>{text("phone")}</dt>
                <dd>
                  <a href={"tel:" + store.phone.replace(/\s/g, "")} dir="ltr">
                    {store.phone}
                  </a>
                </dd>
              </>
            )}
            <dt>{text("hours")}</dt>
            <dd>{store.hours}</dd>
          </dl>
          {store.products.length > 0 && (
            <>
              <h2>{text("products")}</h2>
              <ul className="store-tags">
                {store.products.map((key) => (
                  <li key={key}>{text(key)}</li>
                ))}
              </ul>
            </>
          )}
          {store.features.length > 0 && (
            <>
              <h2>{text("features")}</h2>
              <ul>
                {store.features.map((key) => (
                  <li key={key}>{text(key)}</li>
                ))}
                {store.deliveryPlatforms.map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            </>
          )}
          <div className="store-actions">
            <a
              className="button"
              href={storeMaps(store, language).directions}
              target="_blank"
              rel="noopener noreferrer"
            >
              {text("directions")}
            </a>
            <a href="/magazalar/index.html">{text("all")}</a>
          </div>
        </div>
        <StoreMap store={store} language={language} />
      </div>
    </section>
  );
}
