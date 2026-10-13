import { useMemo, useEffect } from "react";
import routes from "../routes.json";
import { resolve } from "../model.js";
import { translate } from "../i18n.js";
import { plainText } from "../formatted-text.js";
export function useResolvedRoute({
  data,
  path,
  rawData,
  content,
  preferences,
  regions,
  t,
}) {
  const route = useMemo(() => {
    if (!data) return null;
    const found = resolve(path, data, routes),
      language = preferences?.language || regions.defaultLanguage;
    const item = found.product
      ? rawData?.products.find((p) => p.key === found.product)
      : found.kind === "catalog"
        ? rawData?.categories
            .concat(rawData.subcategories)
            .find((c) => c.url === path.replace(/^\//, ""))
        : null;
    const title = found.store
      ? found.store.translations?.[language]?.name ||
        found.store.translations.tr.name
      : item
        ? item.translations?.[language]?.name || item.name
        : found.titleKey
          ? translate(content, language, found.titleKey)
          : found.title;
    return ["catalog-product", "catalog"].includes(found.kind)
      ? { kind: "unavailable", title }
      : { ...found, title };
  }, [data, path, rawData, content, preferences, regions]);
  useEffect(() => {
    document.title = plainText(
      (route?.product?.name ||
        route?.category?.name ||
        route?.title ||
        t("ui.homeTitle")) + t("ui.brandSuffix"),
    );
  }, [route]);
  return route;
}
