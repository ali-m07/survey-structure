import LanguageSwitcher from "../components/LanguageSwitcher";
import { useLocale } from "../i18n/LocaleProvider";
import { useTranslation } from "react-i18next";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../hooks/useAuth";
import { Arrow, Brand } from "../components/PublicSite";
import SurveyScene from "../components/SurveyScene";
export default function Login() {
  const { t } = useTranslation("public");
  const { locale, direction } = useLocale();
  const { login, authenticated, loading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!loading && authenticated) router.replace("/workspace");
  }, [loading, authenticated, router]);
  return (
    <main className="pn-site pn-login" dir={direction} lang={locale}>
      <Head>
        <title>{t("login.seoTitle")}</title>
        <meta name="description" content={t("login.seoDescription")} />
      </Head>
      <div className="pn-login-form-side">
        <div className="pn-login-header">
          <Brand />
          <LanguageSwitcher />
        </div>
        <Link href="/" className="pn-login-back">
          {t("login.back")}
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
            else setError("login.error");
          }}
        >
          <h1>{t("login.title")}</h1>
          <p>{t("login.description")}</p>
          <label htmlFor="username">{t("login.username")}</label>
          <input
            id="username"
            name="username"
            required
            autoComplete="username"
            dir="auto"
            placeholder={t("login.usernamePlaceholder")}
          />
          <label htmlFor="password">{t("login.password")}</label>
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
              aria-label={
                show
                  ? t("login.hidePasswordLabel")
                  : t("login.showPasswordLabel")
              }
            >
              {show ? t("login.hidePassword") : t("login.showPassword")}
            </button>
          </div>
          {error && (
            <p className="pn-error" role="alert">
              {t(error)}
            </p>
          )}
          <button className="pn-button" disabled={busy || loading}>
            {busy ? t("login.busy") : t("common.login")}
            <Arrow />
          </button>
          <p className="pn-login-help">
            {t("login.helpStart")}
            <br />
            {t("login.helpEnd")}
          </p>
        </form>
        <p className="pn-login-foot">{t("footer.tagline")}</p>
      </div>
      <aside className="pn-login-visual">
        <h2>
          {t("login.visualStart")}
          <br />
          {t("login.visualConnector")} <span>{t("login.visualAccent")}</span>
        </h2>
        <SurveyScene compact />
        <p>
          {t("login.visualCopyStart")}
          <br />
          {t("login.visualCopyEnd")}
        </p>
      </aside>
    </main>
  );
}
