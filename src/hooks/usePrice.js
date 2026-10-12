import { useApp } from "../context/AppContext.jsx";
import { useText } from "./useText.js";

export const usePrice = () => {
  const { preferences, regions } = useApp(),
    t = useText();
  const currency = preferences?.currency || regions.defaultCurrency,
    language = preferences?.language || regions.defaultLanguage;
  return {
    currency,
    language,
    missing: t("ui.priceUnavailableCurrency", { currency }),
  };
};
