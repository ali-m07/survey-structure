# راهنمای اجرای پرسشنامه‌ساز

## فاز اجرا ۱: Windows و توسعه محلی

پیش‌نیاز Python 3.12، Node 20 یا بالاتر و دسترسی نصب وابستگی‌هاست. از ریشه پروژه:

```powershell
./scripts/start-local.ps1 -Install
```

در اجراهای بعدی بدون `-Install` اجرا کنید. SQLite محلی داده‌ها را در سرویس ذخیره می‌کند. وب http://localhost:3000 و سلامت API http://localhost:8003/health است. خروجی‌ها در پوشه `logs` ذخیره می‌شوند. اگر پورت از قبل اشغال باشد اسکریپت آن سرویس را دوباره اجرا نمی‌کند؛ سلامت و هویت سرویس روی پورت را بررسی کنید.

ایجاد مدیر (رمز واقعی را وارد کنید، مقدار نمونه را استفاده نکنید):

```powershell
$env:SURVEY_ADMIN_PASSWORD = Read-Host 'رمز مدیر'
./services/3-survey_engine_service/.venv/Scripts/python.exe services/3-survey_engine_service/manage.py bootstrap_survey_admin --username admin --password $env:SURVEY_ADMIN_PASSWORD --tenant default
Remove-Item Env:SURVEY_ADMIN_PASSWORD
```

ورود از صفحه login انجام می‌شود. شناسه سازمان با tenant ساخته شده باید یکسان باشد. مدیر نمونه خودکار با رمز ثابت ساخته نمی‌شود.

## فاز اجرا ۲: Docker یکپارچه

Docker Desktop با Linux containers باید روشن باشد. فایل جدید compose مستقل از زیرساخت بزرگ قبلی است. دیتابیس به میزبان منتشر نمی‌شود و داده روی volume باقی می‌ماند. گرافانای زیرساخت قبلی به پورت 3001 منتقل شده است.

```powershell
Copy-Item deployment/.env.local.example deployment/.env.local
```

دو مقدار `DATABASE_PASSWORD` و `SECRET_KEY` را با رشته‌های تصادفی طولانی پر کنید. فایل محیط واقعی در Git ثبت نمی‌شود. سپس:

```powershell
docker compose --env-file deployment/.env.local -f docker-compose.survey.yml config --quiet
docker compose --env-file deployment/.env.local -f docker-compose.survey.yml up -d --build
docker compose --env-file deployment/.env.local -f docker-compose.survey.yml ps
docker compose --env-file deployment/.env.local -f docker-compose.survey.yml logs --tail 100 api web migrate
```

ابتدا postgres سالم می‌شود، سپس migration اجرا می‌شود و بعد API و وب شروع می‌شوند. ایجاد مدیر داخل کانتینر:

```powershell
docker compose --env-file deployment/.env.local -f docker-compose.survey.yml exec -e ADMIN_PASSWORD api python manage.py bootstrap_survey_admin --username admin --tenant default
```

برای ساخت مدیر نخست `ADMIN_PASSWORD` یا `--password` لازم است؛ رمز حداقل ۱۰ کاراکتر انتخاب کنید. دستور زیر متغیر را به کانتینر منتقل می‌کند و آن را در Git ثبت نمی‌کند.

توقف با `down` داده را نگه می‌دارد. `down -v` دیتابیس را حذف می‌کند و برای محیط دارای داده استفاده نشود.

## فاز اجرا ۳: staging و HTTPS

فایل `.env.staging.example` را به `.env.staging` کپی کنید. دامنه واقعی، ایمیل گواهی، hosts، origins، secrets و SMTP معتبر را وارد کنید. DNS به سرور اشاره کند و پورت‌های 80 و 443 باز باشند. از compose قبلی که همین پورت‌ها را اشغال می‌کند هم‌زمان استفاده نکنید. وب و API فقط روی loopback میزبان منتشر می‌شوند؛ Caddy مسیر `/api/*` و `/health` را به API و بقیه را به وب می‌فرستد.

`NEXT_PUBLIC_API_URL` خالی یعنی درخواست مرورگر به دامنه جاری؛ این مقدار زمان build ثابت می‌شود. بعد از تغییر آن وب را دوباره build کنید.

```powershell
docker compose --env-file deployment/.env.staging -f docker-compose.survey.yml --profile tls up -d --build
```

بررسی پذیرش: ورود مدیر، ساخت پرسشنامه، پیش‌نمایش، انتشار، ثبت پاسخ عمومی، گزارش، بسته‌شدن و جلوگیری از پاسخ جدید. دعوت ایمیل فقط پس از تنظیم SMTP واقعی بررسی شود. دامنه و سرور مقصد هنوز انتخاب نشده‌اند؛ این راهنما به معنی استقرار واقعی روی اینترنت نیست.

## فاز اجرا ۴: تولید، بکاپ و بازگشت

برای تولید فایل `.env.production.example` را کپی و مقادیر واقعی را تکمیل کنید. `DEBUG=false` و دامنه مجاز دقیق باقی بمانند. برای هر انتشار `RELEASE_TAG` یکتا انتخاب کنید تا تصاویر قبلی قابل بازگشت باشند؛ قبل از انتشار از دیتابیس و volume فایل‌ها بکاپ بگیرید. تصاویر قدیمی را تا پایان دوره بازگشت حذف نکنید.

```powershell
./scripts/backup-survey.ps1 -EnvironmentFile deployment/.env.production
./scripts/rollback-survey.ps1 -EnvironmentFile deployment/.env.production -ReleaseTag production-001
./scripts/restore-survey.ps1 -EnvironmentFile deployment/.env.production -BackupFile backups/survey-YYYYMMDD-HHMMSS.dump -ConfirmOverwrite
```

بکاپ در قالب custom PostgreSQL است؛ اسکریپت از انتقال باینری با `docker cp` استفاده می‌کند تا PowerShell داده را خراب نکند. نسخه‌های بکاپ رمزگذاری شده را بیرون از همان سرور نگه دارید. volume `survey_media` جداگانه با snapshot زیرساخت ذخیره و بازیابی شود. بازگشت تصویر فقط کد را برمی‌گرداند؛ migration معکوس خودکار انجام نمی‌دهد. اگر schema ناسازگار شد، بازیابی بکاپ پس از پذیرش از دست رفتن پاسخ‌های جدید لازم است. بازیابی را ابتدا روی staging تمرین کنید.

پایش سلامت:

```powershell
Invoke-RestMethod http://localhost:8003/health
docker compose --env-file deployment/.env.production -f docker-compose.survey.yml ps
docker compose --env-file deployment/.env.production -f docker-compose.survey.yml logs --tail 100 api web
```

healthcheck API سلامت HTTP فرایند را نشان می‌دهد؛ به تنهایی صحت SMTP، دیتابیس یا کل چرخه پرسشنامه را اثبات نمی‌کند. برای مانیتورینگ عملیاتی بررسی دوره‌ای چرخه پاسخ و سلامت دیتابیس اضافه کنید. فایل‌های محیط، logs و بکاپ‌ها نباید عمومی شوند.

