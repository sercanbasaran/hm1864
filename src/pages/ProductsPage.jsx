import React from "react";
import { useApp } from "../context/AppContext.jsx";
import { useText } from "../hooks/useText.js";
import { local } from "../utils/urls.js";
import RichText from "../RichText.jsx";
import Breadcrumb from "../components/Breadcrumb.jsx";

export default function ProductsPage() {
  const { data } = useApp();
  const t = useText();
  return (
    <>
      <Breadcrumb title={t("page.0013")} />
      <section className="catalog-hero">
        <p className="eyebrow">
          <RichText value={t("template.0137")} />
        </p>
        <h1>
          <RichText value={t("page.0013")} />
        </h1>
        <p>
          {t("ui.countCategoriesProducts", {
            categories: data.categories.length,
            products: data.products.length,
          })}
        </p>
      </section>
      <section className="catalog-category-grid">
        {data.categories.map((c) => (
          <a className="catalog-category" href={local(c.url)} key={c.url}>
            <h2>
              <RichText value={c.name} />
            </h2>
            <p>
              {t("ui.countProducts", {
                count: data.products.filter((p) => p.category === c.name)
                  .length,
              })}
            </p>
          </a>
        ))}
      </section>
    </>
  );
}
