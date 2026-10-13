import React from "react";
import { useApp } from "../../context/AppContext.jsx";
import { useText } from "../../hooks/useText.js";
import { hasRealText, nutritionRows } from "../../utils/product-content.js";
import RichText from "../../RichText.jsx";
import Text from "./ProductText.jsx";

export default function ProductAccordions({ product, variant }) {
  const t = useText(),
    { content } = useApp();
  const placeholders = ["ui.copy.039", "ui.copy.043", "ui.infoPending"].flatMap(
    (key) => Object.values(content.texts[key] || {}),
  );
  const real = (value) => hasRealText(value, placeholders);
  const ingredients = real(variant.ingredients) ? variant.ingredients : "";
  const allergens = real(variant.allergenInfo)
    ? variant.allergenInfo
    : (product.allergens || []).filter(real).length
      ? t("ui.allergens", { items: product.allergens.filter(real).join(", ") })
      : "";
  const nutrition = variant.nutrition ?? product.nutrition;
  const rows = nutritionRows(nutrition, placeholders);
  const summary = real(nutrition?.summary) ? nutrition.summary : "";
  const note = real(nutrition?.note) ? nutrition.note : "";
  const sections = [
    [t("ui.copy.045"), variant.servingSuggestion],
    [t("ui.copy.046"), variant.storage],
    [t("ui.copy.047"), variant.longTermStorage],
    [t("ui.copy.048"), variant.delivery],
    [t("ui.copy.049"), variant.packaging],
  ].filter(([, value]) => real(value));
  if (
    !ingredients &&
    !allergens &&
    !rows.length &&
    !summary &&
    !note &&
    !sections.length
  )
    return null;
  return (
    <div className="accordions">
      {(ingredients || allergens) && (
        <details>
          <summary>
            <RichText value={t("ui.copy.007")} />
          </summary>
          <div>
            {ingredients && <Text value={ingredients} />}{" "}
            {allergens && <Text value={allergens} />}
          </div>
        </details>
      )}
      {(rows.length > 0 || summary || note) && (
        <details>
          <summary>
            <RichText value={t("ui.copy.008")} />
          </summary>
          <div>
            {rows.length > 0 ? (
              <>
                {real(nutrition.basis) && <Text value={nutrition.basis} />}
                <table className="nutrition-table">
                  <tbody>
                    {rows.map((row, i) => (
                      <tr key={i}>
                        <th scope="row">
                          <RichText value={row.name} />
                        </th>
                        <td>
                          <RichText value={row.value} />{" "}
                          <RichText value={row.unit} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            ) : (
              summary && <Text value={summary} />
            )}
            {note && <Text value={note} />}
          </div>
        </details>
      )}
      {sections.map(([title, value]) => (
        <details key={title}>
          <summary>
            <RichText value={title} />
          </summary>
          <div>
            <Text value={value} />
          </div>
        </details>
      ))}
    </div>
  );
}
