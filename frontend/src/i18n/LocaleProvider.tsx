import { ReactNode, useEffect, useMemo } from "react";
import { createInstance } from "i18next";
import { I18nextProvider } from "react-i18next";
import { useRouter } from "next/router";
import faPublic from "./locales/fa/public.json";
import enPublic from "./locales/en/public.json";
import frPublic from "./locales/fr/public.json";
import faApp from "./locales/fa/app.json";
import enApp from "./locales/en/app.json";
import frApp from "./locales/fr/app.json";
import faSurvey from "./locales/fa/survey.json";
import enSurvey from "./locales/en/survey.json";
import frSurvey from "./locales/fr/survey.json";
import faScene from "./locales/fa/scene.json";
import enScene from "./locales/en/scene.json";
import frScene from "./locales/fr/scene.json";
export type Locale = "fa" | "en" | "fr";
export const languages: { code: Locale; label: string }[] = [
  { code: "fa", label: "فارسی" },
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
];
export function useLocale() {
  const router = useRouter();
  const locale: Locale =
    router.locale === "en" || router.locale === "fr" ? router.locale : "fa";
  return {
    locale,
    direction: (locale === "fa" ? "rtl" : "ltr") as "rtl" | "ltr",
    setLocale: async (next: Locale) => {
      document.cookie = `NEXT_LOCALE=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
      await router.push(
        { pathname: router.pathname, query: router.query },
        router.asPath,
        { locale: next, scroll: false },
      );
    },
  };
}
export function LocaleProvider({ children }: { children: ReactNode }) {
  const { locale, direction } = useLocale();
  const instance = useMemo(() => {
    const i18n = createInstance();
    void i18n.init({
      lng: locale,
      supportedLngs: ["fa", "en", "fr"],
      fallbackLng: "fa",
      initAsync: false,
      resources: {
        fa: { public: faPublic, app: faApp, survey: faSurvey, scene: faScene },
        en: { public: enPublic, app: enApp, survey: enSurvey, scene: enScene },
        fr: { public: frPublic, app: frApp, survey: frSurvey, scene: frScene },
      },
      defaultNS: "public",
      interpolation: { escapeValue: false },
      react: { useSuspense: false },
    });
    return i18n;
  }, [locale]);
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = direction;
  }, [locale, direction]);
  return (
    <I18nextProvider i18n={instance}>
      <div lang={locale} dir={direction} className="pn-locale-root">
        {children}
      </div>
    </I18nextProvider>
  );
}
