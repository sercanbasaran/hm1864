import React, { useState } from "react";
import { brandText } from "../../brand-content.js";

export default function BrandFAQ({ section, language, labels }) {
  const [query, setQuery] = useState("");
  const text = value => brandText(value, language);
  const normalize = value => value.normalize("NFKD").replace(/\p{M}/gu, "").toLocaleLowerCase(language).replace(/ı/g, "i");
  const terms = normalize(query.trim()).split(/\s+/).filter(Boolean);
  const items = section.items.filter(item => terms.every(term => normalize(text(item.title) + " " + text(item.body)).includes(term)));
  return <div className="brand-faq">
    {section.searchable && <label className="brand-faq-search">
      <span>{text(labels.search)}</span>
      <input type="search" value={query} onChange={event => setQuery(event.target.value)} aria-controls={section.id + "-results"} />
    </label>}
    <div id={section.id + "-results"}>
      {items.map(item => <details key={text(item.title)}>
        <summary>{text(item.title)}</summary><p dir="auto">{text(item.body)}</p>
      </details>)}
    </div>
    {items.length === 0 && <p role="status">{text(labels.searchEmpty)}</p>}
  </div>;
}
