import React, { useRef, useState } from "react";
import defaults from "./sections.json";
import { useText } from "../../hooks/useText.js";
import { local } from "../../utils/urls.js";
import { plainText } from "../../formatted-text.js";
import Media from "../Media.jsx";
import Icon from "../Icon.jsx";
import RichText from "../../RichText.jsx";
import SectionHeading from "../sections/SectionHeading.jsx";

export default function HeritageSection({ config = defaults.heritage, id = "heritage", initialYear = config.years[0]?.year }) {
  const t = useText();
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const tabs = useRef([]);
  const tabList = useRef(null);
  const scrollDates = direction => {
    const list = tabList.current;
    if (list) list.scrollBy({ left: direction * Math.max(120, list.clientWidth * 0.75), behavior: "smooth" });
  };
  const selected = config.years.find(item => item.year === selectedYear) || config.years[0];
  const images = (selected?.events || [selected]).flatMap(event => event?.images || []);
  const tabId = year => id === "heritage" ? `year-${year}` : `${id}-year-${year}`;
  const panelId = `${id}-content`;
  const navigate = (event, index) => {
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const count = config.years.length;
    const next = event.key === "Home" ? 0 : event.key === "End" ? count - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + count) % count;
    setSelectedYear(config.years[next].year);
    tabs.current[next]?.focus();
    tabs.current[next]?.scrollIntoView?.({ block: "nearest", inline: "nearest", behavior: "auto" });
  };
  return <section className="heritage-section">
    <SectionHeading title={t(config.titleKey)} description={t(config.descriptionKey)} />
    <div className={'split narrow' + (images.length ? '' : ' heritage-no-image')}>
      {images.length > 0 && <div className="heritage-images" key={selected.year}>
        {images.map(image => <Media key={image.src} src={local(image.src)} alt={image.altKey ? t(image.altKey) : image.alt} />)}
      </div>}
      <div>
        <div className="heritage-navigation">
          <button className="heritage-scroll" type="button" aria-label={plainText(t("home.heritage.scrollLeft"))} onClick={() => scrollDates(-1)}><Icon name="previous" size={20} /></button>
        <div ref={tabList} className="heritage-tabs" role="tablist" aria-label={plainText(t(config.tabsLabelKey))}>
          {config.years.map((item, index) => <button type="button" key={item.year}
            id={tabId(item.year)} data-year={item.year} role="tab" aria-controls={panelId} aria-selected={selected?.year === item.year}
            tabIndex={selected?.year === item.year ? 0 : -1} ref={element => { tabs.current[index] = element; }}
            onClick={() => setSelectedYear(item.year)} onKeyDown={event => navigate(event, index)}>
            <RichText value={t(item.labelKey)} />
          </button>)}
        </div>
          <button className="heritage-scroll" type="button" aria-label={plainText(t("home.heritage.scrollRight"))} onClick={() => scrollDates(1)}><Icon name="next" size={20} /></button>
        </div>
        {selected && <div id={panelId} role="tabpanel" aria-labelledby={tabId(selected.year)}>
          {(selected.events || [selected]).map((event, index) => <article className="heritage-event" key={event.titleKey || index}>
            <h3>{event.titleKey ? <RichText value={t(event.titleKey)} /> : selected.year}</h3>
            <p><RichText value={t(event.descriptionKey)} /></p>
            {event.href && <a href={local(event.href)}><RichText value={t(event.buttonKey)} /></a>}
          </article>)}
        </div>}
      </div>
    </div>
  </section>;
}
