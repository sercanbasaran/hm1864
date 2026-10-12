import React from "react";
import { useText } from "../../hooks/useText.js";
import RichText from "../../RichText.jsx";

export default function Text({ value }) {
  const t = useText();
  return (
    <p className="product-text">
      <RichText value={value || t("ui.copy.039")} />
    </p>
  );
}
