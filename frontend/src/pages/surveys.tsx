import Head from "next/head";
import { useTranslation } from "react-i18next";
import { useLocale } from "../i18n/LocaleProvider";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { apiClient, SURVEY_API } from "../services/api";
import { Survey } from "../types/survey";
import { useAuth } from "../hooks/useAuth";
export default function Surveys() {
  const { t } = useTranslation("app");
  const { locale, direction } = useLocale();
  const router = useRouter();
  const auth = useAuth();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const filtered = surveys.filter((survey) =>
    `${survey.title} ${survey.description || ""}`
      .toLocaleLowerCase(locale)
      .includes(search.toLocaleLowerCase(locale)),
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / 8));
  const currentPage = Math.min(page, totalPages);
  const load = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get<Survey[] | { results: Survey[] }>(
        `${SURVEY_API}/surveys/`,
      );
      setSurveys(Array.isArray(data) ? data : data.results);
      setError("");
    } catch (e) {
      setError(t("common.error"));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!auth.loading) {
      if (!auth.authenticated) router.replace("/login");
      else {
        load();
      }
    }
  }, [auth.loading, auth.authenticated, auth.tenant]);
  return (
    <main
      dir={direction}
      lang={locale}
      className="min-h-screen bg-blue-50 p-4 md:p-8"
    >
      <Head>
        <title>
          {t("nav.surveys")} | {t("brand")}
        </title>
      </Head>
      <div className="max-w-5xl mx-auto space-y-6">
        <nav className="flex flex-wrap gap-4">
          <Link href="/workspace">{t("nav.workspace")}</Link>
          <Link href="/analytics">{t("nav.analytics")}</Link>
          <Link href="/templates">{t("nav.templates")}</Link>
          <button onClick={() => auth.logout()}>{t("nav.logout")}</button>
        </nav>
        <h1 className="text-3xl font-bold">{t("nav.surveys")}</h1>
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2">
            {t("surveys.organization")}
            <select
              value={auth.tenant || ""}
              onChange={(e) => auth.switchTenant(e.target.value)}
              className="border p-2 rounded bg-white"
              disabled={auth.loading || !auth.memberships.length}
            >
              {auth.memberships.map((membership) => (
                <option key={membership.tenant_id} value={membership.tenant_id}>
                  {membership.tenant_id}
                </option>
              ))}
            </select>
          </label>
          <span className="text-sm text-slate-600">
            {auth.isAdmin
              ? t("roles.admin")
              : auth.canEdit
                ? t("roles.editor")
                : t("roles.viewer")}
          </span>
          {auth.isAdmin && <Link href="/team">{t("surveys.members")}</Link>}
        </div>
        {error && (
          <p role="alert" className="text-red-700 bg-white p-4">
            {t("common.error")}
          </p>
        )}
        {auth.canEdit && (
          <form
            className="bg-white p-6 rounded shadow space-y-3"
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              const form = new FormData(e.currentTarget);
              try {
                const s = await apiClient.post<Survey>(
                  `${SURVEY_API}/surveys/`,
                  {
                    title: form.get("title"),
                    description: form.get("description"),
                    settings: { language: locale },
                  },
                );
                router.push(`/surveys/${s.id}/edit`);
              } catch (e) {
                setError(t("common.error"));
              } finally {
                setBusy(false);
              }
            }}
          >
            <h2 className="text-xl font-semibold">{t("surveys.new")}</h2>
            <label className="block">
              {t("surveys.title")}
              <input
                name="title"
                required
                className="block border p-2 rounded w-full"
              />
            </label>
            <label className="block">
              {t("surveys.description")}
              <textarea
                name="description"
                className="block border p-2 rounded w-full"
              />
            </label>
            <button
              disabled={busy}
              className="bg-blue-600 text-white p-3 rounded"
            >
              {t("surveys.create")}
            </button>
          </form>
        )}
        <label className="block space-y-2">
          {t("surveys.search")}
          <input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            className="block border p-3 rounded w-full bg-white"
          />
        </label>
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.slice((currentPage - 1) * 8, currentPage * 8).map((s) => (
            <article
              key={s.id}
              className="bg-white p-6 rounded shadow space-y-3"
            >
              <h2 className="text-xl font-semibold">{s.title}</h2>
              <p>{s.description}</p>
              <p>
                {t("surveys.summary", {
                  status: t(`status.${s.status}`, { defaultValue: s.status }),
                  count: s.submission_count || 0,
                })}
              </p>
              <div className="flex gap-4">
                {auth.canEdit && (
                  <Link href={`/surveys/${s.id}/edit`}>
                    {t("surveys.edit")}
                  </Link>
                )}
                <Link href={`/surveys/${s.id}`}>
                  {auth.canEdit
                    ? t("surveys.publishReport")
                    : t("surveys.report")}
                </Link>
              </div>
            </article>
          ))}
        </div>
        {!!surveys.length && !filtered.length && (
          <p>{t("surveys.noMatches")}</p>
        )}
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
        {loading && <p role="status">{t("common.loading")}</p>}
        {!auth.loading && !loading && !surveys.length && !error && (
          <p>{t("surveys.empty")}</p>
        )}
      </div>
    </main>
  );
}
