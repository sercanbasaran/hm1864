import React from "react";
import defaults from "./sections.json";
import { useText } from "../../hooks/useText.js";
import { local } from "../../utils/urls.js";
import Media from "../Media.jsx";
import RichText from "../../RichText.jsx";

export default function CollectionSection({ config = defaults.collection }) {
  const t = useText();
  return <section className="collection-section">
    <div className="split collection-content">
      <Media src={local(config.image)} alt={t(config.imageAltKey)} />
      <div>
        <p className="eyebrow"><RichText value={t(config.eyebrowKey)} /></p>
        <h2><RichText value={t(config.titleKey)} /></h2>
        <h3><RichText value={t(config.subtitleKey)} /></h3>
        {config.paragraphKeys.map(key => <p key={key}><RichText value={t(key)} /></p>)}
        <a className="button button-gold" href={local(config.href)}><RichText value={t(config.buttonKey)} /></a>
      </div>
    </div>
  </section>;
}
