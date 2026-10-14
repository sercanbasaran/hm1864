import React from "react";
import { useApp } from "../../context/AppContext.jsx";
import { useText } from "../../hooks/useText.js";
import { local } from "../../utils/urls.js";
import RichText from "../../RichText.jsx";
import { plainText } from "../../formatted-text.js";
import Media from "../Media.jsx";
import Card from "../products/ProductCard.jsx";
import Disclosure from "./Disclosure.jsx";
import Hero from "../home/HeroSlider.jsx";
import { countryDefaults } from "../../market.js";
import { translate, templateText } from "../../i18n.js";
import { isLhfHeading } from "../../utils/lhf-text.js";
import Icon from "../Icon.jsx";

export default function Template({ node, skipHero = false, lhf = false, ancestorClasses = [] }) {
  const { data, preferences, regions, content, setModal, year, setYear } =
    useApp();
  const t = useText();
  const language = preferences?.language || regions.defaultLanguage;
  if (typeof node === "string")
    return <RichText value={templateText(content, language, node)} lhf={lhf} />;
  if (!node) return null;
  if (node.tag === "home-slider") return <Hero />;
  const a = node.attrs || {},
    children = node.children || [];
  if (node.tag === "icon") return <Icon name={a.name} className={a.class || ""} />;
  const childClasses = [...ancestorClasses, ...(a.class || "").split(/\s+/).filter(Boolean)];
  const lhfContent = lhf || isLhfHeading(node.tag, childClasses);
  if (node.tag === "article" && a["data-product"]) {
    const p = data.products.find((p) => p.key === a["data-product"]);
    return p ? <Card product={p} /> : null;
  }
  if ("data-region-label" in a)
    return (
      <span>
        <RichText
          value={translate(
            content,
            language,
            "region.group." +
              (preferences?.group ||
                countryDefaults(regions, regions.defaultCountry).group),
          )}
        />{" "}
        /{" "}
        {preferences?.countryName ||
          translate(
            content,
            language,
            "region.country." +
              (preferences?.country || regions.defaultCountry),
          )}{" "}
        /{" "}
        {regions.languages.find((l) => l.code === preferences?.language)
          ?.name ||
          regions.languages.find((l) => l.code === regions.defaultLanguage)
            ?.name}{" "}
        / {preferences?.currency || regions.defaultCurrency}
      </span>
    );
  if ((a.class || "").split(" ").includes("media")) {
    const img = children.find((c) => c?.tag === "img");
    return (
      <Media
        src={a["data-asset"] ? local(a["data-asset"]) : null}
        alt={templateText(content, language, img?.attrs.alt)}
        className={a.class.replace(/\bmedia\b/g, "")}
      />
    );
  }
  const props = {};
  const map = {
    class: "className",
    for: "htmlFor",
    tabindex: "tabIndex",
    autocomplete: "autoComplete",
    "stroke-width": "strokeWidth",
    "stroke-linecap": "strokeLinecap",
    "stroke-linejoin": "strokeLinejoin",
    viewbox: "viewBox",
    maxlength: "maxLength",
    minlength: "minLength",
    readonly: "readOnly",
  };
  for (const [k, v] of Object.entries(a)) {
    if (k === "style" || k.startsWith("on")) continue;
    let key = map[k] || k;
    if (
      ["hidden", "open", "disabled", "required", "checked", "inert"].includes(k)
    )
      props[key] = true;
    else if (k === "href" || k === "src") props[key] = local(v);
    else
      props[key] = ["alt", "title", "placeholder", "aria-label"].includes(k)
        ? plainText(templateText(content, language, v ?? ""))
        : templateText(content, language, v ?? "");
  }
  if (a["data-open"])
    props.onClick = () => setModal(a["data-open"].replace("-dialog", ""));
  if (a["data-scroll"])
    props.onClick = (e) =>
      e.currentTarget
        .closest(".product-section")
        ?.querySelector(".carousel")
        ?.scrollBy({
          left: Number(a["data-scroll"]) * 400,
          behavior: "smooth",
        });
  if (a["data-year"]) {
    props["aria-selected"] = year === a["data-year"];
    props.tabIndex = year === a["data-year"] ? 0 : -1;
    props.onClick = () => setYear(a["data-year"]);
    props.onKeyDown = (e) => {
      const years = ["1864", "1888", "1923", "1925", "1926"];
      if (["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)) {
        e.preventDefault();
        const i = years.indexOf(year),
          next =
            e.key === "Home"
              ? 0
              : e.key === "End"
                ? 4
                : (i + (e.key === "ArrowRight" ? 1 : -1) + 5) % 5;
        setYear(years[next]);
        document.getElementById("year-" + years[next])?.focus();
      }
    };
  }
  if (a.id === "heritage-content" && year !== "1864")
    return (
      <div
        id="heritage-content"
        role="tabpanel"
        aria-labelledby={"year-" + year}
      >
        <h3>{year}</h3>
        <p>
          <RichText value={t("ui.copy.002")} />
        </p>
        <a href="/asirlik-miras/donum-noktalari/index.html">
          <RichText value={t("page.0032")} />
        </a>
      </div>
    );
  if (node.tag === "main")
    return (
      <>
        {children.map((c, i) => (
          <Template key={i} node={c} lhf={lhfContent} ancestorClasses={childClasses} />
        ))}
      </>
    );
  if (node.tag === "details")
    return <Disclosure attrs={props} nodes={children} renderNode={Template} />;
  if (["img", "input", "br", "hr"].includes(node.tag))
    return React.createElement(node.tag, props);
  return React.createElement(
    node.tag,
    props,
    ...children.map((c, i) => <Template key={i} node={c} lhf={lhfContent} ancestorClasses={childClasses} />),
    node.tag === "summary" ? <Icon key="disclosure" name="chevron" className="disclosure-icon" size={18} /> : null,
  );
}
