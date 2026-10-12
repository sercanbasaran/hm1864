import React from "react";
import { useApp } from "../../context/AppContext.jsx";
import { useText } from "../../hooks/useText.js";
import { local } from "../../utils/urls.js";
import RichText from "../../RichText.jsx";
import { localizedEditorial } from "../../data-loader.js";
import Media from "../Media.jsx";

export default function EditorialSections({ product }) {
  const { preferences, regions } = useApp(),
    t = useText();
  const language = preferences?.language || regions.defaultLanguage;
  return (
    <div className="product-editorial">
      {localizedEditorial(product.editorial, language)
        .filter((section) => section.enabled === true)
        .map((section, i) => {
          const title =
            section.title ||
            t(section.type === "story" ? "ui.productStory" : "ui.boxReuse");
          const paragraphs = (section.paragraphs || []).filter(
            (p) => typeof p === "string" && p.trim(),
          );
          return (
            <section
              key={section.type}
              className={
                "editorial-section " + (i % 2 ? "editorial-reverse" : "")
              }
              aria-labelledby={"editorial-" + section.type}
            >
              <div className="editorial-image">
                <Media
                  src={section.image ? local(section.image) : null}
                  alt={section.imageAlt || title}
                />
              </div>
              <div className="editorial-copy">
                <h2 id={"editorial-" + section.type}>
                  <RichText value={title} />
                </h2>
                {paragraphs.length ? (
                  paragraphs.map((paragraph, j) => (
                    <p key={j}>
                      <RichText value={paragraph} />
                    </p>
                  ))
                ) : (
                  <p className="muted">
                    <RichText value={t("ui.editorialPending")} />
                  </p>
                )}
              </div>
            </section>
          );
        })}
    </div>
  );
}
