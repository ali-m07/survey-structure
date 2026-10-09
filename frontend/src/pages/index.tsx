import Head from "next/head";
import Link from "next/link";
import {
  Arrow,
  FinalCTA,
  PublicFooter,
  PublicHeader,
} from "../components/PublicSite";
import SurveyScene from "../components/SurveyScene";
export default function Home() {
  return (
    <div className="pn-site" dir="rtl" lang="fa">
      <Head>
        <title>پرس‌نما | پرسش‌های بهتر، تصویر روشن‌تر</title>
        <meta
          name="description"
          content="با پرس‌نما پرسشنامه بسازید، پاسخ‌ها را جمع‌آوری کنید و از داده به تصمیم برسید. سازنده فارسی با منطق شرطی، انتشار و تحلیل."
        />
      </Head>
      <PublicHeader />
      <main>
        <section className="pn-hero">
          <div className="pn-hero-copy">
            <h1>
              هر پاسخ،
              <br />
              یک <span>دنیای تازه.</span>
            </h1>
            <p>
              آدم‌ها حرف‌های زیادی برای گفتن دارند.
              <br />
              با پرس‌نما، سؤال درست را بپرسید، پاسخ‌ها را کنار هم ببینید و تصمیم
              روشن‌تری بگیرید.
            </p>
            <div className="pn-hero-actions">
              <Link className="pn-button" href="/login">
                ورود به حساب
                <Arrow />
              </Link>
              <Link className="pn-text-link" href="/product">
                کشف پرس‌نما
                <Arrow />
              </Link>
            </div>
            <p className="pn-hero-note">
              برای پژوهش، شناخت مشتری و شنیدن صدای تیم.
            </p>
          </div>
          <SurveyScene />
        </section>
        <section className="pn-capability-strip" aria-label="قابلیت‌های محصول">
          <span>۱۲ نوع سؤال</span>
          <span>منطق شرطی</span>
          <span>تجربهٔ فارسی و موبایل</span>
          <span>نقش‌ها و دسترسی تیم</span>
        </section>
        <section className="pn-story">
          <div>
            <h2>
              فقط سؤال نپرسید.
              <br />
              <span>مسیر گفت‌وگو بسازید.</span>
            </h2>
            <p>
              یک پرسشنامهٔ خوب برای همه یکسان پیش نمی‌رود. با شرط نمایش و پرش،
              هر پاسخ مسیر سؤال بعدی را مشخص می‌کند.
            </p>
            <Link href="/product#logic" className="pn-text-link">
              بیشتر دربارهٔ منطق پرسشنامه
              <Arrow />
            </Link>
          </div>
          <div className="pn-flow" aria-label="نمونه مسیر پرسشنامه">
            <div className="pn-flow-question">از محصول استفاده کرده‌اید؟</div>
            <div className="pn-flow-paths">
              <div>
                <span>بله</span>
                <p>تجربه‌تان چطور بود؟</p>
              </div>
              <div>
                <span>هنوز نه</span>
                <p>چه انتظاری از آن دارید؟</p>
              </div>
            </div>
            <small>نمایش مفهومی مسیرهای شرطی</small>
          </div>
        </section>
        <section className="pn-workflow">
          <h2>
            از اولین سؤال
            <br />
            تا یک تصویر روشن.
          </h2>
          <div className="pn-workflow-list">
            <article>
              <h3>ایده‌تان را به پرسش تبدیل کنید.</h3>
              <p>
                متن، گزینه، مقیاس، ماتریس و رتبه‌بندی؛ بخش‌ها را بچینید و قبل از
                انتشار مسیر را پیش‌نمایش کنید.
              </p>
            </article>
            <article>
              <h3>به آدم‌ها نزدیک‌تر شوید.</h3>
              <p>
                با لینک عمومی، QR یا دعوت اختصاصی پاسخ بگیرید. پاسخ‌دهنده
                می‌تواند در همان مرورگر ادامه دهد.
              </p>
            </article>
            <article>
              <h3>پاسخ‌ها را کنار هم ببینید.</h3>
              <p>
                نمودارها، میانگین‌ها و NPS را بررسی کنید و گزارش را با خروجی
                CSV، Excel یا PDF همراه تیم ببرید.
              </p>
            </article>
          </div>
        </section>
        <section className="pn-audience">
          <h2>
            برای هر تیمی که
            <br />
            به شنیدن اهمیت می‌دهد.
          </h2>
          <div>
            <p>
              <strong>پژوهشگران</strong>
              <span>از طراحی پرسش تا خروجی داده.</span>
            </p>
            <p>
              <strong>تیم‌های محصول</strong>
              <span>شناخت تجربه و انتظار مشتری.</span>
            </p>
            <p>
              <strong>تیم‌های سازمانی</strong>
              <span>شنیدن بازخورد با دسترسی‌های مشخص.</span>
            </p>
          </div>
        </section>
        <section id="questions" className="pn-faq">
          <h2>شاید سؤال شما هم باشد.</h2>
          <div>
            {[
              [
                "آیا پاسخ‌دهنده باید وارد حساب شود؟",
                "خیر. پرسشنامهٔ منتشرشده با لینک عمومی یا دعوت اختصاصی در دسترس است و پاسخ‌دهنده به حساب مدیریتی نیاز ندارد.",
              ],
              [
                "دسترسی‌های تیم چطور تعیین می‌شود؟",
                "بعد از ورود، عضویت سازمانی حساب مشخص می‌کند چه امکاناتی دارید. مدیر اعضا و نقش‌ها را مدیریت می‌کند؛ ویرایشگر پرسشنامه می‌سازد و مشاهده‌گر داده‌ها و گزارش‌ها را می‌بیند.",
              ],
              [
                "آیا می‌توانم پرسشنامهٔ منتشرشده را تغییر دهم؟",
                "ساختار نسخهٔ منتشرشده ثابت می‌ماند تا پاسخ‌ها قابل مقایسه باشند. برای تغییر، از آن یک پیش‌نویس تازه بسازید.",
              ],
              [
                "چه خروجی‌هایی می‌توانم بگیرم؟",
                "پاسخ‌ها به صورت CSV و Excel و گزارش‌ها به صورت PDF قابل دریافت هستند. نمایش و خروجی فارسی پشتیبانی می‌شود.",
              ],
            ].map(([q, a]) => (
              <details key={q}>
                <summary>
                  {q}
                  <span aria-hidden="true">+</span>
                </summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>
        <FinalCTA />
      </main>
      <PublicFooter />
    </div>
  );
}
