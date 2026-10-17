import React from "react";
import defaults from "./sections.json";
import { useText } from "../../hooks/useText.js";
import { local } from "../../utils/urls.js";
import Media from "../Media.jsx";
import RichText from "../../RichText.jsx";

export default function StoresTeaserSection({ config = defaults.stores }) {
  const t = useText();
  return <section className="split stores-teaser">
    <div>
      <Media src={local(config.image)} alt={t(config.imageAltKey)} />
      <p className="caption"><RichText value={t(config.captionKey)} /></p>
    </div>
    <div className="black-panel">
      <h2>{config.titleKeys.map((key, index) => <React.Fragment key={key}>
        {index > 0 && <br />}<RichText value={t(key)} />
      </React.Fragment>)}</h2>
      {config.paragraphKeys.map(key => <p key={key}><RichText value={t(key)} /></p>)}
      <a className="button" href={local(config.href)}><RichText value={t(config.buttonKey)} /></a>
    </div>
  </section>;
}
