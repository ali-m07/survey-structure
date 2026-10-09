import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../hooks/useAuth";

export function Brand() {
  const { t } = useTranslation("public");
  return (
    <Link href="/" className="pn-brand" aria-label={t("brandHome")}>
      <svg viewBox="0 0 40 40" aria-hidden="true">
        <path
          d="M10 7h16a7 7 0 0 1 7 7v9a7 7 0 0 1-7 7h-8l-8 6V7Z"
          fill="currentColor"
        />
        <path
          d="M18 14h7M18 20h5"
          stroke="#faf7f2"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      <span>
        {t("brand")}
        <small>PORSNAMA</small>
      </span>
    </Link>
  );
}
export function Arrow() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M19 12H5m6-6-6 6 6 6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
export function PublicHeader() {
  const { t } = useTranslation("public");
  const [open, setOpen] = useState(false);
  const { authenticated } = useAuth();
  const router = useRouter();
  return (
    <header className="pn-header">
      <Brand />
      <LanguageSwitcher />
      <button
        className="pn-menu"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="public-navigation"
      >
        {open ? t("nav.closeMenu") : t("nav.openMenu")}
      </button>
      <nav
        id="public-navigation"
        className={open ? "pn-navigation is-open" : "pn-navigation"}
        aria-label={t("nav.label")}
      >
        <Link
          aria-current={router.pathname === "/product" ? "page" : undefined}
          href="/product"
        >
          {t("nav.product")}
        </Link>
        <Link
          aria-current={router.pathname === "/about" ? "page" : undefined}
          href="/about"
        >
          {t("nav.about")}
        </Link>
        <Link href="/#questions">{t("nav.faq")}</Link>
      </nav>
      <Link
        href={authenticated ? "/workspace" : "/login"}
        className="pn-button pn-small"
      >
        {authenticated ? t("nav.workspace") : t("common.login")}
        <Arrow />
      </Link>
    </header>
  );
}
export function PublicFooter() {
  const { t } = useTranslation("public");
  return (
    <footer className="pn-footer">
      <div>
        <Brand />
        <p>{t("footer.tagline")}</p>
      </div>
      <nav aria-label={t("footer.navigation")}>
        <Link href="/product">{t("footer.product")}</Link>
        <Link href="/about">{t("footer.about")}</Link>
        <Link href="/login">{t("common.login")}</Link>
      </nav>
      <p className="pn-footer-note">{t("footer.description")}</p>
    </footer>
  );
}
export function FinalCTA() {
  const { t } = useTranslation("public");
  return (
    <section className="pn-final">
      <h2>
        {t("cta.titleStart")}
        <br />
        {t("cta.titleEnd")}
      </h2>
      <div>
        <p>
          {t("cta.copyStart")}
          <br />
          {t("cta.copyEnd")}
        </p>
        <Link className="pn-button" href="/login">
          {t("common.login")}
          <Arrow />
        </Link>
      </div>
    </section>
  );
}
