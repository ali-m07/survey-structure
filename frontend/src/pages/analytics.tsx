import Head from "next/head";
import { useTranslation } from "react-i18next";
import { useLocale } from "../i18n/LocaleProvider";
import Link from "next/link";
import { useSurveys } from "../hooks/useSurvey";
export default function Analytics() {
  const { t } = useTranslation("app");
  const { locale, direction } = useLocale();
  const { surveys, error, loading } = useSurveys();
  return (
    <main dir={direction} lang={locale} className="min-h-screen bg-blue-50 p-8">
      <Head>
        <title>
          {t("analytics.title")} | {t("brand")}
        </title>
      </Head>
      <div className="max-w-4xl mx-auto space-y-4">
        <Link href="/surveys">{t("nav.surveys")}</Link>
        <h1 className="text-3xl font-bold">{t("analytics.title")}</h1>
        {error && <p role="alert">{t("common.error")}</p>}
        {loading && <p>{t("common.loading")}</p>}
        {!loading && !error && !surveys.length && <p>{t("surveys.empty")}</p>}
        {surveys.map((s) => (
          <article key={s.id} className="bg-white p-6 rounded shadow">
            <h2>{s.title}</h2>
            <p>
              {t("analytics.responses", { count: s.submission_count || 0 })}
            </p>
            <Link href={`/surveys/${s.id}`}>{t("analytics.open")}</Link>
          </article>
        ))}
      </div>
    </main>
  );
}
