import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../hooks/useAuth";
export default function Login() {
  const { login } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <main
      dir="rtl"
      className="min-h-screen bg-blue-50 flex items-center justify-center p-4"
    >
      <form
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          const form = new FormData(e.currentTarget);
          const result = await login(
            String(form.get("username")),
            String(form.get("password")),
          );
          setBusy(false);
          if (result.success) router.push("/surveys");
          else setError(result.error || "ورود ناموفق");
        }}
      >
        <h1 className="text-2xl font-bold">ورود مدیر پرسشنامه</h1>
        <label className="block">
          نام کاربری
          <input
            className="block border p-2 w-full"
            name="username"
            required
            autoComplete="username"
          />
        </label>
        <label className="block">
          رمز عبور
          <input
            className="block border p-2 w-full"
            name="password"
            type="password"
            required
            autoComplete="current-password"
          />
        </label>
        {error && (
          <p role="alert" className="text-red-700">
            {error}
          </p>
        )}
        <button disabled={busy} className="bg-blue-600 text-white p-3 rounded">
          {busy ? "در حال ورود…" : "ورود"}
        </button>
      </form>
    </main>
  );
}
