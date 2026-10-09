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
import SurveyScene from "../components/SurveyScene";
export default function Product() {
  const { t } = useTranslation("public");
  const { locale, direction } = useLocale();
  return (
    <div className="pn-site" dir={direction} lang={locale}>
      <Head>
        <title>{t("product.seoTitle")}</title>
        <meta name="description" content={t("product.seoDescription")} />
      </Head>
      <PublicHeader />
      <main>
        <section className="pn-hero pn-product-hero">
          <div className="pn-hero-copy">
            <h1>
              {t("product.heroStart")}
              <br />
              <span>{t("product.heroAccent")}</span>
            </h1>
            <p>{t("product.heroDescription")}</p>
            <Link href="/login" className="pn-button">
              {t("common.login")}
              <Arrow />
            </Link>
          </div>
          <SurveyScene />
        </section>
        <section className="pn-product-section">
          <h2>
            {t("product.typesStart")}
            <br />
            {t("product.typesEnd")}
          </h2>
          <div>
            <p>{t("product.typesDescription")}</p>
            <div className="pn-question-types">
              {[
                t("product.types.text"),
                t("product.types.email"),
                t("product.types.number"),
                t("product.types.single"),
                t("product.types.multiple"),
                t("product.types.boolean"),
                t("product.types.rating"),
                t("product.types.scale"),
                "NPS",
                t("product.types.matrix"),
                t("product.types.ranking"),
                t("product.types.date"),
              ].map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
          </div>
        </section>
        <section id="logic" className="pn-story">
          <div>
            <h2>
              {t("product.logicStart")}
              <br />
              {t("product.logicEnd")}
            </h2>
            <p>{t("product.logicDescription")}</p>
          </div>
          <div className="pn-flow">
            <div className="pn-flow-question">{t("product.flow.question")}</div>
            <div className="pn-flow-paths">
              <div>
                <span>{t("product.flow.experience")}</span>
                <p>{t("product.flow.experienceQuestions")}</p>
              </div>
              <div>
                <span>{t("product.flow.quality")}</span>
                <p>{t("product.flow.qualityQuestions")}</p>
              </div>
            </div>
            <small>{t("product.flow.caption")}</small>
          </div>
        </section>
        <section className="pn-workflow">
          <h2>
            {t("product.detailsStart")}
            <br />
            {t("product.detailsEnd")}
          </h2>
          <div className="pn-workflow-list">
            <article>
              <h3>{t("product.details.createTitle")}</h3>
              <p>{t("product.details.createDescription")}</p>
            </article>
            <article>
              <h3>{t("product.details.shareTitle")}</h3>
              <p>{t("product.details.shareDescription")}</p>
            </article>
            <article>
              <h3>{t("product.details.analyseTitle")}</h3>
              <p>{t("product.details.analyseDescription")}</p>
            </article>
            <article>
              <h3>{t("product.details.rolesTitle")}</h3>
              <p>{t("product.details.rolesDescription")}</p>
            </article>
          </div>
        </section>
        <FinalCTA />
      </main>
      <PublicFooter />
    </div>
  );
}
