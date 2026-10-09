import Head from "next/head";
import { useTranslation } from "react-i18next";
import { useLocale } from "../../i18n/LocaleProvider";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { apiClient, SURVEY_API } from "../../services/api";
import { Survey } from "../../types/survey";
import { useAuth } from "../../hooks/useAuth";
import { Webhooks } from "../../components/Webhooks";
export default function ManageSurvey() {
  const { t } = useTranslation("app");
  const { locale, direction } = useLocale();
  const router = useRouter();
  const auth = useAuth();
  const id = router.query.id;
  const [survey, setSurvey] = useState<Survey>();
  const [analytics, setAnalytics] = useState<any>();
  const [participants, setParticipants] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [history, setHistory] = useState<any[]>([]);
  const load = async () => {
    if (!id) return;
    try {
      setSurvey(await apiClient.get(`${SURVEY_API}/surveys/${id}/`));
      const list = auth.canEdit
        ? await apiClient.get<any>(`${SURVEY_API}/participants/?survey=${id}`)
        : [];
      setParticipants(Array.isArray(list) ? list : list.results || []);
    } catch (e) {
      setError(t("common.error"));
    }
  };
  useEffect(() => {
    if (!auth.loading) {
      if (!auth.authenticated) router.replace("/login");
      else load();
    }
  }, [id, auth.loading, auth.authenticated, auth.tenant, auth.canEdit]);
  const action = async (fn: () => Promise<any>) => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await fn();
      await load();
      return result;
    } catch (e) {
      setError(t("common.error"));
    } finally {
      setBusy(false);
    }
  };
  if (!survey)
    return (
      <main dir={direction} lang={locale} className="p-8">
        {error ? t("common.error") : t("common.loading")}{" "}
        <Link href="/surveys">{t("nav.back")}</Link>
      </main>
    );
  const base = `${SURVEY_API}/surveys/${id}`;
  const filters = new URLSearchParams({
    ...(start ? { start } : {}),
    ...(end ? { end } : {}),
  }).toString();
  return (
    <main
      dir={direction}
      lang={locale}
      className="min-h-screen bg-blue-50 p-4 md:p-8"
    >
      <Head>
        <title>
          {survey.title} | {t("brand")}
        </title>
      </Head>
      <div className="max-w-5xl mx-auto space-y-6">
        <nav className="flex gap-4">
          <Link href="/surveys">{t("nav.surveys")}</Link>
          {auth.canEdit && (
            <Link href={`/surveys/${id}/edit`}>{t("manage.builder")}</Link>
          )}
        </nav>
        <h1 className="text-3xl font-bold">{survey.title}</h1>
        <p>{survey.description}</p>
        <p>
          {t("surveys.summary", {
            status: t(`status.${survey.status}`, {
              defaultValue: survey.status,
            }),
            count: survey.submission_count || 0,
          })}
        </p>
        {error && (
          <p role="alert" className="text-red-700 bg-white p-4">
            {t("common.error")}
          </p>
        )}
        {notice && <p role="status">{notice}</p>}
        <fieldset disabled={busy} className="space-y-6">
          {auth.canEdit && (
            <section className="bg-white rounded shadow p-6 space-y-4">
              <h2 className="text-xl font-bold">{t("manage.publish")}</h2>
              <div className="flex flex-wrap gap-4">
                {survey.status === "draft" && (
                  <button
                    className="bg-blue-600 text-white p-3 rounded"
                    onClick={() =>
                      action(() => apiClient.post(`${base}/publish/`, {}))
                    }
                  >
                    {t("manage.publishFixed")}
                  </button>
                )}
                {survey.status === "active" && (
                  <button
                    className="border p-3 rounded"
                    onClick={() => {
                      if (confirm(t("manage.closeConfirm")))
                        action(() => apiClient.post(`${base}/close/`, {}));
                    }}
                  >
                    {t("manage.close")}
                  </button>
                )}
                <button
                  className="border p-3 rounded"
                  onClick={() =>
                    action(async () => {
                      const copy = await apiClient.post<Survey>(
                        `${base}/duplicate/`,
                        {},
                      );
                      router.push(`/surveys/${copy.id}/edit`);
                    })
                  }
                >
                  {t("manage.duplicate")}
                </button>
              </div>
              {survey.status === "active" &&
                !survey.settings?.invitation_only && (
                  <>
                    <label className="block">
                      {t("manage.responseLink")}
                      <input
                        readOnly
                        className="border p-3 rounded w-full"
                        value={
                          typeof window === "undefined"
                            ? ""
                            : `${window.location.origin}/survey/${id}`
                        }
                      />
                    </label>
                    <div className="flex gap-4">
                      <Link href={`/survey/${id}`} target="_blank">
                        {t("manage.openPublic")}
                      </Link>
                      <button
                        onClick={() =>
                          action(() =>
                            apiClient.download(
                              `${base}/qr/`,
                              `survey-${id}-qr.png`,
                            ),
                          )
                        }
                      >
                        {t("manage.qr")}
                      </button>
                    </div>
                  </>
                )}
              {survey.settings?.invitation_only && (
                <p>{t("manage.inviteOnly")}</p>
              )}
            </section>
          )}
          {auth.canEdit && (
            <section className="bg-white rounded shadow p-6 space-y-4">
              <h2 className="text-xl font-bold">{t("manage.invite")}</h2>
              <form
                className="flex flex-wrap gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = new FormData(e.currentTarget);
                  action(() =>
                    apiClient.post(`${SURVEY_API}/participants/`, {
                      survey: survey.id,
                      email: form.get("email"),
                      is_anonymous: form.get("anonymous") === "on",
                    }),
                  );
                }}
              >
                <label>
                  {t("manage.email")}
                  <input
                    name="email"
                    type="email"
                    required
                    className="border p-2 block"
                  />
                </label>
                <label>
                  <input name="anonymous" type="checkbox" />{" "}
                  {t("manage.anonymous")}
                </label>
                <button className="border p-3 rounded">
                  {t("manage.addParticipant")}
                </button>
              </form>
              <div className="space-y-3">
                {participants.map((p) => (
                  <div key={p.id} className="border p-3 rounded space-y-2">
                    <p>
                      {p.email} ·{" "}
                      {p.completed_at
                        ? t("manage.completed")
                        : p.delivery_status
                          ? t(`status.${p.delivery_status}`, {
                              defaultValue: p.delivery_status,
                            })
                          : t("manage.registered")}
                    </p>
                    <button
                      className="border p-2 rounded"
                      onClick={() =>
                        action(async () => {
                          const result = await apiClient.post<any>(
                            `${SURVEY_API}/participants/${p.id}/send_invitation/`,
                            {},
                          );
                          setNotice(
                            t("manage.delivery", {
                              status: t(`status.${result.status}`, {
                                defaultValue: result.status,
                              }),
                            }),
                          );
                        })
                      }
                    >
                      {t("manage.send")}
                    </button>
                    {p.token && (
                      <label className="block text-sm">
                        {t("manage.personalLink")}
                        <input
                          className="border p-2 w-full"
                          readOnly
                          value={
                            typeof window === "undefined"
                              ? ""
                              : `${window.location.origin}/survey/${id}?token=${encodeURIComponent(p.token)}`
                          }
                        />
                      </label>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
          <section className="bg-white rounded shadow p-6 space-y-4">
            <h2 className="text-xl font-bold">{t("manage.analytics")}</h2>
            <div className="flex flex-wrap gap-3">
              <label>
                {t("manage.startDate")}
                <input
                  type="date"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className="border p-2 block"
                />
              </label>
              <label>
                {t("manage.endDate")}
                <input
                  type="date"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  className="border p-2 block"
                />
              </label>
            </div>
            <button
              className="border p-3 rounded"
              onClick={() =>
                action(async () =>
                  setAnalytics(
                    await apiClient.get(`${base}/analytics/?${filters}`),
                  ),
                )
              }
            >
              {t("manage.getReport")}
            </button>
            <div className="flex flex-wrap gap-4">
              {["csv", "xlsx", "pdf"].map((format) => (
                <button
                  key={format}
                  onClick={() =>
                    action(() =>
                      apiClient.download(
                        `${base}/export/?format=${format}&${filters}`,
                        `survey-${id}.${format}`,
                      ),
                    )
                  }
                >
                  {t("manage.export", { format: format.toUpperCase() })}
                </button>
              ))}
            </div>
            {analytics && (
              <>
                <p>
                  {t("manage.responseCount", {
                    count: analytics.total_responses,
                  })}
                </p>
                {analytics.questions.map((q: any) => (
                  <article key={q.id} className="border p-4 rounded">
                    <h3 className="font-bold">{q.text}</h3>
                    <p>
                      {t("manage.count", { count: q.count })}
                      {q.average !== undefined
                        ? t("manage.average", { value: q.average })
                        : ""}
                      {q.nps !== undefined ? ` · NPS: ${q.nps}` : ""}
                    </p>
                    {q.keywords && (
                      <p className="text-sm">
                        {t("manage.keywords")}{" "}
                        {Object.entries(q.keywords)
                          .map(([word, count]) => `${word}: ${count}`)
                          .join(" · ")}
                      </p>
                    )}
                    <div className="space-y-2">
                      {Object.entries(q.distribution || {}).map(
                        ([label, count]) => (
                          <div key={label}>
                            <div className="flex justify-between">
                              <span className="break-all">{label}</span>
                              <span>{String(count)}</span>
                            </div>
                            <progress
                              className="w-full"
                              value={Number(count)}
                              max={Math.max(1, q.count)}
                            />
                          </div>
                        ),
                      )}
                    </div>
                  </article>
                ))}
              </>
            )}
          </section>
          <section className="bg-white p-6 rounded shadow space-y-3">
            <h2 className="text-xl font-bold">{t("manage.history")}</h2>
            <button
              onClick={() =>
                action(async () =>
                  setHistory(await apiClient.get(`${base}/history/`)),
                )
              }
            >
              {t("manage.getHistory")}
            </button>
            {history.map((event) => (
              <p key={event.id}>
                {t(`history.${event.action}`, { defaultValue: event.action })} ·{" "}
                {new Date(event.created_at).toLocaleString(
                  locale === "fa"
                    ? "fa-IR"
                    : locale === "fr"
                      ? "fr-FR"
                      : "en-GB",
                )}
              </p>
            ))}
          </section>
          {auth.canEdit && <Webhooks surveyId={survey.id} />}
        </fieldset>
      </div>
    </main>
  );
}
