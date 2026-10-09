import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../hooks/useAuth";

export function Brand() {
  return (
    <Link href="/" className="pn-brand" aria-label="پرس‌نما، صفحه اصلی">
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
        پرس‌نما<small>PORSNAMA</small>
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
  const [open, setOpen] = useState(false);
  const { authenticated } = useAuth();
  const router = useRouter();
  return (
    <header className="pn-header">
      <Brand />
      <button
        className="pn-menu"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="public-navigation"
      >
        {open ? "بستن منو" : "منو"}
      </button>
      <nav
        id="public-navigation"
        className={open ? "pn-navigation is-open" : "pn-navigation"}
        aria-label="منوی اصلی"
      >
        <Link
          aria-current={router.pathname === "/product" ? "page" : undefined}
          href="/product"
        >
          معرفی محصول
        </Link>
        <Link
          aria-current={router.pathname === "/about" ? "page" : undefined}
          href="/about"
        >
          دربارهٔ ما
        </Link>
        <Link href="/#questions">پرسش‌های متداول</Link>
      </nav>
      <Link
        href={authenticated ? "/workspace" : "/login"}
        className="pn-button pn-small"
      >
        {authenticated ? "فضای کاری من" : "ورود به حساب"}
        <Arrow />
      </Link>
    </header>
  );
}
export function PublicFooter() {
  return (
    <footer className="pn-footer">
      <div>
        <Brand />
        <p>پرسش‌های بهتر، تصویر روشن‌تر.</p>
      </div>
      <nav aria-label="پیوندهای پایین صفحه">
        <Link href="/product">محصول</Link>
        <Link href="/about">دربارهٔ پرس‌نما</Link>
        <Link href="/login">ورود به حساب</Link>
      </nav>
      <p className="pn-footer-note">
        ساخت، انتشار و تحلیل پرسشنامه در یک فضای کاری.
      </p>
    </footer>
  );
}
export function FinalCTA() {
  return (
    <section className="pn-final">
      <h2>
        پرسش بعدی شما
        <br />
        از کجا شروع می‌شود؟
      </h2>
      <div>
        <p>
          از اولین سؤال تا آخرین گزارش،
          <br />
          پرس‌نما همراه مسیر شماست.
        </p>
        <Link className="pn-button" href="/login">
          ورود به حساب
          <Arrow />
        </Link>
      </div>
    </section>
  );
}
