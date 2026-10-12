import { useDialogState } from "../../hooks/useDialogState.js";
import CartContent from "./CartContent.jsx";
import MobileMenuContent from "./MobileMenuContent.jsx";
import ProfileContent from "./ProfileContent.jsx";
import SearchContent from "./SearchContent.jsx";
import React, { useEffect, useRef } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { useText } from "../../hooks/useText.js";
import { save } from "../../utils/storage.js";
import RichText from "../../RichText.jsx";
import { plainText } from "../../formatted-text.js";
import Media from "../Media.jsx";
import Icon from "../Icon.jsx";
import StoreLocator from "../stores/StoreLocator.jsx";
import RegionForm from "./RegionForm.jsx";
import { translate } from "../../i18n.js";

export default function Dialogs() {
  const {
    modal,
    setModal,
    preferences,
    setPreferences,
    lightbox,
    regions,
    content,
    requiredSelection,
  } = useApp();
  const t = useText();
  const dialogState = useDialogState();
  const ref = useRef();
  useEffect(() => {
    if (!modal) return;
    const dialog = ref.current,
      opener = document.activeElement;
    dialog.showModal();
    document.body.classList.add("overlay-open");
    return () => {
      if (dialog.open) dialog.close();
      document.body.classList.remove("overlay-open");
      opener?.focus?.();
    };
  }, [modal]);
  if (!modal) return null;
  const title = {
    search: t("ui.copy.036"),
    region: translate(
      content,
      preferences?.language || regions.defaultLanguage,
      "ui.regionTitle",
    ),
    profile: t("ui.copy.057"),
    mobile: t("ui.copy.058"),
    cart: t("ui.cart"),
    stores: t("ui.storeLocator"),
    lightbox: t("ui.copy.059"),
  }[modal];
  return (
    <dialog
      ref={ref}
      className={
        modal === "stores"
          ? "store-locator-dialog"
          : modal === "search"
            ? "search-dialog"
            : modal === "region"
              ? "region-dialog"
              : modal === "lightbox"
                ? "lightbox-dialog"
                : "side-dialog"
      }
      aria-labelledby="dialog-title"
      onCancel={(e) => {
        e.preventDefault();
        if (!requiredSelection) ref.current.close();
      }}
      onClose={() => setModal(null)}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          const r = e.currentTarget.getBoundingClientRect();
          if (
            !requiredSelection &&
            (e.clientX < r.left ||
              e.clientX > r.right ||
              e.clientY < r.top ||
              e.clientY > r.bottom)
          )
            ref.current.close();
        }
      }}
    >
      {!requiredSelection && (
        <button
          className="dialog-close icon-button"
          aria-label={plainText(t("ui.copy.035"))}
          onClick={() => ref.current.close()}
        >
          <Icon name="close" />
        </button>
      )}
      <h2 id="dialog-title">
        <RichText value={title} />
      </h2>
      {modal === "search" && <SearchContent {...dialogState} />}
      {modal === "region" && (
        <RegionForm
          regions={regions}
          content={content}
          preferences={preferences}
          onSave={(prefs) => {
            save("hm1864.react.preferences", prefs);
            setPreferences(prefs);
            ref.current.close();
          }}
        />
      )}
      {modal === "profile" && <ProfileContent {...dialogState} />}
      {modal === "mobile" && <MobileMenuContent />}
      {modal === "cart" && <CartContent />}
      {modal === "stores" && <StoreLocator embedded />}
      {modal === "lightbox" && (
        <Media src={lightbox?.src} alt={lightbox?.alt} />
      )}
    </dialog>
  );
}
