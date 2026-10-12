import { useApp } from "../context/AppContext.jsx";
import { formatText } from "../i18n.js";

export const useText = () => {
  const { content, preferences, regions } = useApp();
  return (key, values) =>
    formatText(
      content,
      preferences?.language || regions.defaultLanguage,
      key,
      values,
    );
};
