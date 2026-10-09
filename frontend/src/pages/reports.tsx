import Head from "next/head";
import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useLocale } from "../i18n/LocaleProvider";
import { useSurveys } from "../hooks/useSurvey";
export default function Reports() {
  const { t } = useTranslation("app");
  const { locale, direction } = useLocale();
  const { surveys, error, loading } = useSurveys();
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(surveys.length / 8));
  const currentPage = Math.min(page, totalPages);
  return (
    <main
      dir={direction}
      lang={locale}
      className="min-h-screen bg-blue-50 p-4 md:p-8"
    >
      <Head>
        <title>
          {t("reports.title")} | {t("brand")}
        </title>
        <meta name="description" content={t("reports.description")} />
      </Head>
      <div className="max-w-5xl mx-auto space-y-6">
        <nav className="flex flex-wrap gap-4">
          <Link href="/workspace">{t("nav.workspace")}</Link>
          <Link href="/surveys">{t("nav.surveys")}</Link>
          <Link href="/analytics">{t("nav.analytics")}</Link>
        </nav>
        <h1 className="text-3xl font-bold">{t("reports.title")}</h1>
        <p>{t("reports.description")}</p>
        {loading && <p role="status">{t("common.loading")}</p>}
        {error && <p role="alert">{t("common.error")}</p>}
        {!loading && !error && !surveys.length && <p>{t("surveys.empty")}</p>}
        <div className="grid gap-4 md:grid-cols-2">
          {surveys
            .slice((currentPage - 1) * 8, currentPage * 8)
            .map((survey) => (
              <article
                key={survey.id}
                className="bg-white p-6 rounded shadow space-y-3"
              >
                <h2 className="text-xl font-semibold">{survey.title}</h2>
                <p>
                  {t("analytics.responses", {
                    count: survey.submission_count || 0,
                  })}
                </p>
                <Link href={`/surveys/${survey.id}`}>{t("reports.open")}</Link>
              </article>
            ))}
        </div>
        {totalPages > 1 && (
          <nav
            aria-label={t("pagination.label")}
            className="flex flex-wrap gap-4 items-center"
          >
            <button
              disabled={currentPage <= 1}
              onClick={() => setPage(currentPage - 1)}
            >
              {t("pagination.previous")}
            </button>
            <span aria-live="polite">
              {t("pagination.page", {
                current: currentPage,
                total: totalPages,
              })}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setPage(currentPage + 1)}
            >
              {t("pagination.next")}
            </button>
          </nav>
        )}
      </div>
    </main>
  );
}
