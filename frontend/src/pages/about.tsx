import Head from "next/head";
import Link from "next/link";
import {
  Arrow,
  FinalCTA,
  PublicFooter,
  PublicHeader,
} from "../components/PublicSite";
export default function About() {
  return (
    <div className="pn-site" dir="rtl" lang="fa">
      <Head>
        <title>دربارهٔ ما | پرس‌نما</title>
        <meta
          name="description"
          content="پرس‌نما برای کوتاه کردن فاصله میان پرسیدن، شنیدن و تصمیم گرفتن ساخته می‌شود."
        />
      </Head>
      <PublicHeader />
      <main>
        <section className="pn-about-intro">
          <h1>
            ما به قدرت
            <br />
            <span>یک سؤال خوب</span>
            <br />
            باور داریم.
          </h1>
          <div className="pn-about-mark" aria-hidden="true">
            <div>؟</div>
            <div>؟</div>
            <div>؟</div>
          </div>
        </section>
        <section className="pn-about-letter">
          <h2>شنیدن، نقطهٔ شروع ماست.</h2>
          <div>
            <p>
              پرس‌نما برای کوتاه‌کردن فاصلهٔ میان پرسیدن، شنیدن و تصمیم‌گرفتن
              ساخته می‌شود. می‌خواهیم تیم‌ها بتوانند پرسش‌هایشان را روشن بیان
              کنند و پاسخ آدم‌ها را در بستری قابل فهم کنار هم ببینند.
            </p>
            <p>
              از یک پژوهش کوچک تا بازخورد مشتری و تجربهٔ همکاران، هدف ما یکسان
              است: ابزار به جای پیچیده‌کردن کار، به جریان گفت‌وگو کمک کند.
            </p>
            <p>
              نام پرس‌نما از «پرسش» و «نما» می‌آید؛ از سؤال شروع می‌کنیم تا
              تصویر روشن‌تری از دیدگاه آدم‌ها بسازیم.
            </p>
            <Link href="/product" className="pn-text-link">
              آشنایی با محصول
              <Arrow />
            </Link>
          </div>
        </section>
        <section className="pn-principles">
          <h2>
            چیزهایی که
            <br />
            برای ما مهم‌اند.
          </h2>
          <article>
            <h3>وضوح در پرسیدن</h3>
            <p>
              سؤال، مسیر و گزارش باید قابل فهم باشند. انتخاب‌های درست از ابزار
              روشن شروع می‌شوند.
            </p>
          </article>
          <article>
            <h3>احترام به پاسخ‌دهنده</h3>
            <p>
              تجربهٔ فارسی، موبایل و سؤال‌های مرتبط، به زمان و توجه آدم‌ها
              احترام می‌گذارد.
            </p>
          </article>
          <article>
            <h3>مسئولیت در دسترسی</h3>
            <p>
              دادهٔ هر سازمان در محدودهٔ همان سازمان قرار می‌گیرد و نقش حساب
              تعیین‌کنندهٔ دسترسی است.
            </p>
          </article>
        </section>
        <FinalCTA />
      </main>
      <PublicFooter />
    </div>
  );
}
