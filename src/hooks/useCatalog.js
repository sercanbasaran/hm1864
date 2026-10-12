import { useState, useEffect, useMemo } from "react";
import commonUI from "../../public/assets/data/ui/common.json";
import languageSettings from "../../public/assets/data/settings/languages.json";
import { read } from "../utils/storage.js";
import { validate } from "../model.js";
import {
  validateRegions,
  validateRegionalCatalog,
  normalizePreferences,
  regionalCatalog,
} from "../market.js";
import { validateContent, translate } from "../i18n.js";
const initialContent = {
  schemaVersion: 1,
  languages: languageSettings.languages,
  texts: commonUI.texts,
};

export function useCatalog() {
  const [rawData, setRawData] = useState(null),
    [regions, setRegions] = useState(null),
    [content, setContent] = useState(initialContent),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [savedPreferences, setPreferences] = useState(() =>
      read("hm1864.react.preferences", null),
    );
  const preferences = useMemo(
    () => normalizePreferences(savedPreferences, regions, content),
    [savedPreferences, regions, content],
  );
  const data = useMemo(
    () =>
      rawData && regions
        ? regionalCatalog(rawData, preferences, regions)
        : null,
    [rawData, preferences, regions],
  );
  const t = (key) =>
    translate(
      content,
      preferences?.language || regions?.defaultLanguage || "tr",
      key,
    );
  useEffect(() => {
    const controller = new AbortController();
    fetch("/assets/data/runtime.json", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((r) => {
        if (!r.ok) throw Error(t("ui.copy.060"));
        return r.json();
      })
      .then(({ catalog, regions: config, content: texts }) => {
        const validContent = validateContent(texts),
          validRegions = validateRegions(config, validContent.languages);
        setRawData(validateRegionalCatalog(validate(catalog), validRegions));
        setRegions(validRegions);
        setContent(validContent);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);
  return {
    rawData,
    regions,
    content,
    error,
    loading,
    preferences,
    data,
    setPreferences,
    t,
  };
}
