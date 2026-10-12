import React, { useState, useEffect, useRef } from "react";
import { useText } from "../../hooks/useText.js";
import { descendants } from "../../utils/templates.js";
import { plainText } from "../../formatted-text.js";

export default function Hero({ node, renderNode: RenderNode }) {
  const t = useText();
  const slides = descendants(node, (n) =>
    (n.attrs.class || "").split(" ").includes("hero-slide"),
  );
  const [current, setCurrent] = useState(0),
    [paused, setPaused] = useState(
      () => matchMedia("(prefers-reduced-motion: reduce)").matches,
    ),
    [hover, setHover] = useState(false),
    [hidden, setHidden] = useState(document.hidden);
  const touch = useRef(null);
  useEffect(() => {
    const handler = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, []);
  useEffect(() => {
    if (paused || hover || hidden) return;
    const timer = setInterval(
      () => setCurrent((i) => (i + 1) % slides.length),
      5000,
    );
    return () => clearInterval(timer);
  }, [paused, hover, hidden, slides.length]);
  const step = (d) =>
    setCurrent((i) => (i + d + slides.length) % slides.length);
  return (
    <section
      className="hero-slider"
      aria-label={plainText(t("ui.copy.038"))}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHover(true)}
      onPointerLeave={() => setHover(false)}
      onFocusCapture={() => setPaused(true)}
      onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        const delta = e.changedTouches[0].clientX - touch.current;
        if (Math.abs(delta) > 50) step(delta < 0 ? 1 : -1);
      }}
    >
      <div className="hero-viewport">
        <div
          className="hero-track"
          style={{ transform: `translate3d(-${current * 100}%,0,0)` }}
        >
          {slides.map((slide, i) => (
            <div
              className="react-slide"
              key={i}
              inert={i !== current}
              aria-hidden={i !== current}
            >
              <RenderNode node={slide} />
            </div>
          ))}
        </div>
      </div>
      <div className="hero-controls">
        <button
          aria-label={plainText(t("template.0104"))}
          onClick={() => step(-1)}
        >
          ←
        </button>
        <span>
          {current + 1} / {slides.length}
        </span>
        {slides.map((_, i) => (
          <button
            key={i}
            aria-label={t("ui.slideNumber", { count: i + 1 })}
            aria-current={i === current ? "true" : undefined}
            onClick={() => setCurrent(i)}
          >
            ●
          </button>
        ))}
        <button
          aria-label={plainText(t("template.0111"))}
          onClick={() => step(1)}
        >
          →
        </button>
        <button onClick={() => setPaused((p) => !p)}>
          {paused ? t("ui.resume") : t("ui.pause")}
        </button>
      </div>
    </section>
  );
}
