import { ReactNode, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../hooks/useAuth";

export function AccessGate({ children }: { children: ReactNode }) {
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
        dir="rtl"
        className="min-h-screen flex items-center justify-center bg-[#faf7f1] text-[#432839]"
      >
        <p role="status">در حال آماده‌سازی فضای کار…</p>
      </main>
    );
  if (!auth.tenant)
    return (
      <AccessMessage
        title="هنوز به فضای کاری عضو نیستید"
        message="ورود شما انجام شد. برای دریافت دسترسی، از مسئول فضای کاری بخواهید حساب شما را به تیم اضافه کند."
      />
    );
  if (router.pathname === "/team" && !auth.isAdmin)
    return (
      <AccessMessage
        title="دسترسی مدیریت تیم لازم است"
        message="نقش فعلی شما اجازه تغییر اعضای تیم را ندارد. برای تغییر دسترسی با مسئول فضای کاری تماس بگیرید."
      />
    );
  if (/^\/surveys\/.*\/edit$/.test(router.pathname) && !auth.canEdit)
    return (
      <AccessMessage
        title="این فضا برای مشاهده در دسترس شماست"
        message="برای ساخت یا ویرایش پرسشنامه به نقش ویرایشگر یا مدیر نیاز دارید."
      />
    );
  return <div key={auth.tenant}>{children}</div>;
}
function AccessMessage({ title, message }: { title: string; message: string }) {
  const auth = useAuth();
  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#faf7f1] text-[#432839] flex items-center justify-center p-6"
    >
      <section className="max-w-lg rounded-3xl border border-[#ded3d7] bg-white p-8">
        <p className="text-sm mb-5">پرس‌نما · {auth.user?.username}</p>
        <h1 className="text-2xl font-bold mb-4">{title}</h1>
        <p className="leading-8">{message}</p>
        <div className="flex gap-6 mt-8">
          <Link href={auth.tenant ? "/workspace" : "/"}>بازگشت</Link>
          <button onClick={() => void auth.logout()}>خروج از حساب</button>
        </div>
      </section>
    </main>
  );
}
