import React from "react";
import defaults from "./sections.json";
import { useApp } from "../../context/AppContext.jsx";
import { useText } from "../../hooks/useText.js";
import SectionHeading from "../sections/SectionHeading.jsx";
import ProductCarousel from "../sections/ProductCarousel.jsx";

export default function FeaturedProductsSection({ config = defaults.featuredProducts, products }) {
  const { data } = useApp();
  const t = useText();
  const items = products ?? config.productKeys.map(key => data.products.find(product => product.key === key)).filter(Boolean);
  return <section className="product-section">
    <SectionHeading title={t(config.titleKey)} description={t(config.descriptionKey)} />
    <ProductCarousel products={items} label={t(config.titleKey)} previousLabel={t(config.previousKey)} nextLabel={t(config.nextKey)} />
  </section>;
}
