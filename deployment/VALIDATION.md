# بررسی عملی راه‌اندازی — ۲۰۲۶-۱۰-۰۹

- اجرای نهایی محلی روی Docker Desktop 29.8.0: وب `http://localhost:3000`، API `http://localhost:8003` و PostgreSQL 16 روی volume پایدار.
- سرویس‌های `postgres`، `api` و `web` در وضعیت healthy قرار گرفتند. worker `jobs` چرخه webhook و یادآوری را هر ۳۰ ثانیه اجرا می‌کند.
- compose با `config --quiet` معتبر بود؛ فایل‌های PowerShell بدون خطای نحوی خوانده شدند.
- نصب تازه PostgreSQL از migration 0001 تا 0006 موفق بود.
- نصب وب با `npm ci` در Linux موفق شد؛ lockfile از محیط پاک Linux بازتولید شد تا وابستگی‌های اختیاری Windows باعث شکست CI نشوند.
- build نهایی Next 15.5.27 شامل بررسی نوع‌ها و ۱۳ صفحه موفق بود. وابستگی‌های توسعه از تصویر اجرایی حذف شدند؛ audit وابستگی‌های اجرایی صفر آسیب‌پذیری گزارش کرد.
- سلامت API، صفحه ورود و GET عمومی از مسیر هم‌دامنه `/api/v1/survey/public/surveys/1/` پاسخ 200 دادند.
- اشکال redirect بین Next و Django رفع شد: proxy اسلش پایانی API را نگه می‌دارد تا POST به GET تبدیل نشود.
- بکاپ دیتابیس custom و archive فایل‌ها ایجاد شدند. فایل دیتابیس در یک دیتابیس موقت جداگانه بازیابی شد؛ ۲۸ migration قابل خواندن بودند و دیتابیس بررسی پس از پایان حذف شد. دیتابیس محصول بازنویسی نشد.
- تنظیم Caddy با `caddy validate` معتبر بود. HTTPS روی سرور عمومی اجرا نشده است؛ دامنه، سرور و ایمیل گواهی باید برای staging و تولید تعیین شوند.
- فایل محیط واقعی، اطلاعات مدیر و بکاپ‌ها در Git ثبت نشده‌اند. SQLite توسعه باقی مانده و داده اجرای Docker در PostgreSQL مستقل ذخیره می‌شود.

بررسی‌های چرخه محصول و رابط در گزارش اصلی توسعه ثبت می‌شوند. راهنمای تکرار اجرا، بکاپ و بازگشت در `RUNBOOK.md` است.

## Multi-stage images and single Compose (2026-10-09)

- Canonical entry point: docker-compose.yml. The duplicate docker-compose.survey.yml was removed and runbook, backup/restore/rollback scripts and CI path filters now reference the canonical file.
- API: dependencies stage installs a virtual environment; runtime stage copies it and runs as survey.
- Web: dependencies, build and runtime stages. Next standalone output, static assets and public files are copied to runtime; the process runs node server.js as node.
- Both image builds completed. All 16 API tests passed inside the new runtime image against an isolated test database.
- docker compose --env-file deployment/.env.local up -d --no-build --wait completed successfully. PostgreSQL, API and web reported healthy; the jobs process runs and its once-only cycle passed.
- All seven real-browser checks passed on the standalone image: login, survey list, builder, preview, mobile layout, real answer completion and no page runtime errors.
- Existing survey-platform project name and volumes were reused; existing example surveys remained available after the update.
- Web image size changed from 655,971,580 to 212,291,106 bytes (about 68% smaller, Docker uncompressed image size). API runtime is 218,174,353 bytes.

Run from the repository root:

```powershell
docker compose --env-file deployment/.env.local up -d --build
```
