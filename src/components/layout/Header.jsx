import MenuItems from './MenuItems.jsx';
import {categoryMenu,primaryMenu,visibleItems,menuText} from '../../menus.js';
import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { useText } from "../../hooks/useText.js";
import { local } from "../../utils/urls.js";
import RichText from "../../RichText.jsx";
import { plainText } from "../../formatted-text.js";
import Media from "../Media.jsx";
import Icon from "../Icon.jsx";
import {imageUrl} from "../../model.js";
import { countryDefaults } from "../../market.js";
import { translate } from "../../i18n.js";

export default function Header() {
  const { data, modal, setModal, preferences, regions, content } = useApp();
  const t = useText();
  const language = preferences?.language || regions.defaultLanguage;
  const country =
    regions.countries.find((c) => c.code === preferences?.country) ||
    regions.countries.find((c) => c.code === regions.defaultCountry);
  const group = regions.groups.find((g) => g.id === country.group);
  const countryLabel =
    preferences?.countryName ||
    translate(content, language, "region.country." + country.code);
  const [menu, setMenu] = useState(null);
  const [tab, setTab] = useState(() => visibleItems(data.menus.mega.tabs)[0].id);
  const timer = useRef();
  const nav = primaryMenu(data,language);
  const tabs=visibleItems(data.menus.mega.tabs);
  useEffect(() => {
    if (modal) setMenu(null);
    return () => clearTimeout(timer.current);
  }, [modal]);
  useEffect(() => {
    const close = (e) => {
      if (e.key === "Escape") setMenu(null);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  const open = (id) => {
    clearTimeout(timer.current);
    setMenu(null);
    setModal(id);
  };
  const closeMenu = () => {
    clearTimeout(timer.current);
    setMenu(null);
  };
  const subImage = (sub, category) => {
    const product = data.products.find(
      (p) =>
        p.category === category &&
        p.subcategory === (sub.catalogName || sub.name) &&
        p.images?.length,
    );
    return imageUrl(sub.image || sub.images?.[0] || product?.images?.[0]);
  };
  const subDescription = (sub) =>
    sub.shortDescription ||
    sub.description ||
    `${sub.name} çeşitlerini keşfedin.`;
  const cats =
    menu === "all"
      ? categoryMenu(data,tabs.find(t=>t.id===tab)?.categories,language,tab)
      : categoryMenu(data,tabs.find(t=>t.id===tab)?.categories,language,tab).filter((c) => c.id === menu);
  return (
    <>
      <a className="skip-link" href="#main">
        <RichText value={t("ui.copy.001")} />
      </a>
      <header
        className="site-header header-gold"
        onPointerLeave={(e) => {
          if (e.pointerType === "mouse") closeMenu();
        }}
      >
        <div className="header-service">
          <div className="header-safe">
            <button onClick={() => open("region")}>
              <span className="region-summary">
                <span className="region-intro">
                  <RichText
                    value={translate(content, language, "ui.regionLabel")}
                  />{" "}
                </span>
                <RichText
                  value={translate(
                    content,
                    language,
                    "region.group." + group.id,
                  )}
                />{" "}
                / {countryLabel} /{" "}
                {regions.languages.find((l) => l.code === language)?.name} /{" "}
                {preferences?.currency ||
                  countryDefaults(regions, country.code).currency}
              </span>
              <Icon name="chevron" />
            </button>
            <div className="service-links"><MenuItems items={data.menus.header.service}/></div>
          </div>
        </div>
        <div className="header-brandbar">
          <div className="header-safe">
            <div className="header-left"><MenuItems items={data.menus.header.actionsLeft} onAction={open}/></div>
            <a className="header-logo" href="/index.html">
              <img
                src="/assets/images/medya/header-logo.png"
                alt={t("template.0005")}
              />
            </a>
            <div className="header-right"><MenuItems items={data.menus.header.actionsRight} onAction={open}/></div>
          </div>
        </div>
        <div
          className="header-categories"
          onPointerLeave={(e) => {
            if (e.pointerType === "mouse") clearTimeout(timer.current);
          }}
        >
          <nav
            className="header-safe"
            aria-label={plainText(t("template.0009"))}
          >
            {nav.map((category) => (
              <button
                className={
                  "nav-button " + (category.id === "all" ? "all-menu" : "")
                }
                key={category.id}
                aria-expanded={menu === (category.id)}
                aria-controls="mega-menu"
                onClick={() =>
                  setMenu(
                    menu === (category.id)
                      ? null
                      : category.id,
                  )
                }
                onPointerEnter={(e) => {
                  if (e.pointerType === "mouse")
                    timer.current = setTimeout(
                      () => setMenu(category.id),
                      180,
                    );
                }}
                onPointerLeave={() => clearTimeout(timer.current)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setMenu(category.id);
                  }
                }}
              >
                <RichText
                  value={
                    category.name
                  }
                />
                <Icon name="chevron" />
              </button>
            ))}
          </nav>
        </div>
        <div className="header-collection">
          <div className="header-safe">
            <MenuItems items={data.menus.header.collection}/>
          </div>
        </div>
        {menu && (
          <section
            id="mega-menu"
            className="mega-menu"
            onPointerLeave={(e) => {
              if (e.pointerType === "mouse") closeMenu();
            }}
            aria-label={plainText(t("template.0016"))}
          >
            <div className="mega-head">
              <div className="mega-tabs">
                {tabs.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setTab(item.id)}
                    aria-pressed={tab === item.id}
                  >
                    <RichText
                      value={menuText(item.label,language)}
                    />
                  </button>
                ))}
              </div>
              <button
                className="icon-button"
                onClick={() => setMenu(null)}
                aria-label={plainText(t("ui.copy.028"))}
              >
                <Icon name="close" />
              </button>
            </div>
            <div
              className={
                "mega-columns " + (menu !== "all" ? "mega-visual-grid" : "")
              }
            >
              {cats.map((c) => (
                <div key={c.name} className="mega-category">
                  <h3>
                    <a
                      onClick={closeMenu}
                      href={local(c.url)}
                    >
                      <RichText value={c.name} />
                    </a>
                  </h3>
                  <div className="mega-subcategories">
                    {c.children.map((sub) => (
                      <a
                        className="mega-subcategory-card"
                        key={sub.url}
                        onClick={closeMenu}
                        href={local(sub.url)}
                      >
                        {menu !== "all" && (
                          <Media src={subImage(sub, c.catalogName)} alt={sub.name} />
                        )}
                        <strong>{sub.name}</strong>
                        {menu !== "all" && <p>{subDescription(sub)}</p>}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </header>
      {menu && <div className="menu-scrim" onClick={() => setMenu(null)} />}
    </>
  );
}
