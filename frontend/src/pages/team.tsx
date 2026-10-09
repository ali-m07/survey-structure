import { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient, SURVEY_API } from "../services/api";
export default function Team() {
  const [members, setMembers] = useState<any[]>([]);
  const [error, setError] = useState("");
  const load = async () => {
    try {
      setMembers(await apiClient.get(`${SURVEY_API}/members/`));
    } catch (e) {
      setError(String(e));
    }
  };
  useEffect(() => {
    load();
  }, []);
  return (
    <main dir="rtl" className="min-h-screen bg-blue-50 p-8">
      <div className="max-w-4xl mx-auto space-y-4">
        <Link href="/surveys">پرسشنامه‌ها</Link>
        <h1 className="text-3xl font-bold">اعضای سازمان</h1>
        {error && <p role="alert">{error}</p>}
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
              setError(String(e));
            }
          }}
        >
          <label className="block">
            نام کاربری حساب موجود
            <input name="username" className="border p-2 block" required />
          </label>
          <label className="block">
            نقش
            <select name="role" className="border p-2 block">
              <option value="viewer">مشاهده‌گر</option>
              <option value="editor">ویرایشگر</option>
              <option value="admin">مدیر</option>
            </select>
          </label>
          <button className="border p-2">افزودن یا تغییر نقش</button>
        </form>
        {members.map((m) => (
          <article
            key={m.id}
            className="bg-white p-4 rounded flex justify-between"
          >
            <p>
              {m.user__username} · {m.role}
            </p>
            <button
              className="text-red-700"
              onClick={async () => {
                if (!confirm("عضویت حذف شود؟")) return;
                try {
                  await apiClient.delete(`${SURVEY_API}/members/${m.id}/`);
                  load();
                } catch (e) {
                  setError(String(e));
                }
              }}
            >
              حذف عضویت
            </button>
          </article>
        ))}
      </div>
    </main>
  );
}
