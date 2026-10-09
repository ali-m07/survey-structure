import { useLocale } from "../i18n/LocaleProvider";
import { useTranslation } from "react-i18next";
import Head from "next/head";
import Link from "next/link";
import {
  Arrow,
  FinalCTA,
  PublicFooter,
  PublicHeader,
} from "../components/PublicSite";
export default function About() {
  const { t } = useTranslation("public");
  const { locale, direction } = useLocale();
  return (
    <div className="pn-site" dir={direction} lang={locale}>
      <Head>
        <title>{t("about.seoTitle")}</title>
        <meta name="description" content={t("about.seoDescription")} />
      </Head>
      <PublicHeader />
      <main>
        <section className="pn-about-intro">
          <h1>
            {t("about.heroStart")}
            <br />
            <span>{t("about.heroAccent")}</span>
            <br />
            {t("about.heroEnd")}
          </h1>
          <div className="pn-about-mark" aria-hidden="true">
            <div>{t("about.mark")}</div>
            <div>{t("about.mark")}</div>
            <div>{t("about.mark")}</div>
          </div>
        </section>
        <section className="pn-about-letter">
          <h2>{t("about.letterTitle")}</h2>
          <div>
            <p>{t("about.letterFirst")}</p>
            <p>{t("about.letterSecond")}</p>
            <p>{t("about.letterThird")}</p>
            <Link href="/product" className="pn-text-link">
              {t("about.productLink")}
              <Arrow />
            </Link>
          </div>
        </section>
        <section className="pn-principles">
          <h2>
            {t("about.principlesStart")}
            <br />
            {t("about.principlesEnd")}
          </h2>
          <article>
            <h3>{t("about.clarityTitle")}</h3>
            <p>{t("about.clarityDescription")}</p>
          </article>
          <article>
            <h3>{t("about.respectTitle")}</h3>
            <p>{t("about.respectDescription")}</p>
          </article>
          <article>
            <h3>{t("about.accessTitle")}</h3>
            <p>{t("about.accessDescription")}</p>
          </article>
        </section>
        <FinalCTA />
      </main>
      <PublicFooter />
    </div>
  );
}
