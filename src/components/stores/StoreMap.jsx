import React from "react";
import { storeMaps } from "../../stores.js";
export default function StoreMap({ store, language }) {
  return (
    <iframe
      className="store-map"
      title={store.name}
      src={storeMaps(store, language).embed}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      allowFullScreen
    />
  );
}
