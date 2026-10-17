import React, { useRef, useState } from "react";
import defaults from "./sections.json";
import { useText } from "../../hooks/useText.js";
import { local } from "../../utils/urls.js";
import { plainText } from "../../formatted-text.js";
import Media from "../Media.jsx";
import RichText from "../../RichText.jsx";
import SectionHeading from "../sections/SectionHeading.jsx";

export default function HeritageSection({ config = defaults.heritage, id = "heritage", initialYear = config.years[0]?.year }) {
  const t = useText();
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const tabs = useRef([]);
  const selected = config.years.find(item => item.year === selectedYear) || config.years[0];
  const tabId = year => id === "heritage" ? `year-${year}` : `${id}-year-${year}`;
  const panelId = `${id}-content`;
  const navigate = (event, index) => {
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const count = config.years.length;
    const next = event.key === "Home" ? 0 : event.key === "End" ? count - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + count) % count;
    setSelectedYear(config.years[next].year);
    tabs.current[next]?.focus();
  };
  return <section className="heritage-section">
    <SectionHeading title={t(config.titleKey)} description={t(config.descriptionKey)} />
    <div className="split narrow">
      <Media src={local(config.image)} alt={t(config.imageAltKey)} />
      <div>
        <div className="heritage-tabs" role="tablist" aria-label={plainText(t(config.tabsLabelKey))}>
          {config.years.map((item, index) => <button type="button" key={item.year}
            id={tabId(item.year)} data-year={item.year} role="tab" aria-controls={panelId} aria-selected={selected?.year === item.year}
            tabIndex={selected?.year === item.year ? 0 : -1} ref={element => { tabs.current[index] = element; }}
            onClick={() => setSelectedYear(item.year)} onKeyDown={event => navigate(event, index)}>
            <RichText value={t(item.labelKey)} />
          </button>)}
        </div>
        {selected && <div id={panelId} role="tabpanel" aria-labelledby={tabId(selected.year)}>
          <h3>{selected.titleKey ? <RichText value={t(selected.titleKey)} /> : selected.year}</h3>
          <p><RichText value={t(selected.descriptionKey)} /></p>
          {selected.href && <a href={local(selected.href)}><RichText value={t(selected.buttonKey)} /></a>}
        </div>}
      </div>
    </div>
  </section>;
}
