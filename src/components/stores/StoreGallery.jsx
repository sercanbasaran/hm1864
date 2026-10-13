import React, { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { storeGallery, storeText } from "../../stores.js";
import { local } from "../../utils/urls.js";

export default function StoreGallery({ store, language }) {
  const { data, setLightbox, setModal } = useApp();
  const photos = storeGallery(store, language);
  const [selected, setSelected] = useState(0);
  if (!photos.length) return null;
  const index = Math.min(selected, photos.length - 1),
    photo = photos[index];
  const text = (key) => storeText(data, language, key);
  const move = (delta) =>
    setSelected((index + delta + photos.length) % photos.length);
  return (
    <section
      className="store-gallery"
      aria-label={text("gallery")}
      onKeyDown={(event) => {
        if (photos.length < 2) return;
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          move(event.key === "ArrowLeft" ? -1 : 1);
        }
      }}
    >
      <h2>{text("gallery")}</h2>
      <figure>
        <button
          type="button"
          className="store-gallery-main"
          aria-label={text("enlarge")}
          onClick={() => {
            setLightbox({ src: local(photo.src), alt: photo.alt });
            setModal("lightbox");
          }}
        >
          <img src={local(photo.src)} alt={photo.alt} loading="lazy" />
        </button>
        {photo.caption && <figcaption>{photo.caption}</figcaption>}
      </figure>
      {photos.length > 1 && (
        <>
          <div className="store-gallery-controls">
            <button
              type="button"
              aria-label={text("previousPhoto")}
              onClick={() => move(-1)}
            >
              ‹
            </button>
            <span aria-live="polite">
              {index + 1} / {photos.length}
            </span>
            <button
              type="button"
              aria-label={text("nextPhoto")}
              onClick={() => move(1)}
            >
              ›
            </button>
          </div>
          <div className="store-gallery-thumbnails">
            {photos.map((item, i) => (
              <button
                type="button"
                key={item.src}
                aria-label={`${item.alt} — ${i + 1} / ${photos.length}`}
                aria-pressed={i === index}
                onClick={() => setSelected(i)}
              >
                <img src={local(item.src)} alt="" loading="lazy" />
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
