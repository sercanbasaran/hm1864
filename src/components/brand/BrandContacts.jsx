import Icon from "../Icon.jsx";
import React from "react";
import { brandText } from "../../brand-content.js";

export default function BrandContacts({ section, language, labels }) {
  const text = value => brandText(value, language);
  return <div className="brand-contact-grid">
    {section.items.map(item => <article className="brand-contact-card" key={item.id}>
      <h3>{text(item.title)}</h3><p dir="auto">{text(item.body)}</p>
      <a href={"mailto:" + item.email}><span><Icon name="mail" size={18} /> {text(labels.email)}</span><bdi>{item.email}</bdi></a>
      {item.phone && <a href={"tel:" + item.phone}><span><Icon name="phone" size={18} /> {text(labels.call)}</span><bdi>{item.displayPhone}</bdi></a>}
    </article>)}
  </div>;
}
