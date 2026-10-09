import LanguageSwitcher from "../components/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { useLocale } from "../i18n/LocaleProvider";
import Head from "next/head";
import Link from "next/link";
import { useAuth } from "../hooks/useAuth";
import { Arrow } from "../components/PublicSite";
export default function Workspace() {
  const { t } = useTranslation("app");
  const { locale, direction } = useLocale();
  const auth = useAuth();
  const destinations = [
    {
      href: "/surveys",
      title: t("nav.surveys"),
      detail: auth.canEdit
        ? t("workspace.surveysEditor")
        : t("workspace.surveysViewer"),
    },
    {
      href: "/analytics",
      title: t("workspace.insights"),
      detail: t("workspace.insightsDetail"),
    },
    {
      href: "/templates",
      title: t("workspace.library"),
      detail: auth.canEdit
        ? t("workspace.templatesEditor")
        : t("workspace.templatesViewer"),
    },
    ...(auth.isAdmin
      ? [
          {
            href: "/team",
            title: t("workspace.members"),
            detail: t("workspace.membersDetail"),
          },
        ]
      : []),
  ];
  return (
    <>
      <Head>
        <title>{t("workspace.title")}</title>
      </Head>
      <main
        dir={direction}
        lang={locale}
        className="min-h-screen bg-[#faf7f1] text-[#432839] px-5 py-7 md:px-12 md:py-10"
      >
        <div className="max-w-6xl mx-auto">
          <header className="flex flex-wrap items-center justify-between gap-5 border-b border-[#ded3d7] pb-7">
            <Link href="/" className="text-2xl font-bold">
              {t("brand")}{" "}
              <span className="text-xs font-normal tracking-widest ms-2">
                PORSNAMA
              </span>
            </Link>
            <div className="flex items-center gap-5">
              <LanguageSwitcher />
              <span className="text-sm">{auth.user?.username}</span>
              <button
                onClick={() => void auth.logout()}
                className="rounded-full border border-[#bfaeb6] px-5 py-2 text-sm"
              >
                {t("nav.logout")}
              </button>
            </div>
          </header>
          <section className="py-12 md:py-16 grid md:grid-cols-[1fr_auto] gap-8 items-end">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                {t("workspace.hero")}
              </h1>
              <p className="mt-6 max-w-xl text-[#756570] leading-8">
                {t("workspace.description")}
              </p>
            </div>
            <div className="rounded-2xl bg-white border border-[#e2d8db] p-5 min-w-60">
              <label htmlFor="workspace-tenant" className="block text-sm mb-3">
                {t("workspace.active")}
              </label>
              <select
                id="workspace-tenant"
                value={auth.tenant || ""}
                onChange={(event) => auth.switchTenant(event.target.value)}
                className="w-full bg-[#faf7f1] border border-[#ded3d7] rounded-lg px-3 py-2"
              >
                {auth.memberships.map((membership) => (
                  <option
                    key={membership.tenant_id}
                    value={membership.tenant_id}
                  >
                    {membership.tenant_id}
                  </option>
                ))}
              </select>
              <p className="text-xs mt-4 text-[#8b5672]">
                {t("workspace.yourRole", {
                  role: t(auth.role ? `roles.${auth.role}` : "roles.none"),
                })}
              </p>
            </div>
          </section>
          <section
            aria-label={t("workspace.tools")}
            className="grid md:grid-cols-2 gap-5"
          >
            {destinations.map((item) => (
              <Link
                href={item.href}
                key={item.href}
                className="group rounded-3xl bg-white border border-[#e2d8db] p-7 md:p-9 transition-colors hover:bg-[#f3e8ee] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#8b5672]"
              >
                <div className="flex justify-end text-[#795384] mb-6">
                  <Arrow />
                </div>
                <h2 className="text-2xl font-bold mb-3">{item.title}</h2>
                <p className="text-[#756570] leading-7">{item.detail}</p>
              </Link>
            ))}
          </section>
          <footer className="mt-12 pt-6 border-t border-[#ded3d7] flex flex-wrap gap-6 text-sm text-[#756570]">
            <Link href="/product">{t("nav.product")}</Link>
            <Link href="/about">{t("nav.about")}</Link>
            <span className="md:ms-auto">{t("workspace.tagline")}</span>
          </footer>
        </div>
      </main>
    </>
  );
}
