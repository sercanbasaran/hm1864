import React from "react";
import { useApp } from "../../context/AppContext.jsx";
import { brandText } from "../../brand-content.js";
import { local } from "../../utils/urls.js";
export default function BrandImage({ image, language, zoom = false }) {
  const { setLightbox, setModal } = useApp();
  if (!image?.src) return null;
  const img = (
    <img
      src={local(image.src)}
      alt={brandText(image.alt, language)}
      loading="lazy"
    />
  );
  return (
    <figure className="brand-image">
      {zoom ? (
        <button
          type="button"
          aria-label={brandText(image.alt, language)}
          onClick={() => {
            setLightbox({
              src: local(image.src),
              alt: brandText(image.alt, language),
            });
            setModal("lightbox");
          }}
        >
          {img}
        </button>
      ) : (
        img
      )}
      {brandText(image.caption, language) && (
        <figcaption>{brandText(image.caption, language)}</figcaption>
      )}
    </figure>
  );
}
