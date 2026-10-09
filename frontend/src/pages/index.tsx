import Link from "next/link";
import Head from "next/head";
export default function Home() {
  return (
    <main dir="rtl" lang="fa" className="min-h-screen bg-blue-50 p-4 md:p-12">
      <Head>
        <title>سامانه پرسشنامه</title>
        <meta name="description" content="ساخت، انتشار و تحلیل پرسشنامه" />
      </Head>
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold">سامانه پرسشنامه</h1>
        <p className="text-xl">
          پرسشنامه بسازید، مسیر پاسخ‌دهی را تنظیم کنید و نتایج را تحلیل کنید.
        </p>
        <nav className="flex flex-wrap gap-4">
          <Link className="bg-blue-600 text-white p-4 rounded" href="/surveys">
            مدیریت پرسشنامه‌ها
          </Link>
          <Link className="bg-white border p-4 rounded" href="/login">
            ورود مدیر
          </Link>
          <Link className="bg-white border p-4 rounded" href="/analytics">
            تحلیل پاسخ‌ها
          </Link>
        </nav>
        <section className="bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-bold mb-3">از ساخت تا گزارش</h2>
          <ol className="list-decimal list-inside space-y-3">
            <li>عنوان، بخش‌ها و انواع سؤال را در سازنده تنظیم کنید.</li>
            <li>
              شرط نمایش و پرش را اضافه کنید و مسیر را در پیش‌نمایش بررسی کنید.
            </li>
            <li>نسخه ثابت را منتشر کنید و لینک یا دعوت اختصاصی بفرستید.</li>
            <li>پاسخ‌ها را تحلیل کنید و خروجی داده بگیرید.</li>
          </ol>
        </section>
      </div>
    </main>
  );
}
