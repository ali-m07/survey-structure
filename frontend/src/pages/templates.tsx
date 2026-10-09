import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { apiClient, SURVEY_API } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { useSurveys } from "../hooks/useSurvey";
export default function Templates() {
  const auth = useAuth();
  const [templates, setTemplates] = useState<any[]>([]);
  const [error, setError] = useState("");
  const { surveys } = useSurveys();
  const router = useRouter();
  const load = async () => {
    try {
      setTemplates(await apiClient.get(`${SURVEY_API}/templates/`));
    } catch (e) {
      setError(String(e));
    }
  };
  useEffect(() => {
    if (!auth.loading) {
      if (!auth.authenticated) router.replace("/login");
      else load();
    }
  }, [auth.loading, auth.authenticated, auth.tenant]);
  return (
    <main dir="rtl" className="min-h-screen bg-blue-50 p-8">
      <div className="max-w-4xl mx-auto space-y-4">
        <Link href="/surveys">پرسشنامه‌ها</Link>
        <h1 className="text-3xl font-bold">کتابخانه قالب</h1>
        {error && <p role="alert">{error}</p>}
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
                setError(String(e));
              }
            }}
          >
            <label className="block">
              نام قالب
              <input name="name" className="border p-2 block" required />
            </label>
            <label className="block">
              پرسشنامه
              <select name="survey" className="border p-2 block" required>
                {surveys.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </label>
            <button className="border p-2">ذخیره نسخه به عنوان قالب</button>
          </form>
        )}
        {templates.map((t) => (
          <article key={t.id} className="bg-white p-6 rounded">
            <h2 className="text-xl">{t.name}</h2>
            {auth.canEdit && (
              <button
                className="border p-2 mt-3"
                onClick={async () => {
                  try {
                    const s = await apiClient.post<any>(
                      `${SURVEY_API}/templates/${t.id}/use/`,
                      {},
                    );
                    router.push(`/surveys/${s.id}/edit`);
                  } catch (e) {
                    setError(String(e));
                  }
                }}
              >
                ساخت پرسشنامه از قالب
              </button>
            )}
          </article>
        ))}
      </div>
    </main>
  );
}
