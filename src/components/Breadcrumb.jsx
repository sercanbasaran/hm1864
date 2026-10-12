import React from "react";
import { useText } from "../hooks/useText.js";
import RichText from "../RichText.jsx";
import { plainText } from "../formatted-text.js";

export default function Breadcrumb({ title }) {
  const t = useText();
  return (
    <nav className="breadcrumb" aria-label={plainText(t("template.0164"))}>
      <a href="/index.html">
        <RichText value={t("template.0165")} />
      </a>
      <span>/</span>
      <a href="/urunler/index.html">
        <RichText value={t("page.0013")} />
      </a>
      <span>/</span>
      <span aria-current="page">
        <RichText value={title} />
      </span>
    </nav>
  );
}
