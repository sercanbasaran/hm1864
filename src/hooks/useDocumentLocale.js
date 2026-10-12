import { useEffect } from "react";
export function useDocumentLocale(preferences) {
  useEffect(() => {
    document.documentElement.lang = preferences?.language || "tr";
    document.documentElement.dir = ["ar", "ur", "fa"].includes(
      preferences?.language,
    )
      ? "rtl"
      : "ltr";
  }, [preferences]);
}
