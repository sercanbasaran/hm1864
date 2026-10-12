import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { useText } from "../../hooks/useText.js";
import { local } from "../../utils/urls.js";
import RichText from "../../RichText.jsx";
import { plainText } from "../../formatted-text.js";
import Media from "../Media.jsx";
import Icon from "../Icon.jsx";
import {
  slug,
  imageUrl,
  menuCategories,
  menuSubcategories,
} from "../../model.js";
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
  const [tab, setTab] = useState("online");
  const timer = useRef();
  const nav = menuCategories(data).filter((c) => c.highlightOnHeader);
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
        p.subcategory === sub.name &&
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
      ? menuCategories(data, tab)
      : menuCategories(data, tab).filter((c) => c.name === menu);
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
            <div className="service-links">
              <a href="/magazalar/index.html">
                <RichText value={translate(content, language, "ui.stores")} />
              </a>
              <a className="service-contact" href="/iletisim/index.html">
                <RichText value={translate(content, language, "ui.contact")} />
              </a>
            </div>
          </div>
        </div>
        <div className="header-brandbar">
          <div className="header-safe">
            <div className="header-left">
              <button
                className="mobile-toggle icon-button"
                aria-label={plainText(t("template.0002"))}
                onClick={() => open("mobile")}
              >
                <Icon name="menu" />
              </button>
              <button
                className="icon-button"
                aria-label={plainText(t("template.0003"))}
                onClick={() => open("search")}
              >
                <Icon name="search" />
              </button>
            </div>
            <a className="header-logo" href="/index.html">
              <img
                src="/assets/images/medya/header-logo.png"
                alt={t("template.0005")}
              />
            </a>
            <div className="header-right">
              <button
                className="icon-button"
                aria-label={plainText(t("page.0056"))}
                onClick={() => open("profile")}
              >
                <Icon name="user" />
              </button>
              <button
                className="icon-button"
                aria-label={plainText(t("page.0052"))}
                onClick={() => open("cart")}
              >
                <Icon name="bag" />
              </button>
            </div>
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
            {[null, ...nav].map((category) => (
              <button
                className={
                  "nav-button " + (category === null ? "all-menu" : "")
                }
                key={category?.url || "all"}
                aria-expanded={menu === (category?.name || "all")}
                aria-controls="mega-menu"
                onClick={() =>
                  setMenu(
                    menu === (category?.name || "all")
                      ? null
                      : category?.name || "all",
                  )
                }
                onPointerEnter={(e) => {
                  if (e.pointerType === "mouse")
                    timer.current = setTimeout(
                      () => setMenu(category?.name || "all"),
                      180,
                    );
                }}
                onPointerLeave={() => clearTimeout(timer.current)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setMenu(category?.name || "all");
                  }
                }}
              >
                <RichText
                  value={
                    category?.name || translate(content, language, "ui.allMenu")
                  }
                />
                <Icon name="chevron" />
              </button>
            ))}
          </nav>
        </div>
        <div className="header-collection">
          <div className="header-safe">
            <a href="/koleksiyonlar/hm-1864-serisi/index.html">
              <RichText value={t("template.0015")} />
            </a>
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
                {["online", "store"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    aria-pressed={tab === t}
                  >
                    <RichText
                      value={translate(
                        content,
                        language,
                        t === "online" ? "ui.onlineMenu" : "ui.storeMenu",
                      )}
                    />
                  </button>
                ))}
              </div>
              <button
                className="icon-button"
                onClick={() => setMenu(null)}
                aria-label={plainText(t("ui.copy.028"))}
              >
                ×
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
                      href={
                        tab === "online"
                          ? local(c.url)
                          : "/magaza-menu/" + slug(c.name) + "/index.html"
                      }
                    >
                      <RichText value={c.name} />
                    </a>
                  </h3>
                  <div className="mega-subcategories">
                    {menuSubcategories(data, c.name, tab).map((sub) => (
                      <a
                        className="mega-subcategory-card"
                        key={sub.url}
                        onClick={closeMenu}
                        href={
                          tab === "online"
                            ? local(sub.url)
                            : "/magaza-menu/" +
                              slug(c.name) +
                              "/" +
                              slug(sub.name) +
                              "/index.html"
                        }
                      >
                        {menu !== "all" && (
                          <Media src={subImage(sub, c.name)} alt={sub.name} />
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
