import React, { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { useText } from "../hooks/useText.js";
import { local } from "../utils/urls.js";
import RichText from "../RichText.jsx";
import { plainText } from "../formatted-text.js";
import Card from "../components/products/ProductCard.jsx";
import Breadcrumb from "../components/Breadcrumb.jsx";
import { match } from "../model.js";

export default function CategoryPage({ category: c }) {
  const { data } = useApp();
  const t = useText();
  const [query, setQuery] = useState(""),
    [sort, setSort] = useState("default"),
    [columns, setColumns] = useState(3);
  const parent = c.category || c.name;
  const products = data.products
    .filter(
      (p) => p.category === parent && (!c.category || p.subcategory === c.name),
    )
    .filter((p) => match(p, query));
  if (sort !== "default")
    products.sort(
      (a, b) =>
        a.name.localeCompare(b.name, "tr") * (sort === "name-desc" ? -1 : 1),
    );
  return (
    <>
      <Breadcrumb title={c.name} />
      <section className="catalog-hero">
        <h1>
          <RichText value={c.name} />
        </h1>
        <p>{t("ui.countProducts", { count: products.length })}</p>
      </section>
      <nav className="catalog-tabs">
        {[
          ...data.categories.filter((c) => c.name === parent),
          ...data.subcategories.filter((s) => s.category === parent),
        ].map((s) => (
          <a
            href={local(s.url)}
            key={s.url}
            aria-current={s.url === c.url ? "page" : undefined}
          >
            <RichText value={s.name} />
          </a>
        ))}
      </nav>
      <section className="catalog">
        <div className="catalog-tools">
          <span role="status">
            {t("ui.countProducts", { count: products.length })}
          </span>
          <div>
            <input
              aria-label={plainText(t("ui.copy.034"))}
              type="search"
              placeholder={plainText(t("ui.copy.037"))}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <select
              aria-label={plainText(t("ui.copy.033"))}
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="default">{plainText(t("ui.copy.027"))}</option>
              <option value="name">{plainText(t("ui.copy.025"))}</option>
              <option value="name-desc">{plainText(t("ui.copy.026"))}</option>
            </select>
            {[3, 4].map((n) => (
              <button
                key={n}
                aria-pressed={columns === n}
                onClick={() => setColumns(n)}
              >
                {t("ui.columns", { count: n })}
              </button>
            ))}
          </div>
        </div>
        <div
          className={"product-grid " + (columns === 4 ? "four-columns" : "")}
        >
          {products.map((p) => (
            <Card product={p} key={p.key} />
          ))}
        </div>
        {!products.length && (
          <p>
            <RichText value={t("ui.copy.024")} />
          </p>
        )}
      </section>
    </>
  );
}
