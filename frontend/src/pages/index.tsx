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
export default function Home() {
  const { t } = useTranslation("public");
  const { locale, direction } = useLocale();
  return (
    <div className="pn-site" dir={direction} lang={locale}>
      <Head>
        <title>{t("home.seoTitle")}</title>
        <meta name="description" content={t("home.seoDescription")} />
      </Head>
      <PublicHeader />
      <main>
        <section className="pn-hero">
          <div className="pn-hero-copy">
            <h1>
              {t("home.heroStart")}
              <br />
              {t("home.heroConnector")} <span>{t("home.heroAccent")}</span>
            </h1>
            <p>
              {t("home.heroIntro")}
              <br />
              {t("home.heroDescription")}
            </p>
            <div className="pn-hero-actions">
              <Link className="pn-button" href="/login">
                {t("common.login")}
                <Arrow />
              </Link>
              <Link className="pn-text-link" href="/product">
                {t("home.discover")}
                <Arrow />
              </Link>
            </div>
            <p className="pn-hero-note">{t("home.heroNote")}</p>
          </div>
          <SurveyScene />
        </section>
        <section
          className="pn-capability-strip"
          aria-label={t("home.capabilitiesLabel")}
        >
          <span>{t("home.capabilities.types")}</span>
          <span>{t("home.capabilities.logic")}</span>
          <span>{t("home.capabilities.mobile")}</span>
          <span>{t("home.capabilities.roles")}</span>
        </section>
        <section className="pn-story">
          <div>
            <h2>
              {t("home.storyStart")}
              <br />
              <span>{t("home.storyAccent")}</span>
            </h2>
            <p>{t("home.storyDescription")}</p>
            <Link href="/product#logic" className="pn-text-link">
              {t("home.logicLink")}
              <Arrow />
            </Link>
          </div>
          <div className="pn-flow" aria-label={t("home.flowLabel")}>
            <div className="pn-flow-question">{t("home.flow.question")}</div>
            <div className="pn-flow-paths">
              <div>
                <span>{t("home.flow.yes")}</span>
                <p>{t("home.flow.experience")}</p>
              </div>
              <div>
                <span>{t("home.flow.no")}</span>
                <p>{t("home.flow.expectations")}</p>
              </div>
            </div>
            <small>{t("home.flow.caption")}</small>
          </div>
        </section>
        <section className="pn-workflow">
          <h2>
            {t("home.workflowStart")}
            <br />
            {t("home.workflowEnd")}
          </h2>
          <div className="pn-workflow-list">
            <article>
              <h3>{t("home.workflow.createTitle")}</h3>
              <p>{t("home.workflow.createDescription")}</p>
            </article>
            <article>
              <h3>{t("home.workflow.shareTitle")}</h3>
              <p>{t("home.workflow.shareDescription")}</p>
            </article>
            <article>
              <h3>{t("home.workflow.analyseTitle")}</h3>
              <p>{t("home.workflow.analyseDescription")}</p>
            </article>
          </div>
        </section>
        <section className="pn-audience">
          <h2>
            {t("home.audienceStart")}
            <br />
            {t("home.audienceEnd")}
          </h2>
          <div>
            <p>
              <strong>{t("home.audience.researchTitle")}</strong>
              <span>{t("home.audience.researchDescription")}</span>
            </p>
            <p>
              <strong>{t("home.audience.productTitle")}</strong>
              <span>{t("home.audience.productDescription")}</span>
            </p>
            <p>
              <strong>{t("home.audience.organisationTitle")}</strong>
              <span>{t("home.audience.organisationDescription")}</span>
            </p>
          </div>
        </section>
        <section id="questions" className="pn-faq">
          <h2>{t("home.faqTitle")}</h2>
          <div>
            {[
              [t("home.faq.signinQuestion"), t("home.faq.signinAnswer")],
              [t("home.faq.rolesQuestion"), t("home.faq.rolesAnswer")],
              [t("home.faq.publishedQuestion"), t("home.faq.publishedAnswer")],
              [t("home.faq.exportsQuestion"), t("home.faq.exportsAnswer")],
            ].map(([q, a]) => (
              <details key={q}>
                <summary>
                  {q}
                  <svg
                    className="pn-faq-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 5v14M5 12h14"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>
        <FinalCTA />
      </main>
      <PublicFooter />
    </div>
  );
}
