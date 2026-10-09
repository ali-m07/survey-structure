import { useTranslation } from "react-i18next";
import { languages, Locale, useLocale } from "../i18n/LocaleProvider";
export default function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();
  const { t } = useTranslation("scene");
  return (
    <label className="pn-language">
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
      <span className="sr-only">{t("scene.language")}</span>
      <select
        value={locale}
        onChange={(e) => void setLocale(e.target.value as Locale)}
      >
        {languages.map((language) => (
          <option
            key={language.code}
            value={language.code}
            lang={language.code}
          >
            {language.label}
          </option>
        ))}
      </select>
    </label>
  );
}
