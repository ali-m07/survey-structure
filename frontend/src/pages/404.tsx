import Head from "next/head";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useLocale } from "../i18n/LocaleProvider";
import { Arrow, PublicHeader, PublicFooter } from "../components/PublicSite";
export default function NotFound() {
  const { t } = useTranslation("public");
  const { locale, direction } = useLocale();
  return (
    <div className="pn-site" dir={direction} lang={locale}>
      <Head>
        <title>{t("notFound.title")} | Porsnama</title>
      </Head>
      <PublicHeader />
      <main className="pn-not-found">
        <h1>{t("notFound.title")}</h1>
        <p>{t("notFound.description")}</p>
        <Link href="/" className="pn-button">
          {t("notFound.home")}
          <Arrow />
        </Link>
      </main>
      <PublicFooter />
    </div>
  );
}
