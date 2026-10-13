import React, { useState } from "react";
import { brandText } from "../../brand-content.js";
import BrandImage from "./BrandImage.jsx";
import BrandDocument from "./BrandDocument.jsx";
import { local } from "../../utils/urls.js";
export default function BrandCards({ section, language, labels }) {
  const [filter, setFilter] = useState("all");
  const text = (v) => brandText(v, language);
  const items = section.items.filter(
    (i) => filter === "all" || i.tag === filter,
  );
  return (
    <>
      {section.filters?.length > 0 && (
        <div className="brand-filters" aria-label={text(labels.filter)}>
          <button
            type="button"
            aria-pressed={filter === "all"}
            onClick={() => setFilter("all")}
          >
            {text(labels.all)}
          </button>
          {section.filters.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
            >
              {text(f.label)}
            </button>
          ))}
        </div>
      )}
      <div
        className={
          "brand-card-grid " + (section.type === "people" ? "brand-people" : "")
        }
      >
        {items.map((item, i) => (
          <article className="brand-card" key={item.id || i}>
            <BrandImage
              image={item.image}
              language={language}
              zoom={section.type === "gallery"}
            />
            {(item.year || item.meta) && (
              <p className="brand-card-meta">{item.year || text(item.meta)}</p>
            )}
            <h3>{text(item.title)}</h3>
            {item.body && <p dir="auto">{text(item.body)}</p>}
            {item.detail?.paragraphs?.length > 0 && (
              <details className="brand-card-reading">
                <summary>{text(labels.readMore)}</summary>
                <div>{item.detail.paragraphs.map((paragraph, index) => <p key={index} dir="auto">{text(paragraph)}</p>)}</div>
              </details>
            )}
            {item.document && <BrandDocument document={item.document} title={item.title} language={language} labels={labels} />}
            {item.href && (
              <a
                href={local(item.href)}
              >
                {text(item.action || labels.explore)}{" "}
                <span aria-hidden="true">↗</span>
              </a>
            )}
          </article>
        ))}
      </div>
      {items.length === 0 && <p role="status">{text(labels.empty)}</p>}
    </>
  );
}
