import React from "react";
import RichText from "../../RichText.jsx";

export default function SectionHeading({ title, description, eyebrow, className = "section-heading" }) {
  return <div className={className}>
    {eyebrow && <p className="eyebrow"><RichText value={eyebrow} /></p>}
    <h2><RichText value={title} /></h2>
    {description && <p><RichText value={description} /></p>}
  </div>;
}
