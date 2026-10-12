import React from "react";
import { useApp } from "../../context/AppContext.jsx";
import { useText } from "../../hooks/useText.js";
import RichText from "../../RichText.jsx";
import { plainText } from "../../formatted-text.js";

export default function OrderAvailability() {
  const { data, setModal } = useApp(),
    t = useText();
  return (
    <section
      className="order-availability"
      aria-label={plainText(t("ui.storeOnlyTitle"))}
    >
     {/*  <h3>
        <RichText value={t("ui.storeOnlyTitle")} />
      </h3> */}
      <p>
        <RichText value={t("ui.storeOnlyNote")} />
      </p>
      <div className="order-platforms">
        {(data.orderPlatforms || []).map((platform) => {
          const logo = (
            <>
              <img src={platform.logo} alt={platform.name} />
              {/* <span>{platform.name}</span> */}
            </>
          );
          return platform.url ? (
            <a
              key={platform.id}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {logo}
            </a>
          ) : (
            <div key={platform.id}>{logo}</div>
          );
        })}
      </div>
      <button
        type="button"
        className="button nearest-store-button"
        onClick={() => setModal("stores")}
      >
        <RichText value={t("ui.nearestStore")} />
      </button>
    </section>
  );
}
