import React from "react";
import { useText } from "../hooks/useText.js";
import RichText from "../RichText.jsx";
import { plainText } from "../formatted-text.js";
import { local } from "../utils/urls.js";

export default function Breadcrumb({ items = [] }) {
  const t = useText();
  if (!items.length) return null;
  return (
    <nav className="breadcrumb" aria-label={plainText(t("template.0164"))}>
      {items.map((item, index) => (
        <React.Fragment key={item.url || "current"}>
          {index > 0 && <span aria-hidden="true">&gt;</span>}
          {item.current ? (
            <span aria-current="page">
              <RichText value={item.label} />
            </span>
          ) : (
            <a href={local(item.url)}>
              <RichText value={item.label} />
            </a>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
