import { useTranslation } from "react-i18next";
import { useLocale } from "../i18n/LocaleProvider";
import { ReactNode, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../hooks/useAuth";

export function AccessGate({ children }: { children: ReactNode }) {
  const { t } = useTranslation("app");
  const { locale, direction } = useLocale();
  const router = useRouter();
  const auth = useAuth();
  const protectedRoute =
    /^\/(workspace|surveys|analytics|reports|templates|team|ai-insights)(\/|$)/.test(
      router.pathname,
    );
  useEffect(() => {
    if (
      router.isReady &&
      protectedRoute &&
      !auth.loading &&
      !auth.authenticated
    )
      void router.replace("/login");
  }, [
    router.isReady,
    protectedRoute,
    auth.loading,
    auth.authenticated,
    router,
  ]);
  if (!protectedRoute) return <>{children}</>;
  if (auth.loading || !router.isReady || !auth.authenticated)
    return (
      <main
        dir={direction}
        lang={locale}
        className="min-h-screen flex items-center justify-center bg-[#faf7f1] text-[#432839]"
      >
        <p role="status">{t("access.loading")}</p>
      </main>
    );
  if (!auth.tenant)
    return (
      <AccessMessage
        title={t("access.noWorkspaceTitle")}
        message={t("access.noWorkspaceDetail")}
      />
    );
  if (router.pathname === "/team" && !auth.isAdmin)
    return (
      <AccessMessage
        title={t("access.adminTitle")}
        message={t("access.adminDetail")}
      />
    );
  if (/^\/surveys\/.*\/edit$/.test(router.pathname) && !auth.canEdit)
    return (
      <AccessMessage
        title={t("access.viewerTitle")}
        message={t("access.viewerDetail")}
      />
    );
  return (
    <div className="pn-app" key={auth.tenant}>
      {children}
    </div>
  );
}
function AccessMessage({ title, message }: { title: string; message: string }) {
  const { t } = useTranslation("app");
  const { locale, direction } = useLocale();
  const auth = useAuth();
  return (
    <main
      dir={direction}
      lang={locale}
      className="min-h-screen bg-[#faf7f1] text-[#432839] flex items-center justify-center p-6"
    >
      <section className="max-w-lg rounded-3xl border border-[#ded3d7] bg-white p-8">
        <p className="text-sm mb-5">
          {t("brand")} · {auth.user?.username}
        </p>
        <h1 className="text-2xl font-bold mb-4">{title}</h1>
        <p className="leading-8">{message}</p>
        <div className="flex gap-6 mt-8">
          <Link href={auth.tenant ? "/workspace" : "/"}>{t("nav.back")}</Link>
          <button onClick={() => void auth.logout()}>
            {t("access.logout")}
          </button>
        </div>
      </section>
    </main>
  );
}
