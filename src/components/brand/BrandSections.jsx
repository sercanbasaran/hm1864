import React from "react";
import { brandText } from "../../brand-content.js";
import BrandImage from "./BrandImage.jsx";
import BrandCards from "./BrandCards.jsx";
import BrandTimeline from "./BrandTimeline.jsx";
import BrandFAQ from "./BrandFAQ.jsx";
import BrandContacts from "./BrandContacts.jsx";
export default function BrandSections({ page, language, labels }) {
  const text = (v) => brandText(v, language);
  return page.sections.map((section) => (
    <section
      className={"brand-section brand-section-" + section.type}
      id={section.id}
      key={section.id}
      aria-labelledby={section.id + "-title"}
    >
      <div className="brand-section-heading">
        <span className="brand-section-number" aria-hidden="true">
          {String(page.sections.indexOf(section) + 1).padStart(2, "0")}
        </span>
        <h2 id={section.id + "-title"}>{text(section.title)}</h2>
      </div>
      {section.intro && (
        <p className="brand-section-intro" dir="auto">
          {text(section.intro)}
        </p>
      )}
      {section.type === "prose" && (
        <div className={"brand-prose " + (section.image ? "has-image" : "")}>
          <div>
            {section.paragraphs.map((p, i) => (
              <p dir="auto" key={i}>
                {text(p)}
              </p>
            ))}
            {section.signature && (
              <p className="brand-signature">{text(section.signature)}</p>
            )}
          </div>
          <BrandImage image={section.image} language={language} zoom />
        </div>
      )}
      {["cards", "documents", "gallery", "people"].includes(section.type) && (
        <BrandCards section={section} language={language} labels={labels} />
      )}
      {section.type === "timeline" && (
        <BrandTimeline section={section} language={language} labels={labels} />
      )}
      {section.type === "faq" && <BrandFAQ section={section} language={language} labels={labels} />}
      {section.type === "contacts" && <BrandContacts section={section} language={language} labels={labels} />}
    </section>
  ));
}
