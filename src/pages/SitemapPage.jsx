import React from "react";
import { useApp } from "../context/AppContext.jsx";
import { useText } from "../hooks/useText.js";
import { local } from "../utils/urls.js";
import RichText from "../RichText.jsx";
import routes from "../routes.json";

export default function SitemapPage() {
  const { data } = useApp();
  const t = useText();
  return (
    <section className="sitemap">
      <h1>
        <RichText value={t("page.0142")} />
      </h1>
      <ul>
        {Object.entries(routes).map(([url, r]) => (
          <li key={url}>
            <a href={local(url)}>
              {r.titleKey
                ? t(r.titleKey)
                : r.product
                  ? data.products.find((p) => p.key === r.product)?.name ||
                    r.product
                  : r.kind === "catalog"
                    ? data.categories
                        .concat(data.subcategories)
                        .find((c) => c.url === url)?.name || t("ui.copy.053")
                    : r.title || t("ui.copy.051")}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
