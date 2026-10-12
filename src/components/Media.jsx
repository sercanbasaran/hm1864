import React, { useState, useEffect } from "react";
import { useText } from "../hooks/useText.js";
import RichText from "../RichText.jsx";
import { plainText } from "../formatted-text.js";

export default function Media({ src, alt = "", className = "" }) {
  const t = useText();
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  return (
    <span
      className={"media " + className + (src && !failed ? " asset-loaded" : "")}
    >
      <img
        src={
          src && !failed ? src : "/assets/images/medya/gorsel-bekleniyor.svg"
        }
        alt={plainText(alt)}
        loading="lazy"
        onError={() => setFailed(true)}
      />
      {(!src || failed) && (
        <span className="asset-caption">
          <RichText value={alt} />
          <small>
            <RichText value={t("template.0067")} />
          </small>
        </span>
      )}
    </span>
  );
}
