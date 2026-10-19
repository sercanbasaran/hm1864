import FavoriteButton from "../components/products/FavoriteButton.jsx";
import ProductAccordions from "../components/products/ProductAccordions.jsx";
import { useProductDetails } from "../hooks/useProductDetails.js";
import ProductGallery from "../components/products/ProductGallery.jsx";
import Icon from "../components/Icon.jsx";
import React from "react";
import RichText from "../RichText.jsx";
import { plainText } from "../formatted-text.js";
import Card from "../components/products/ProductCard.jsx";
import Text from "../components/products/ProductText.jsx";
import OrderAvailability from "../components/products/OrderAvailability.jsx";
import EditorialSections from "../components/products/EditorialSections.jsx";
import { money, storeOnly, validPrice } from "../model.js";
import { useApp } from "../context/AppContext.jsx";

export default function ProductPage({ product: p }) {
  const { commerce, setModal } = useApp();
  const {
    t,
    currency,
    language,
    missing,
    variant,
    setVariant,
    qty,
    setQty,
    setSelectedImage,
    v,
    gallery,
    src,
    others,
    clamp,
  } = useProductDetails(p);

  return (
    <>
      <section className="product-detail catalog-detail">
        <ProductGallery
          product={p}
          src={src}
          gallery={gallery}
          onSelect={setSelectedImage}
        />

        <div className="product-info">
          <small>
            <RichText value={t("ui.productCode")} /> {p.code}
            {v.sku !== p.code ? t("ui.sku") + v.sku : ""}
          </small>

          <h1>
            <RichText value={p.name} />
          </h1>

          <FavoriteButton product={p} />
          <Text value={v.description} />

          <div className="detail-price">
            {money(v.price, currency, missing, language)}
          </div>

          <fieldset className="product-variants">
            <legend>
              <RichText value={t("ui.copy.004")} />
            </legend>
            <div className="variant-options">
              {p.variants.map((v) => (
                <label key={v.code} className="variant-choice">
                  <input
                    type="radio"
                    name="variant"
                    value={v.code}
                    checked={variant === v.code}
                    onChange={() => {
                      setVariant(v.code);
                      setSelectedImage(null);
                    }}
                  />
                  <span>
                    <RichText value={v.label || v.code} />
                  </span>
                </label>
              ))}
            </div>

            <p className="muted" aria-live="polite">
              {p.quantityUnit === "slice" ? (v.sliceCount != null && <><RichText value={t("ui.sliceCount",{count:v.sliceCount})}/> ·{" "}</>) : v.portion && (
                <>
                  <RichText value={v.portion} /> ·{" "}
                </>
              )}
              <RichText value={v.weight || t("ui.copy.040")} /> ·{" "}
              {v.stock == null
                ? t("ui.copy.041")
                : v.stock === 0
                  ? t("ui.copy.042")
                  : t("ui.stockCount", { count: v.stock })}
            </p>
          </fieldset>

          {storeOnly(p, variant) ? (
            <OrderAvailability />
          ) : (
            <>
              <div className="purchase-row">
                <div className="quantity">
                  <button
                    onClick={() => setQty(clamp(qty - 1))}
                    aria-label={plainText(t("ui.copy.030"))}
                  >
                    <Icon name="minus" size={16} />
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    aria-label={plainText(t("ui.copy.032"))}
                    value={qty}
                    onChange={(e) => setQty(clamp(e.target.value))}
                  />
                  <button
                    onClick={() => setQty(clamp(qty + 1))}
                    aria-label={plainText(t("ui.copy.031"))}
                  >
                    <Icon name="plus" size={16} />
                  </button>
                </div>
                <button className="button" disabled={!validPrice(v.price) || v.onlineSale === false || (v.stock != null && v.stock < qty)}
                  onClick={() => { if (commerce.addToCart(p, variant, qty)) setModal('cart'); }}>
                  <RichText value={t("commerce.add")} />
                </button>
              </div>
              <p className="muted">
                <RichText value={t("commerce.demoNotice")} />
              </p>
            </>
          )}

          <ProductAccordions product={p} variant={v} />
        </div>
      </section>

      <EditorialSections product={p} />

      <section className="product-section">
        <h2>
          <RichText value={t("ui.copy.003")} />
        </h2>
        <div className="product-grid">
          {others.map((p) => (
            <Card key={p.key} product={p} />
          ))}
        </div>
      </section>
    </>
  );
}
