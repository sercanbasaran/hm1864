import Icon from "../Icon.jsx";
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
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
  const { modal, setLightbox, setModal } = useApp();
  const t = useText();
  const previousSrc = useRef(src);
  const [transition, setTransition] = useState(null);
  useLayoutEffect(() => {
    const from = previousSrc.current;
    previousSrc.current = src;
    if (from === src) return;
    setTransition({ from, to: src });
    const timer = setTimeout(() => setTransition(null), 1600);
    return () => clearTimeout(timer);
  }, [src]);
  const [hover, setHover] = useState(false);
  const [hidden, setHidden] = useState(() => document.hidden);
  const galleryKey = JSON.stringify(gallery);
  const files = useMemo(() => JSON.parse(galleryKey), [galleryKey]);
  const index = Math.max(0, files.findIndex(file => imageUrl(file) === src));
  const multiple = files.length > 1;
  const move = delta => setSelectedImage(files[(index + delta + files.length) % files.length]);

  useEffect(() => {
    const update = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  useEffect(() => {
    if (!multiple || hover || hidden || modal) return;
    const timer = setTimeout(() => setSelectedImage(files[(index + 1) % files.length]), 5000);
    return () => clearTimeout(timer);
  }, [files, index, src, multiple, hover, hidden, modal, setSelectedImage]);

  return (
    <div
      className="product-photo-gallery"
      onPointerEnter={event => event.pointerType === "mouse" && setHover(true)}
      onPointerLeave={() => setHover(false)}
      onKeyDown={event => {
        if (multiple && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
          event.preventDefault();
          move(event.key === "ArrowLeft" ? -1 : 1);
        }
      }}
    >
      <div className="product-image-stage">
      <button
        type="button"
        className="product-main-image"
        onClick={() => {
          setLightbox({ src, alt: p.name });
          setModal("lightbox");
        }}
        aria-label={plainText(t("ui.copy.029"))}
      >
        <span key={src} className={'gallery-current-frame' + (transition?.to === src ? ' gallery-slide-in' : '')}>
          <Media src={src} alt={p.name} />
        </span>
        {transition?.to === src && <span key={'out-' + transition.from} className="gallery-outgoing-frame" aria-hidden="true">
          <Media src={transition.from} alt="" />
        </span>}
          <span className="image-zoom-cue"><Icon name="zoom" size={20} /></span>
      </button>
      {multiple && <>
        <button type="button" className="product-image-arrow product-image-previous"
          aria-label={plainText(t("template.0104"))} onClick={() => move(-1)}>
          <Icon name="previous" size={22} />
        </button>
        <button type="button" className="product-image-arrow product-image-next"
          aria-label={plainText(t("template.0111"))} onClick={() => move(1)}>
          <Icon name="next" size={22} />
        </button>
        <span className="product-image-count">{index + 1} / {files.length}</span>
      </>}
      </div>

      <div className="product-gallery">
        {gallery.length > 1 &&
          gallery.map((file, i) => (
            <button
              type="button"
              className="gallery-thumb"
              key={file}
              onClick={() => setSelectedImage(file)}
              aria-label={t("ui.imageNumber", { count: i + 1 })}
              aria-current={i === index ? "true" : undefined}
            >
              <Media src={imageUrl(file)} alt="" />
            </button>
          ))}
      </div>
    </div>
  );
}
