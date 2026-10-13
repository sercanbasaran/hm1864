import React, { useState } from "react";
import { brandText } from "../../brand-content.js";
import BrandImage from "./BrandImage.jsx";
export default function BrandTimeline({ section, language, labels }) {
  const [era, setEra] = useState("all"),
    text = (v) => brandText(v, language);
  const items = section.items.filter((i) => era === "all" || i.era === era);
  return (
    <>
      <div className="brand-filters" aria-label={text(labels.filter)}>
        <button
          type="button"
          aria-pressed={era === "all"}
          onClick={() => setEra("all")}
        >
          {text(labels.all)}
        </button>
        {section.eras.map((e) => (
          <button
            type="button"
            aria-pressed={era === e.id}
            key={e.id}
            onClick={() => setEra(e.id)}
          >
            {text(e.label)}
          </button>
        ))}
      </div>
      <ol className="brand-timeline">
        {items.map((item) => (
          <li key={item.id}>
            <span className="brand-year">{item.year}</span>
            <details open={item.id === items[0]?.id}>
              <summary>{text(item.title)}</summary>
              <div className="brand-timeline-detail">
                <p dir="auto">{text(item.body)}</p>
                <BrandImage image={item.image} language={language} zoom />
              </div>
            </details>
          </li>
        ))}
      </ol>
    </>
  );
}
