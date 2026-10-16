import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { useText } from "./useText.js";
import { usePrice } from "./usePrice.js";
import { choice, imageUrl } from "../model.js";
export function useProductDetails(p) {
  const { data } = useApp();
  const t = useText();
  const { currency, language, missing } = usePrice();

  const [variant, setVariant] = useState(p.defaultVariant || p.variants[0]?.code || "");
  const [qty, setQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);

  const v = choice(p, variant, currency);
  const gallery = v.images;
  const src = imageUrl(
    selectedImage && gallery.includes(selectedImage)
      ? selectedImage
      : gallery[0],
  );

  const others = data.products
    .filter((x) => x.key !== p.key && x.category === p.category)
    .sort(
      (a, b) =>
        Number(b.subcategory === p.subcategory) -
        Number(a.subcategory === p.subcategory),
    )
    .slice(0, 3);

  const clamp = (n) => Math.max(1, Math.min(99, Math.trunc(Number(n)) || 1));

  return {
    t,
    currency,
    language,
    missing,
    variant,
    setVariant,
    qty,
    setQty,
    selectedImage,
    setSelectedImage,
    v,
    gallery,
    src,
    others,
    clamp,
  };
}
