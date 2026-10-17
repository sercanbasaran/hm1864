import React from "react";
import defaults from "./sections.json";
import { useText } from "../../hooks/useText.js";
import { local } from "../../utils/urls.js";
import Media from "../Media.jsx";
import RichText from "../../RichText.jsx";
import SectionHeading from "../sections/SectionHeading.jsx";

export default function CorporateGiftsSection({ config = defaults.corporateGifts }) {
  const t = useText();
  return <section className="corporate">
    <SectionHeading eyebrow={t(config.eyebrowKey)} title={t(config.titleKey)} description={t(config.descriptionKey)} />
    <div className="split narrow">
      <Media src={local(config.image)} alt={t(config.imageAltKey)} />
      <div>
        {config.features.map(feature => <React.Fragment key={feature.titleKey}>
          <h3><RichText value={t(feature.titleKey)} /></h3>
          <p><RichText value={t(feature.descriptionKey)} /></p>
        </React.Fragment>)}
        <a className="button" href={local(config.href)}><RichText value={t(config.buttonKey)} /></a>
      </div>
    </div>
  </section>;
}
