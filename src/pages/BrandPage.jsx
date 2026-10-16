import {menuText,visibleItems} from '../menus.js';
import MenuItems from '../components/layout/MenuItems.jsx';
import Icon from "../components/Icon.jsx";
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
  const menu=data.menus.brand,settings=menu.pages.find(p=>p.pageId===page.id);
  const chapters=settings?.enabled===false?[]:visibleItems(settings?.chapters).flatMap(item=>{const s=page.sections.find(s=>s.id===item.sectionId);return s?[{...s,title:item.label||s.title}]:[]});
  const siblings=visibleItems(visibleItems(menu.groups).find(g=>g.groupId===page.groupId)?.pages).flatMap(item=>{const p=data.brandPages.find(p=>p.id===item.pageId);return p?[{...p,title:item.label||p.title}]:[]});
  return (
    <article className={"brand-page brand-theme-" + page.groupId}>
      <header className={"brand-hero" + (!page.hero.image ? " brand-hero-text" : "")}>
        {page.hero.image && <img
          className="brand-hero-image"
          src={local(page.hero.image.src)}
          alt={text(page.hero.image.alt)}
          fetchPriority="high"
        />}
        <div className="brand-hero-shade" />
        <div className="brand-hero-content">
          <p className="brand-eyebrow">
            Hafız Mustafa 1864 · {text(group.title)}
          </p>
          <h1 dir="auto">{text(page.hero.heading || page.title)}</h1>
          <p dir="auto">{text(page.hero.intro)}</p>
          <a className="brand-hero-link" href={"#" + page.sections[0].id}>
            {text(labels.discover)} <Icon name="down" size={18} />
          </a>
        </div>
        {page.hero.image?.generated && (
          <span className="brand-image-credit">
            {text(labels.visualInterpretation)}
          </span>
        )}
      </header>
      <div className="brand-reading-layout">
        <aside className="brand-chapters">
          <p>{menuText(menu.chaptersTitle,language)}</p>
          <nav aria-label={menuText(menu.chaptersTitle,language)}>
            {chapters.map((s) => (
              <a key={s.id} href={"#" + s.id}>
                {text(s.title)}
              </a>
            ))}
          </nav>
          {settings?.showBackLink!==false && <a className="brand-back-link" href={local(group.url)}>
            {text(group.title)} <Icon name="external" size={18} />
          </a>}
        </aside>
        <div className="brand-main-content">
          <BrandSections page={page} language={language} labels={labels} />
        </div>
      </div>
      <section className="brand-related" aria-label={menuText(menu.relatedTitle,language)}>
        <div>
          <p className="brand-eyebrow">1864 — {new Date().getFullYear()}</p>
          <h2>{menuText(menu.relatedTitle,language)}</h2>
        </div>
        <div className="brand-related-links">
          {siblings
            .filter((p) => p.id !== page.id)
            .slice(0, menu.relatedLimit)
            .map((p) => (
              <a key={p.id} href={local(p.url)}>
                {text(p.title)} <Icon name="external" size={18} />
              </a>
            ))}
        </div>
      </section>
      <footer className="brand-page-end">
        <MenuItems items={menu.endLinks}/>
      </footer>
    </article>
  );
}
