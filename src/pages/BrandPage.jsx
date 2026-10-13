import React from "react";
import { useApp } from "../context/AppContext.jsx";
import { brandText } from "../brand-content.js";
import { local } from "../utils/urls.js";
import BrandSections from "../components/brand/BrandSections.jsx";
export default function BrandPage({ page }) {
  const { data, preferences, regions } = useApp(),
    language = preferences?.language || regions.defaultLanguage,
    text = (v) => brandText(v, language);
  const group = data.brandGroups.find((g) => g.id === page.groupId),
    labels = data.brandLabels;
  const siblings = data.brandPages.filter(
    (p) => p.groupId === page.groupId && p.url !== group.url,
  );
  return (
    <article className={"brand-page brand-theme-" + page.groupId}>
      <header className="brand-hero">
        <img
          className="brand-hero-image"
          src={local(page.hero.image.src)}
          alt={text(page.hero.image.alt)}
          fetchPriority="high"
        />
        <div className="brand-hero-shade" />
        <div className="brand-hero-content">
          <p className="brand-eyebrow">
            Hafız Mustafa 1864 · {text(group.title)}
          </p>
          <h1 dir="auto">{text(page.hero.heading || page.title)}</h1>
          <p dir="auto">{text(page.hero.intro)}</p>
          <a className="brand-hero-link" href={"#" + page.sections[0].id}>
            {text(labels.discover)} <span aria-hidden="true">↓</span>
          </a>
        </div>
        {page.hero.image.generated && (
          <span className="brand-image-credit">
            {text(labels.visualInterpretation)}
          </span>
        )}
      </header>
      <div className="brand-reading-layout">
        <aside className="brand-chapters">
          <p>{text(labels.onThisPage)}</p>
          <nav aria-label={text(labels.onThisPage)}>
            {page.sections.map((s) => (
              <a key={s.id} href={"#" + s.id}>
                {text(s.title)}
              </a>
            ))}
          </nav>
          <a className="brand-back-link" href={local(group.url)}>
            {text(group.title)} ↗
          </a>
        </aside>
        <div className="brand-main-content">
          <BrandSections page={page} language={language} labels={labels} />
        </div>
      </div>
      <section className="brand-related" aria-label={text(labels.continue)}>
        <div>
          <p className="brand-eyebrow">1864 — {new Date().getFullYear()}</p>
          <h2>{text(labels.continue)}</h2>
        </div>
        <div className="brand-related-links">
          {siblings
            .filter((p) => p.id !== page.id)
            .slice(0, 4)
            .map((p) => (
              <a key={p.id} href={local(p.url)}>
                {text(p.title)} <span aria-hidden="true">↗</span>
              </a>
            ))}
        </div>
      </section>
      <footer className="brand-page-end">
        <a href="#main">{text(labels.top)} ↑</a>
        <a href="/magazalar/index.html">{text(labels.stores)} ↗</a>
      </footer>
    </article>
  );
}
