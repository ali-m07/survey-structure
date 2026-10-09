# Survey Structure

پروژه پرسشنامه‌ساز با رابط Next.js و API مبتنی بر Django REST Framework. توسعه در ۸ فاز و راه‌اندازی در ۴ مرحله انجام می‌شود.

## وضعیت پروژه

نسخه فعلی در حال تکمیل است. گزارش‌های قدیمی با عنوان‌های «۱۰۰٪ کامل» یا «production ready» نتیجه بررسی نسخه جاری نیستند. وضعیت قابل استناد در [گزارش اجرا](IMPLEMENTATION_PROGRESS.md) و معیارهای پذیرش در [پلن اجرایی](IMPLEMENTATION_PLAN.md) ثبت می‌شوند.

## مسیر کاربر

۱. مدیر وارد سازمان خود می‌شود و پرسشنامه پیش‌نویس می‌سازد.
۲. بخش‌ها، سؤال‌ها، گزینه‌ها و منطق نمایش را تنظیم و پیش‌نمایش می‌کند.
۳. نسخه آماده را منتشر و لینک یا دعوت اختصاصی ارسال می‌کند.
۴. پاسخ‌دهنده در صفحه عمومی پاسخ می‌دهد.
۵. مدیر پاسخ‌ها و گزارش‌های سازمان خود را بررسی و دریافت می‌کند.

## ساختار مخزن

- `frontend/`: رابط مدیریت، سازنده و پاسخ‌دهنده.
- `services/3-survey_engine_service/`: مدل‌ها، دسترسی، API و منطق پرسشنامه.
- `scripts/`: راه‌اندازی محلی.
- `deployment/` و `docker-compose.yml`: اجرای مستقل محصول.
- `.github/workflows/survey-platform.yml`: بررسی API و ساخت رابط.
- سایر `services/` : ساختار پلتفرم بزرگ‌تر اولیه؛ برای اجرای پایه پرسشنامه‌ساز همگی لازم نیستند.

## شروع و راه‌اندازی

دستورهای نصب، ایجاد مدیر، اجرای محلی، Docker، بکاپ و استقرار در [راهنمای اجرا](RUNBOOK.md) ثبت می‌شوند. برای استقرار بیرونی باید سرور، دامنه و تنظیمات محیط مقصد مشخص باشند.

اطلاعات محیط و کلیدها در فایل محلی نگهداری می‌شوند و وارد مخزن نمی‌شوند. فایل‌های نمونه تنظیمات فقط برای توضیح نام متغیرها هستند.

## قرارداد API

مسیر پایه: `/api/v1/survey/`.

مدیریت از توکن و عضویت سازمانی استفاده می‌کند. پاسخ‌دهی عمومی مسیر جدا دارد. در نسخه منتشرشده ساختار ثابت می‌ماند؛ تغییر ساختار با ایجاد پیش‌نویس جدید انجام می‌شود.

## روش توسعه

هر تغییر مستقل در یک کامیت ثبت می‌شود. سه حوزه بک‌اند، رابط و راه‌اندازی مالک جدا دارند و عامل اصلی یکپارچه‌سازی و گزارش پیشرفت را انجام می‌دهد. تکمیل فاز فقط پس از بررسی معیار پذیرش آن اعلام می‌شود.

## Test runner

Run all survey checks from the repository root:

```powershell
python scripts/run-tests.py
# Windows shortcut:
./scripts/test.ps1
```

Use `--install` on first setup to install Python requirements and locked npm dependencies. Select one part with `--suite backend` or `--suite frontend`. `make test` runs the same runner.

The backend checks Django configuration, missing migrations, and survey tests using SQLite and Django's isolated test database. The frontend runs a production build (including Next lint checks) and TypeScript checks. Frontend checks write build output, so stop a local frontend development server before running them. The runner returns a nonzero exit code on failure and writes logs and `summary.json` under ignored `test-results/<suite>/`.

GitHub Actions runs the two suites in parallel on pushes and relevant pull requests. It also supports manual runs through **Actions → Survey platform checks → Run workflow** and uploads the reports even when checks fail.
