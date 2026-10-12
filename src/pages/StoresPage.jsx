import React from "react";
import { useText } from "../hooks/useText.js";
import StoreLocator from "../components/stores/StoreLocator.jsx";

export default function StoresPage() {
  const t = useText();
  return (
    <>
      <StoreLocator />
    </>
  );
}
