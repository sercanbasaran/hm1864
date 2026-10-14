import Icon from "../Icon.jsx";
import React from "react";
import { useApp } from "../../context/AppContext.jsx";
import { useText } from "../../hooks/useText.js";
import { plainText } from "../../formatted-text.js";
import { imageUrl } from "../../model.js";
import Media from "../Media.jsx";
export default function ProductGallery({
  product: p,
  src,
  gallery,
  onSelect: setSelectedImage,
}) {
  const { setLightbox, setModal } = useApp();
  const t = useText();
  return (
    <div>
      <button
        className="product-main-image"
        onClick={() => {
          setLightbox({ src, alt: p.name });
          setModal("lightbox");
        }}
        aria-label={plainText(t("ui.copy.029"))}
      >
        <Media src={src} alt={p.name} />
          <span className="image-zoom-cue"><Icon name="zoom" size={20} /></span>
      </button>

      <div className="product-gallery">
        {gallery.length > 1 &&
          gallery.map((file, i) => (
            <button
              className="gallery-thumb"
              key={file}
              onClick={() => setSelectedImage(file)}
              aria-label={t("ui.imageNumber", { count: i + 1 })}
            >
              <Media src={imageUrl(file)} alt="" />
            </button>
          ))}
      </div>
    </div>
  );
}
