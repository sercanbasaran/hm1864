import React from "react";
import { useText } from "../hooks/useText.js";
import { local } from "../utils/urls.js";
import RichText from "../RichText.jsx";

export default function PlaceholderPage({ route }) {
  const t = useText();
  return (
    <>
      <section className="placeholder-content">
        <p className="eyebrow">
          <RichText value={t("template.0137")} />
        </p>
        <h1>
          <RichText value={route.title || t("ui.copy.051")} />
        </h1>
        <p>
          {route.kind === "404"
            ? t("ui.copy.052")
            : route.kind === "unavailable"
              ? t("ui.copy.053")
              : t("ui.copy.054")}
        </p>
        <a
          className="button"
          href={route.target ? local(route.target) : "/index.html"}
        >
          {route.target ? t("ui.copy.055") : t("ui.copy.056")}
        </a>
      </section>
    </>
  );
}
