import Icon from "../Icon.jsx";
import React, { useState, useEffect, useRef } from "react";
import { useText } from "../../hooks/useText.js";
import { useApp } from "../../context/AppContext.jsx";
import { localizedSlide } from "../../utils/home-slider.js";
import { local } from "../../utils/urls.js";
import Media from "../Media.jsx";
import RichText from "../../RichText.jsx";
import { plainText } from "../../formatted-text.js";

export default function Hero() {
  const t = useText();
  const { data, preferences } = useApp();
  const config = data.homeSlider;
  const language = preferences?.language || "tr";
  const slides = config.slides.filter(slide => slide.enabled);
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
    if (paused || hover || hidden || slides.length < 2) return;
    const timer = setInterval(
      () => setCurrent((i) => (i + 1) % slides.length),
      config.intervalMs,
    );
    return () => clearInterval(timer);
  }, [paused, hover, hidden, slides.length, config.intervalMs]);
  const step = (d) =>
    setCurrent((i) => (i + d + slides.length) % slides.length);
  if (!slides.length) return null;
  return (
    <section
      className="hero-slider"
      aria-label={plainText(config.label?.[language] || config.label?.tr || t("ui.copy.038"))}
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
          {slides.map((slide, i) => {
            const text = localizedSlide(slide, language);
            const Heading = i === 0 ? "h1" : "h2";
            return <div className="react-slide" key={slide.id} inert={i !== current} aria-hidden={i !== current}>
              <article className="hero hero-slide" id={slide.id} data-grid-scheme={slide.gridScheme ?? 0} role="group" aria-roledescription="slide" aria-label={t("ui.slideNumber", { count: i + 1 })} style={{ "--hero-background": slide.backgroundColor }}>
                {slide.backgroundImage && <div className="hero-bg"><Media src={local(slide.backgroundImage)} alt={text.backgroundImageAlt} /></div>}
                <div className="hero-copy">
                  {text.eyebrow && <p className="eyebrow"><RichText value={text.eyebrow} /></p>}
                  <Heading><RichText value={text.title} lhf /></Heading>
                  <p><RichText value={text.description} /></p>
                  <a className="button button-outline" href={local(slide.buttonLink)}><RichText value={text.buttonLabel} /></a>
                </div>
                {slide.image && <div className="hero-product"><Media src={local(slide.image)} alt={text.imageAlt} /></div>}
              </article>
            </div>;
          })}
        </div>
      </div>
      <div className="hero-controls">
        <button
          aria-label={plainText(t("template.0104"))}
          onClick={() => step(-1)}
        >
          <Icon name="left" />
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
            <Icon name="dot" size={10} weight="fill" />
          </button>
        ))}
        <button
          aria-label={plainText(t("template.0111"))}
          onClick={() => step(1)}
        >
          <Icon name="right" />
        </button>
        <button onClick={() => setPaused((p) => !p)}>
          <Icon name={paused ? "play" : "pause"} /> {paused ? t("ui.resume") : t("ui.pause")}
        </button>
      </div>
    </section>
  );
}
