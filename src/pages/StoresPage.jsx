import React from "react";
import { useText } from "../hooks/useText.js";
import Breadcrumb from "../components/Breadcrumb.jsx";
import StoreLocator from "../components/stores/StoreLocator.jsx";

export default function StoresPage() {
  const t = useText();
  return (
    <>
      <Breadcrumb title={t("ui.stores")} />
      <StoreLocator />
    </>
  );
}
