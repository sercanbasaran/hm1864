import React from "react";
import { useText } from "../../hooks/useText.js";
import RichText from "../../RichText.jsx";

export default function ProfileContent({
  showPassword,
  setShowPassword,
  loginStatus,
  setLoginStatus,
}) {
  const t = useText();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setLoginStatus(t("ui.copy.050"));
      }}
    >
      <p>
        <RichText value={t("ui.copy.012")} />
      </p>
      <label>
        <RichText value={t("ui.copy.013")} />
        <input type="email" required autoComplete="email" />
      </label>
      <label>
        <RichText value={t("ui.copy.014")} />
        <input
          type={showPassword ? "text" : "password"}
          minLength={6}
          required
          autoComplete="current-password"
        />
      </label>
      <button type="button" onClick={() => setShowPassword((p) => !p)}>
        {showPassword ? t("ui.hide") : t("ui.show")}
      </button>
      <button className="button">
        <RichText value={t("ui.copy.015")} />
      </button>
      <p role="status">{loginStatus}</p>
      <a href="/hesabim/sifremi-unuttum.html">
        <RichText value={t("ui.copy.017")} />
      </a>
      <hr />
      <a className="button" href="/hesabim/kayit.html">
        <RichText value={t("ui.copy.016")} />
      </a>
    </form>
  );
}
