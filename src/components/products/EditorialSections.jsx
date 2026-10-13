import {
  hasEditorialContent,
  editorialImage,
  editorialTitle,
  editorialParagraphs,
} from "../../utils/editorial.js";
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
  const sections = localizedEditorial(product.editorial, language).filter(
    hasEditorialContent,
  );
  if (!sections.length) return null;
  return (
    <div className="product-editorial">
      {sections.map((section, i) => {
        const title =
          editorialTitle(section) ||
          t(section.type === "story" ? "ui.productStory" : "ui.boxReuse");
        const paragraphs = editorialParagraphs(section);
        const image = editorialImage(section);
        return (
          <section
            key={section.type}
            className={
              "editorial-section " +
              (i % 2 ? "editorial-reverse " : "") +
              (!image ? "editorial-text-only" : "")
            }
            aria-labelledby={"editorial-" + section.type}
          >
            {image && (
              <div className="editorial-image">
                <Media src={local(image)} alt={section.imageAlt || title} />
              </div>
            )}
            <div className="editorial-copy">
              <h2 id={"editorial-" + section.type}>
                <RichText value={title} />
              </h2>
              {paragraphs.map((paragraph, j) => (
                <p key={j}>
                  <RichText value={paragraph} />
                </p>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
