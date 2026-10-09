import Link from "next/link";
import { useSurveys } from "../hooks/useSurvey";
export default function Analytics() {
  const { surveys, error, loading } = useSurveys();
  return (
    <main dir="rtl" className="min-h-screen bg-blue-50 p-8">
      <div className="max-w-4xl mx-auto space-y-4">
        <Link href="/surveys">پرسشنامه‌ها</Link>
        <h1 className="text-3xl font-bold">تحلیل پرسشنامه‌ها</h1>
        {error && <p role="alert">{String(error)}</p>}
        {loading && <p>در حال دریافت…</p>}
        {surveys.map((s) => (
          <article key={s.id} className="bg-white p-6 rounded shadow">
            <h2>{s.title}</h2>
            <p>پاسخ‌ها: {s.submission_count || 0}</p>
            <Link href={`/surveys/${s.id}`}>مشاهده تحلیل و دریافت خروجی</Link>
          </article>
        ))}
      </div>
    </main>
  );
}
