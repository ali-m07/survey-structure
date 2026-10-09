import Head from "next/head";
import { useTranslation } from "react-i18next";
import { useLocale } from "../i18n/LocaleProvider";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { apiClient, SURVEY_API } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { useSurveys } from "../hooks/useSurvey";
export default function Templates() {
  const { t } = useTranslation("app");
  const { locale, direction } = useLocale();
  const auth = useAuth();
  const [templates, setTemplates] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const { surveys } = useSurveys();
  const router = useRouter();
  const load = async () => {
    setLoading(true);
    try {
      setTemplates(await apiClient.get(`${SURVEY_API}/templates/`));
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
      else load();
    }
  }, [auth.loading, auth.authenticated, auth.tenant]);
  return (
    <main dir={direction} lang={locale} className="min-h-screen bg-blue-50 p-8">
      <Head>
        <title>
          {t("templates.title")} | {t("brand")}
        </title>
      </Head>
      <div className="max-w-4xl mx-auto space-y-4">
        <Link href="/surveys">{t("nav.surveys")}</Link>
        <h1 className="text-3xl font-bold">{t("templates.title")}</h1>
        {error && <p role="alert">{t("common.error")}</p>}
        {auth.canEdit && (
          <form
            className="bg-white p-6 rounded space-y-3"
            onSubmit={async (e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              try {
                await apiClient.post(`${SURVEY_API}/templates/`, {
                  survey: Number(form.get("survey")),
                  name: form.get("name"),
                });
                load();
              } catch (e) {
                setError(t("common.error"));
              }
            }}
          >
            <label className="block">
              {t("templates.name")}
              <input name="name" className="border p-2 block" required />
            </label>
            <label className="block">
              {t("templates.survey")}
              <select name="survey" className="border p-2 block" required>
                {surveys.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </label>
            <button className="border p-2">{t("templates.save")}</button>
          </form>
        )}
        {loading && <p role="status">{t("common.loading")}</p>}
        {!loading && !templates.length && !error && (
          <p>{t("templates.empty")}</p>
        )}
        {templates.map((template) => (
          <article key={template.id} className="bg-white p-6 rounded">
            <h2 className="text-xl">{template.name}</h2>
            {auth.canEdit && (
              <button
                className="border p-2 mt-3"
                onClick={async () => {
                  try {
                    const s = await apiClient.post<any>(
                      `${SURVEY_API}/templates/${template.id}/use/`,
                      {},
                    );
                    router.push(`/surveys/${s.id}/edit`);
                  } catch (e) {
                    setError(t("common.error"));
                  }
                }}
              >
                {t("templates.use")}
              </button>
            )}
          </article>
        ))}
      </div>
    </main>
  );
}
