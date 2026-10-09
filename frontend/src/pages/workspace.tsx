import Head from "next/head";
import Link from "next/link";
import { useAuth } from "../hooks/useAuth";
import { Arrow, Brand } from "../components/PublicSite";
const roleNames = {
  admin: "مدیر فضای کار",
  editor: "ویرایشگر",
  viewer: "مشاهده‌گر",
};
export default function Workspace() {
  const auth = useAuth();
  const destinations = [
    {
      href: "/surveys",
      title: "پرسشنامه‌ها",
      detail: auth.canEdit
        ? "پرسشنامه بسازید، منتشر کنید و پاسخ‌ها را ببینید."
        : "پرسشنامه‌های تیم و پاسخ‌های ثبت‌شده را مشاهده کنید.",
    },
    {
      href: "/analytics",
      title: "بینش از پاسخ‌ها",
      detail: "نتایج پرسشنامه‌ها را بررسی کنید و خروجی بگیرید.",
    },
    {
      href: "/templates",
      title: "کتابخانهٔ قالب‌ها",
      detail: auth.canEdit
        ? "از قالب‌های فضای کار برای شروع پرسشنامه استفاده کنید."
        : "قالب‌های موجود در فضای کار را مرور کنید.",
    },
    ...(auth.isAdmin
      ? [
          {
            href: "/team",
            title: "اعضا و دسترسی‌ها",
            detail: "اعضای تیم و نقش هر فرد را مدیریت کنید.",
          },
        ]
      : []),
  ];
  return (
    <>
      <Head>
        <title>فضای کار شما | پرس‌نما</title>
      </Head>
      <main
        dir="rtl"
        className="min-h-screen bg-[#faf7f1] text-[#432839] px-5 py-7 md:px-12 md:py-10"
      >
        <div className="max-w-6xl mx-auto">
          <header className="flex flex-wrap items-center justify-between gap-5 border-b border-[#ded3d7] pb-7">
            <Link href="/" className="text-2xl font-bold">
              پرس‌نما{" "}
              <span className="text-xs font-normal tracking-widest mr-2">
                PORSNAMA
              </span>
            </Link>
            <div className="flex items-center gap-5">
              <span className="text-sm">{auth.user?.username}</span>
              <button
                onClick={() => void auth.logout()}
                className="rounded-full border border-[#bfaeb6] px-5 py-2 text-sm"
              >
                خروج
              </button>
            </div>
          </header>
          <section className="py-12 md:py-16 grid md:grid-cols-[1fr_auto] gap-8 items-end">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                از پرسیدن، به شناختن.
              </h1>
              <p className="mt-6 max-w-xl text-[#756570] leading-8">
                ابزارهای در دسترس شما بر اساس عضویت و نقش‌تان در این فضای کار
                نمایش داده می‌شوند.
              </p>
            </div>
            <div className="rounded-2xl bg-white border border-[#e2d8db] p-5 min-w-60">
              <label htmlFor="workspace-tenant" className="block text-sm mb-3">
                فضای کار فعال
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
                نقش شما: {auth.role ? roleNames[auth.role] : "بدون دسترسی"}
              </p>
            </div>
          </section>
          <section
            aria-label="ابزارهای فضای کار"
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
            <Link href="/product">آشنایی با محصول</Link>
            <Link href="/about">دربارهٔ پرس‌نما</Link>
            <span className="md:mr-auto">پرسش بهتر. تصویر روشن‌تر.</span>
          </footer>
        </div>
      </main>
    </>
  );
}
