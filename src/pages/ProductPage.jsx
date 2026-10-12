import { useProductDetails } from "../hooks/useProductDetails.js";
import ProductGallery from "../components/products/ProductGallery.jsx";
import React from "react";
import RichText from "../RichText.jsx";
import { plainText } from "../formatted-text.js";
import Card from "../components/products/ProductCard.jsx";
import Text from "../components/products/ProductText.jsx";
import OrderAvailability from "../components/products/OrderAvailability.jsx";
import EditorialSections from "../components/products/EditorialSections.jsx";
import { money, storeOnly } from "../model.js";

export default function ProductPage({ product: p }) {
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
              {v.portion && (
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
              {/* Purchase integration is not connected yet. */}
              <div className="purchase-row">
                <div className="quantity">
                  <button
                    onClick={() => setQty(clamp(qty - 1))}
                    aria-label={plainText(t("ui.copy.030"))}
                  >
                    −
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
                    +
                  </button>
                </div>
                <button className="button button-grey" disabled>
                  <RichText value={t("ui.copy.005")} />
                </button>
              </div>
              <p className="muted">
                <RichText value={t("ui.copy.006")} />
              </p>
            </>
          )}

          <div className="accordions">
            <details>
              <summary>
                <RichText value={t("ui.copy.007")} />
              </summary>
              <div>
                <Text value={v.ingredients} />
                <Text
                  value={
                    v.allergenInfo ||
                    (p.allergens == null
                      ? t("ui.copy.043")
                      : p.allergens.length
                        ? t("ui.allergens", { items: p.allergens.join(", ") })
                        : t("ui.copy.044"))
                  }
                />
              </div>
            </details>

            <details>
              <summary>
                <RichText value={t("ui.copy.008")} />
              </summary>
              <div>
                {p.nutrition?.values.length ? (
                  <>
                    <Text value={p.nutrition.basis} />
                    <table className="nutrition-table">
                      <tbody>
                        {p.nutrition.values.map((n, i) => (
                          <tr key={i}>
                            <th scope="row">{n.name}</th>
                            <td>
                              {n.value ?? t("ui.infoPending")} {n.unit}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                ) : (
                  <Text />
                )}
              </div>
            </details>

            {[
              [t("ui.copy.045"), v.servingSuggestion],
              [t("ui.copy.046"), v.storage],
              [t("ui.copy.047"), v.longTermStorage],
              [t("ui.copy.048"), v.delivery],
              [t("ui.copy.049"), v.packaging],
            ].map(([title, text]) => (
              <details key={title}>
                <summary>{title}</summary>
                <div>
                  <Text value={text} />
                </div>
              </details>
            ))}
          </div>
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
