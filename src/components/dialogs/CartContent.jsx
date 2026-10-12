import React from "react";
import { useText } from "../../hooks/useText.js";
import RichText from "../../RichText.jsx";

export default function CartContent() {
  const t = useText();
  return (
    <div className="empty-cart">
      <h3>
        <RichText value={t("ui.copy.018")} />
      </h3>
      <p>
        <RichText value={t("ui.copy.019")} />
      </p>
      <a className="button" href="/urunler/index.html">
        <RichText value={t("ui.copy.020")} />
      </a>
    </div>
  );
}
