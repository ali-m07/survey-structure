import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../hooks/useAuth";
import { Arrow, Brand } from "../components/PublicSite";
import SurveyScene from "../components/SurveyScene";
export default function Login() {
  const { login, authenticated, loading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!loading && authenticated) router.replace("/workspace");
  }, [loading, authenticated, router]);
  return (
    <main className="pn-site pn-login" dir="rtl" lang="fa">
      <Head>
        <title>ورود به حساب | پرس‌نما</title>
        <meta
          name="description"
          content="ورود به فضای کاری پرس‌نما. امکانات حساب شما بر اساس عضویت و دسترسی تعیین می‌شود."
        />
      </Head>
      <div className="pn-login-form-side">
        <Brand />
        <Link href="/" className="pn-login-back">
          بازگشت به سایت
          <Arrow />
        </Link>
        <form
          className="pn-login-form"
          onSubmit={async (e) => {
            e.preventDefault();
            if (busy) return;
            setError("");
            setBusy(true);
            const form = new FormData(e.currentTarget);
            const result = await login(
              String(form.get("username")),
              String(form.get("password")),
            );
            setBusy(false);
            if (result.success) router.replace("/workspace");
            else
              setError(
                "ورود انجام نشد. نام کاربری و رمز را بررسی کنید و دوباره تلاش کنید.",
              );
          }}
        >
          <h1>خوش برگشتید.</h1>
          <p>وارد حساب شوید و گفت‌وگو را ادامه دهید.</p>
          <label htmlFor="username">نام کاربری</label>
          <input
            id="username"
            name="username"
            required
            autoComplete="username"
            dir="auto"
            placeholder="نام کاربری شما"
          />
          <label htmlFor="password">رمز عبور</label>
          <div className="pn-password">
            <input
              id="password"
              name="password"
              required
              type={show ? "text" : "password"}
              autoComplete="current-password"
              dir="ltr"
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              aria-label={show ? "پنهان‌کردن رمز" : "نمایش رمز"}
            >
              {show ? "پنهان" : "نمایش"}
            </button>
          </div>
          {error && (
            <p className="pn-error" role="alert">
              {error}
            </p>
          )}
          <button className="pn-button" disabled={busy || loading}>
            {busy ? "در حال ورود…" : "ورود به حساب"}
            <Arrow />
          </button>
          <p className="pn-login-help">
            حساب ندارید یا دسترسی‌تان تغییر کرده؟
            <br />
            با مسئول فضای کاری خود هماهنگ کنید.
          </p>
        </form>
        <p className="pn-login-foot">پرسش‌های بهتر، تصویر روشن‌تر.</p>
      </div>
      <aside className="pn-login-visual">
        <h2>
          یک سؤال خوب،
          <br />
          شروع یک <span>تغییر.</span>
        </h2>
        <SurveyScene compact />
        <p>
          صدای آدم‌ها را بشنوید.
          <br />
          پاسخ‌ها را به تصمیم‌های روشن تبدیل کنید.
        </p>
      </aside>
    </main>
  );
}
