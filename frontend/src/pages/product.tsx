import Head from "next/head";
import Link from "next/link";
import {
  Arrow,
  FinalCTA,
  PublicFooter,
  PublicHeader,
} from "../components/PublicSite";
import SurveyScene from "../components/SurveyScene";
export default function Product() {
  return (
    <div className="pn-site" dir="rtl" lang="fa">
      <Head>
        <title>معرفی محصول | پرس‌نما</title>
        <meta
          name="description"
          content="سازنده پرسشنامه فارسی، منطق شرطی، انتشار، تحلیل پاسخ‌ها و نقش‌های سازمانی در پرس‌نما."
        />
      </Head>
      <PublicHeader />
      <main>
        <section className="pn-hero pn-product-hero">
          <div className="pn-hero-copy">
            <h1>
              سؤال تا تصمیم.
              <br />
              <span>همه در یک مسیر.</span>
            </h1>
            <p>
              پرس‌نما فضای مشترک ساخت، انتشار و تحلیل پرسشنامه است. سؤال‌ها را
              طراحی کنید، مسیر پاسخ‌دهی را بسازید و نتیجه را به تیم برسانید.
            </p>
            <Link href="/login" className="pn-button">
              ورود به حساب
              <Arrow />
            </Link>
          </div>
          <SurveyScene />
        </section>
        <section className="pn-product-section">
          <h2>
            برای هر پرسش،
            <br />
            یک ابزار مناسب.
          </h2>
          <div>
            <p>
              ۱۲ نوع سؤال با تنظیمات و اعتبارسنجی متناسب، از یک پاسخ کوتاه تا
              مقایسهٔ چند گزینه.
            </p>
            <div className="pn-question-types">
              {[
                "متن",
                "ایمیل",
                "عدد",
                "تک‌انتخابی",
                "چندانتخابی",
                "بله / خیر",
                "امتیاز",
                "مقیاس لیکرت",
                "NPS",
                "ماتریس",
                "رتبه‌بندی",
                "تاریخ",
              ].map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
          </div>
        </section>
        <section id="logic" className="pn-story">
          <div>
            <h2>
              پاسخ‌ها مسیر
              <br />
              را تغییر می‌دهند.
            </h2>
            <p>
              شرط نمایش، پرش رو‌به‌جلو و استفاده از پاسخ قبلی، پرسشنامه را
              مرتبط‌تر می‌کنند. سؤال پنهان، پاسخ‌دهنده را برای تکمیل سؤال الزامی
              متوقف نمی‌کند.
            </p>
          </div>
          <div className="pn-flow">
            <div className="pn-flow-question">
              کدام موضوع برای شما مهم‌تر است؟
            </div>
            <div className="pn-flow-paths">
              <div>
                <span>تجربه</span>
                <p>سؤال‌های تجربهٔ کاربری</p>
              </div>
              <div>
                <span>کیفیت</span>
                <p>سؤال‌های کیفیت محصول</p>
              </div>
            </div>
            <small>نمایش مفهومی؛ شرط‌ها در سازنده تنظیم می‌شوند</small>
          </div>
        </section>
        <section className="pn-workflow">
          <h2>
            جزئیاتی که
            <br />
            مسیر را کامل می‌کنند.
          </h2>
          <div className="pn-workflow-list">
            <article>
              <h3>بسازید، جابه‌جا کنید، پیش‌نمایش بگیرید.</h3>
              <p>
                بخش و سؤال را ویرایش و کپی کنید. ذخیرهٔ خودکار و وضعیت ذخیره به
                حفظ تغییرها کمک می‌کند.
              </p>
            </article>
            <article>
              <h3>پرسشنامه را به مخاطب برسانید.</h3>
              <p>
                لینک عمومی، QR و دعوت اختصاصی با بازهٔ دریافت پاسخ. ارسال ایمیل
                به تنظیم سرویس ایمیل سازمان نیاز دارد.
              </p>
            </article>
            <article>
              <h3>نتیجه را قابل استفاده کنید.</h3>
              <p>
                شمارش، نمودار، میانگین، NPS و فیلتر تاریخ در کنار خروجی CSV،
                Excel و PDF فارسی.
              </p>
            </article>
            <article>
              <h3>هر حساب، دسترسی مشخص.</h3>
              <p>
                نقش مدیر، ویرایشگر و مشاهده‌گر؛ جداسازی سازمان‌ها، تاریخچهٔ
                تغییرات و اتصال webhook.
              </p>
            </article>
          </div>
        </section>
        <FinalCTA />
      </main>
      <PublicFooter />
    </div>
  );
}
