import Head from "next/head";
import { useTranslation } from "react-i18next";
import { useLocale } from "../i18n/LocaleProvider";
import { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient, SURVEY_API } from "../services/api";
export default function Team() {
  const { t } = useTranslation("app");
  const { locale, direction } = useLocale();
  const [members, setMembers] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const load = async () => {
    setLoading(true);
    try {
      setMembers(await apiClient.get(`${SURVEY_API}/members/`));
      setError("");
    } catch (e) {
      setError(t("common.error"));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);
  return (
    <main dir={direction} lang={locale} className="min-h-screen bg-blue-50 p-8">
      <Head>
        <title>
          {t("surveys.members")} | {t("brand")}
        </title>
      </Head>
      <div className="max-w-4xl mx-auto space-y-4">
        <Link href="/surveys">{t("nav.surveys")}</Link>
        <h1 className="text-3xl font-bold">{t("surveys.members")}</h1>
        {error && <p role="alert">{t("common.error")}</p>}
        <form
          className="bg-white p-6 rounded space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            try {
              await apiClient.post(`${SURVEY_API}/members/`, {
                username: form.get("username"),
                role: form.get("role"),
              });
              load();
            } catch (e) {
              setError(t("common.error"));
            }
          }}
        >
          <label className="block">
            {t("team.username")}
            <input name="username" className="border p-2 block" required />
          </label>
          <label className="block">
            {t("team.role")}
            <select name="role" className="border p-2 block">
              <option value="viewer">{t("roles.viewer")}</option>
              <option value="editor">{t("roles.editor")}</option>
              <option value="admin">{t("team.admin")}</option>
            </select>
          </label>
          <button className="border p-2">{t("team.add")}</button>
        </form>
        {loading && <p role="status">{t("common.loading")}</p>}
        {!loading && !members.length && !error && <p>{t("team.empty")}</p>}
        {members.map((m) => (
          <article
            key={m.id}
            className="bg-white p-4 rounded flex justify-between"
          >
            <p>
              {m.user__username} ·{" "}
              {t(`roles.${m.role}`, { defaultValue: m.role })}
            </p>
            <button
              className="text-red-700"
              onClick={async () => {
                if (!confirm(t("team.removeConfirm"))) return;
                try {
                  await apiClient.delete(`${SURVEY_API}/members/${m.id}/`);
                  load();
                } catch (e) {
                  setError(t("common.error"));
                }
              }}
            >
              {t("team.remove")}
            </button>
          </article>
        ))}
      </div>
    </main>
  );
}
