import React from "react";
import { useApp } from "../../context/AppContext.jsx";
import { useText } from "../../hooks/useText.js";
import RichText from "../../RichText.jsx";
import { local } from "../../utils/urls.js";
import { menuCategories, menuSubcategories } from "../../model.js";

export default function MobileMenuContent() {
  const { data } = useApp();
  const t = useText();
  return (
    <nav className="mobile-menu-content">
      {menuCategories(data).map((c) => (
        <details key={c.url}>
          <summary>
            <RichText value={c.name} />
          </summary>
          <a href={local(c.url)}>
            <RichText value={t("ui.allCategory", { name: c.name })} />
          </a>
          {menuSubcategories(data, c.name).map((s) => (
            <a key={s.url} href={local(s.url)}>
              <RichText value={s.name} />
            </a>
          ))}
        </details>
      ))}
      <a href="/magazalar/index.html">
        <RichText value={t("ui.stores")} />
      </a>
      <a href="/iletisim/index.html">
        <RichText value={t("ui.contact")} />
      </a>
    </nav>
  );
}
