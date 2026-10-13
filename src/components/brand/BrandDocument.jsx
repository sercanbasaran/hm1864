import React, { useState } from "react";
import BrandImage from "./BrandImage.jsx";
import { brandText } from "../../brand-content.js";
import { local } from "../../utils/urls.js";

export default function BrandDocument({ document, title, language, labels }) {
  const [open, setOpen] = useState(false);
  const text = (value) => brandText(value, language);
  return (
    <div className="brand-document">
      <BrandImage image={{ src: document.preview, alt: title }} language={language} zoom />
      <details onToggle={(event) => setOpen(event.currentTarget.open)}>
        <summary>{text(labels.viewDocument)}</summary>
        {open && <iframe src={local(document.src) + "#page=" + document.page + "&view=FitH"} title={text(title)} />}
        <a href={local(document.src)} download>{text(labels.downloadDocument)}</a>
      </details>
    </div>
  );
}
