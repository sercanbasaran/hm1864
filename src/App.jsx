import Breadcrumb from "./components/Breadcrumb.jsx";
import { buildBreadcrumbs } from "./routing/breadcrumbs.js";
import routes from "./routes.json";
import React, { useState, useEffect } from "react";
import { AppContext } from "./context/AppContext.jsx";
import { useCatalog } from "./hooks/useCatalog.js";
import { useNavigation } from "./hooks/useNavigation.js";
import { useResolvedRoute } from "./hooks/useResolvedRoute.js";
import { useDocumentLocale } from "./hooks/useDocumentLocale.js";
import { read } from "./utils/storage.js";
import RichText from "./RichText.jsx";
import Header from "./components/layout/Header.jsx";
import Footer from "./components/layout/Footer.jsx";
import Dialogs from "./components/dialogs/Dialogs.jsx";
import Page from "./routing/PageRouter.jsx";
export default function App() {
  const {
    rawData,
    regions,
    content,
    error,
    loading,
    preferences,
    data,
    setPreferences,
    t,
  } = useCatalog();
  const [modal, setModal] = useState(() =>
    read("hm1864.react.preferences", null) ? null : "region",
  );
  const [lightbox, setLightbox] = useState(null);
  const [year, setYear] = useState("1864");
  const { path, navigate } = useNavigation(setModal);
  const route = useResolvedRoute({
    data,
    path,
    rawData,
    content,
    preferences,
    regions,
    t,
  });
  const breadcrumbs = buildBreadcrumbs({
    path,
    route,
    data,
    rawData,
    routes,
    t,
    language: preferences?.language || regions?.defaultLanguage || "tr",
  });
  useDocumentLocale(preferences);
  useEffect(() => {
    if (data && !preferences && modal !== "region") setModal("region");
  }, [data, preferences, modal]);
  if (loading)
    return (
      <div className="app-status" role="status">
        <RichText value={t("ui.copy.023")} />
      </div>
    );
  if (error || !data)
    return (
      <div className="app-status" role="alert">
        <h1>
          <RichText value={t("ui.copy.021")} />
        </h1>
        <p>{error}</p>
        <button className="button" onClick={() => location.reload()}>
          <RichText value={t("ui.copy.022")} />
        </button>
      </div>
    );
  return (
    <AppContext.Provider
      value={{
        data,
        regions,
        content,
        modal,
        setModal,
        preferences,
        setPreferences,
        requiredSelection: !preferences,
        lightbox,
        setLightbox,
        year,
        setYear,
      }}
    >
      <div onClick={navigate}>
        <Header />
        <main id="main" key={path}>
          <Breadcrumb items={breadcrumbs} />
          <Page route={route} />
        </main>
        <Footer />
        <Dialogs />
      </div>
    </AppContext.Provider>
  );
}
