import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { apiClient, SURVEY_API } from "../../services/api";
import { Survey } from "../../types/survey";
import { Webhooks } from "../../components/Webhooks";
export default function ManageSurvey() {
  const router = useRouter();
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
      const list = await apiClient.get<any>(
        `${SURVEY_API}/participants/?survey=${id}`,
      );
      setParticipants(Array.isArray(list) ? list : list.results || []);
    } catch (e) {
      setError(String(e));
    }
  };
  useEffect(() => {
    load();
  }, [id]);
  const action = async (fn: () => Promise<any>) => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await fn();
      await load();
      return result;
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  };
  if (!survey)
    return (
      <main dir="rtl" className="p-8">
        {error || "در حال دریافت…"} <Link href="/surveys">بازگشت</Link>
      </main>
    );
  const base = `${SURVEY_API}/surveys/${id}`;
  const filters = new URLSearchParams({
    ...(start ? { start } : {}),
    ...(end ? { end } : {}),
  }).toString();
  return (
    <main dir="rtl" className="min-h-screen bg-blue-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <nav className="flex gap-4">
          <Link href="/surveys">پرسشنامه‌ها</Link>
          <Link href={`/surveys/${id}/edit`}>سازنده و پیش‌نمایش</Link>
        </nav>
        <h1 className="text-3xl font-bold">{survey.title}</h1>
        <p>{survey.description}</p>
        <p>
          وضعیت: {survey.status} · پاسخ‌ها: {survey.submission_count || 0}
        </p>
        {error && (
          <p role="alert" className="text-red-700 bg-white p-4">
            {error}
          </p>
        )}
        {notice && <p role="status">{notice}</p>}
        <fieldset disabled={busy} className="space-y-6">
          <section className="bg-white rounded shadow p-6 space-y-4">
            <h2 className="text-xl font-bold">انتشار</h2>
            <div className="flex flex-wrap gap-4">
              {survey.status === "draft" && (
                <button
                  className="bg-blue-600 text-white p-3 rounded"
                  onClick={() =>
                    action(() => apiClient.post(`${base}/publish/`, {}))
                  }
                >
                  انتشار نسخه ثابت
                </button>
              )}
              {survey.status === "active" && (
                <button
                  className="border p-3 rounded"
                  onClick={() => {
                    if (confirm("دریافت پاسخ بسته شود؟"))
                      action(() => apiClient.post(`${base}/close/`, {}));
                  }}
                >
                  بستن پرسشنامه
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
                ساخت کپی برای ویرایش
              </button>
            </div>
            {survey.status === "active" &&
              !survey.settings?.invitation_only && (
                <>
                  <label className="block">
                    لینک پاسخ‌دهی
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
                      باز کردن لینک عمومی
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
                      دریافت QR
                    </button>
                  </div>
                </>
              )}
            {survey.settings?.invitation_only && (
              <p>
                این پرسشنامه فقط با لینک دعوت اختصاصی باز می‌شود؛ لینک عمومی و
                QR برای پاسخ‌دهی کافی نیست.
              </p>
            )}
          </section>
          <section className="bg-white rounded shadow p-6 space-y-4">
            <h2 className="text-xl font-bold">دعوت شرکت‌کننده</h2>
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
                ایمیل
                <input
                  name="email"
                  type="email"
                  required
                  className="border p-2 block"
                />
              </label>
              <label>
                <input name="anonymous" type="checkbox" /> پاسخ ناشناس
              </label>
              <button className="border p-3 rounded">ثبت شرکت‌کننده</button>
            </form>
            <div className="space-y-3">
              {participants.map((p) => (
                <div key={p.id} className="border p-3 rounded space-y-2">
                  <p>
                    {p.email} ·{" "}
                    {p.completed_at
                      ? "تکمیل شده"
                      : p.delivery_status || "ثبت شده"}
                  </p>
                  <button
                    className="border p-2 rounded"
                    onClick={() =>
                      action(async () => {
                        const result = await apiClient.post<any>(
                          `${SURVEY_API}/participants/${p.id}/send_invitation/`,
                          {},
                        );
                        setNotice(`وضعیت ارسال: ${result.status}`);
                      })
                    }
                  >
                    ارسال دعوت / یادآوری
                  </button>
                  {p.token && (
                    <label className="block text-sm">
                      لینک اختصاصی
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
          <section className="bg-white rounded shadow p-6 space-y-4">
            <h2 className="text-xl font-bold">تحلیل پاسخ‌ها</h2>
            <div className="flex flex-wrap gap-3">
              <label>
                از تاریخ
                <input
                  type="date"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className="border p-2 block"
                />
              </label>
              <label>
                تا تاریخ
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
              دریافت گزارش
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
                  خروجی {format.toUpperCase()}
                </button>
              ))}
            </div>
            {analytics && (
              <>
                <p>تعداد پاسخ: {analytics.total_responses}</p>
                {analytics.questions.map((q: any) => (
                  <article key={q.id} className="border p-4 rounded">
                    <h3 className="font-bold">{q.text}</h3>
                    <p>
                      پاسخ: {q.count}
                      {q.average !== undefined
                        ? ` · میانگین: ${q.average}`
                        : ""}
                      {q.nps !== undefined ? ` · NPS: ${q.nps}` : ""}
                    </p>
                    {q.keywords && (
                      <p className="text-sm">
                        واژه‌های پرتکرار:{" "}
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
            <h2 className="text-xl font-bold">تاریخچه تغییرات</h2>
            <button
              onClick={() =>
                action(async () =>
                  setHistory(await apiClient.get(`${base}/history/`)),
                )
              }
            >
              دریافت تاریخچه
            </button>
            {history.map((event) => (
              <p key={event.id}>
                {event.action} ·{" "}
                {new Date(event.created_at).toLocaleString("fa-IR")}
              </p>
            ))}
          </section>
          <Webhooks surveyId={survey.id} />
        </fieldset>
      </div>
    </main>
  );
}
