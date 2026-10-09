import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { apiClient, SURVEY_API } from "../services/api";
import { Survey } from "../types/survey";
import { useAuth } from "../hooks/useAuth";
export default function Surveys() {
  const router = useRouter();
  const auth = useAuth();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [tenant, setTenant] = useState("");
  const load = async () => {
    try {
      const data = await apiClient.get<Survey[] | { results: Survey[] }>(
        `${SURVEY_API}/surveys/`,
      );
      setSurveys(Array.isArray(data) ? data : data.results);
      setError("");
    } catch (e) {
      setError(String(e));
    }
  };
  useEffect(() => {
    if (!auth.loading) {
      if (!auth.authenticated) router.replace("/login");
      else {
        setTenant(localStorage.getItem("tenant") || "");
        load();
      }
    }
  }, [auth.loading, auth.authenticated]);
  return (
    <main dir="rtl" className="min-h-screen bg-blue-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <nav className="flex flex-wrap gap-4">
          <Link href="/">خانه</Link>
          <Link href="/analytics">تحلیل</Link>
          <Link href="/templates">قالب‌ها</Link>
          <button onClick={() => auth.logout()}>خروج</button>
        </nav>
        <h1 className="text-3xl font-bold">پرسشنامه‌ها</h1>
        <form
          className="flex flex-wrap gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            localStorage.setItem("tenant", tenant);
            load();
          }}
        >
          <label>
            سازمان{" "}
            <input
              value={tenant}
              onChange={(e) => setTenant(e.target.value)}
              className="border p-2 rounded"
            />
          </label>
          <button className="border p-2 rounded">انتخاب</button>
          <Link href="/team">اعضای سازمان</Link>
        </form>
        {error && (
          <p role="alert" className="text-red-700 bg-white p-4">
            {error}
          </p>
        )}
        <form
          className="bg-white p-6 rounded shadow space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            const form = new FormData(e.currentTarget);
            try {
              const s = await apiClient.post<Survey>(`${SURVEY_API}/surveys/`, {
                title: form.get("title"),
                description: form.get("description"),
                settings: { language: "fa" },
              });
              router.push(`/surveys/${s.id}/edit`);
            } catch (e) {
              setError(String(e));
            } finally {
              setBusy(false);
            }
          }}
        >
          <h2 className="text-xl font-semibold">پرسشنامه جدید</h2>
          <label className="block">
            عنوان
            <input
              name="title"
              required
              className="block border p-2 rounded w-full"
            />
          </label>
          <label className="block">
            توضیح
            <textarea
              name="description"
              className="block border p-2 rounded w-full"
            />
          </label>
          <button
            disabled={busy}
            className="bg-blue-600 text-white p-3 rounded"
          >
            ساخت پرسشنامه
          </button>
        </form>
        <div className="grid md:grid-cols-2 gap-4">
          {surveys.map((s) => (
            <article
              key={s.id}
              className="bg-white p-6 rounded shadow space-y-3"
            >
              <h2 className="text-xl font-semibold">{s.title}</h2>
              <p>{s.description}</p>
              <p>
                وضعیت: {s.status} · پاسخ‌ها: {s.submission_count || 0}
              </p>
              <div className="flex gap-4">
                <Link href={`/surveys/${s.id}/edit`}>ویرایش</Link>
                <Link href={`/surveys/${s.id}`}>انتشار و گزارش</Link>
              </div>
            </article>
          ))}
        </div>
        {!auth.loading && !surveys.length && !error && (
          <p>پرسشنامه‌ای ثبت نشده است.</p>
        )}
      </div>
    </main>
  );
}
