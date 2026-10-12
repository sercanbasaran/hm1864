import React, { useState } from "react";
import { save } from "../../utils/storage.js";
import RichText from "../../RichText.jsx";
import { plainText } from "../../formatted-text.js";
import { countryDefaults } from "../../market.js";
import { translate, formatText } from "../../i18n.js";

export default function RegionForm({ regions, content, preferences, onSave }) {
  const initialCountry = preferences?.country || regions.defaultCountry;
  const [group, setGroup] = useState(
    preferences?.group || countryDefaults(regions, initialCountry).group,
  );
  const [country, setCountry] = useState(initialCountry);
  const [countryName, setCountryName] = useState(
    preferences?.countryName || "",
  );
  const [language, setLanguage] = useState(
    preferences?.language || countryDefaults(regions, initialCountry).language,
  );
  const [currency, setCurrency] = useState(
    preferences?.currency || countryDefaults(regions, initialCountry).currency,
  );
  const market = regions.groups.find((g) => g.id === group);
  const selectCountry = (code) => {
    const defaults = countryDefaults(regions, code);
    setCountry(code);
    setLanguage(defaults.language);
    setCurrency(defaults.currency);
    setCountryName("");
  };
  const languageOption = (code) => (
    <option value={code} key={code}>
      {regions.languages.find((l) => l.code === code)?.name || code}
    </option>
  );
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({
          group,
          country,
          language,
          currency,
          ...(country === "OTHER" ? { countryName: countryName.trim() } : {}),
        });
      }}
    >
      <label>
        <RichText value={translate(content, language, "ui.marketGroup")} />
        <select
          name="group"
          value={group}
          onChange={(e) => {
            const next = regions.groups.find((g) => g.id === e.target.value);
            setGroup(next.id);
            selectCountry(next.countries[0]);
          }}
        >
          {regions.groups.map((g) => (
            <option value={g.id} key={g.id}>
              {plainText(translate(content, language, "region.group." + g.id))}
            </option>
          ))}
        </select>
      </label>
      <label>
        <RichText value={translate(content, language, "ui.country")} />
        <select
          name="country"
          value={country}
          onChange={(e) => selectCountry(e.target.value)}
        >
          {market.countries.map((code) => (
            <option value={code} key={code}>
              {plainText(
                translate(content, language, "region.country." + code),
              )}
            </option>
          ))}
        </select>
      </label>
      {country === "OTHER" && (
        <label>
          <RichText
            value={translate(content, language, "ui.otherCountryName")}
          />
          <input
            name="countryName"
            value={countryName}
            onChange={(e) => setCountryName(e.target.value)}
            maxLength="100"
            required
          />
        </label>
      )}
      <label>
        <RichText value={translate(content, language, "ui.language")} />
        <select
          name="language"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <optgroup
            label={translate(content, language, "region.group." + group)}
          >
            {market.supportedLanguages.map(languageOption)}
          </optgroup>
          <optgroup label={translate(content, language, "ui.allLanguages")}>
            {regions.languages
              .filter((l) => !market.supportedLanguages.includes(l.code))
              .map((l) => languageOption(l.code))}
          </optgroup>
        </select>
      </label>
      <label>
        <RichText value={translate(content, language, "ui.currency")} />
        <select
          name="currency"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
        >
          <optgroup
            label={translate(content, language, "region.group." + group)}
          >
            {market.currencies.map((code) => (
              <option value={code} key={code}>
                {code}
              </option>
            ))}
          </optgroup>
          <optgroup label={translate(content, language, "ui.allCurrencies")}>
            {regions.currencies
              .filter((code) => !market.currencies.includes(code))
              .map((code) => (
                <option value={code} key={code}>
                  {code}
                </option>
              ))}
          </optgroup>
        </select>
      </label>
      <p className="form-note">
        {formatText(content, language, "ui.marketRecommendations", {
          languages: market.supportedLanguages
            .map((code) => regions.languages.find((l) => l.code === code)?.name)
            .join(" / "),
          currencies: market.currencies.join(" / "),
        })}
      </p>
      <p className="form-note">
        <RichText value={translate(content, language, "ui.translationNote")} />
      </p>
      <p className="form-note">
        <RichText value={translate(content, language, "ui.currencyNote")} />
      </p>
      <button className="button" type="submit">
        <RichText value={translate(content, language, "ui.save")} />
      </button>
    </form>
  );
}
