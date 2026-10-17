import React, { useRef } from "react";
import Card from "../products/ProductCard.jsx";
import Icon from "../Icon.jsx";
import { plainText } from "../../formatted-text.js";

export default function ProductCarousel({ products, label, previousLabel, nextLabel, scrollStep = 400 }) {
  const carousel = useRef(null);
  const move = direction => carousel.current?.scrollBy({ left: direction * scrollStep, behavior: "smooth" });
  return <>
    <div className="carousel" tabIndex={0} aria-label={plainText(label)} ref={carousel}>
      {products.map(product => <Card key={product.key} product={product} />)}
    </div>
    <div className="carousel-controls">
      <button type="button" data-scroll="-1" aria-label={plainText(previousLabel)} onClick={() => move(-1)}><Icon name="previous" /></button>
      <button type="button" data-scroll="1" aria-label={plainText(nextLabel)} onClick={() => move(1)}><Icon name="next" /></button>
    </div>
  </>;
}
