# Survey Builder Runbook

## Deployment phase 1: Windows and local development

Prerequisites are Python 3.12, Node 20 or later, and permission to install dependencies. Run from the repository root:

```powershell
./scripts/start-local.ps1 -Install
```

For subsequent runs, omit `-Install`. Local SQLite stores data in the service directory. The web application is available at http://localhost:3000 and the API health endpoint at http://localhost:8003/health. Output is saved in `logs`. If a port is already occupied, the script does not start that service again; check the health and identity of the service using that port.

Create an administrator using a real password rather than an example value:

```powershell
$env:SURVEY_ADMIN_PASSWORD = Read-Host 'Administrator password'
./services/3-survey_engine_service/.venv/Scripts/python.exe services/3-survey_engine_service/manage.py bootstrap_survey_admin --username admin --password $env:SURVEY_ADMIN_PASSWORD --tenant default
Remove-Item Env:SURVEY_ADMIN_PASSWORD
```

Sign in through the login page. The organization ID must match the tenant that was created. No example administrator with a fixed password is created automatically.

## Deployment phase 2: Unified Docker setup

Docker Desktop must be running with Linux containers. `docker-compose.yml` is the single source of configuration for running the application. The database is not exposed to the host, and its data persists in a volume. This single file manages PostgreSQL, migrations, the API, web application, worker, and optional HTTPS proxy.

```powershell
Copy-Item deployment/.env.local.example deployment/.env.local
```

Set `DATABASE_PASSWORD` and `SECRET_KEY` to long random strings. The actual environment file is not tracked in Git. Then run:

```powershell
docker compose --env-file deployment/.env.local -f docker-compose.yml config --quiet
docker compose --env-file deployment/.env.local -f docker-compose.yml up -d --build
docker compose --env-file deployment/.env.local -f docker-compose.yml ps
docker compose --env-file deployment/.env.local -f docker-compose.yml logs --tail 100 api web migrate
```

PostgreSQL becomes healthy first, migrations run next, and then the API, web application, and background worker start. The `jobs` service checks the webhook queue and enabled reminders every 30 seconds; delivery failures are visible in logs and attempt records. Reminders require `reminders_enabled` and a successfully delivered invitation. Create an administrator inside the container:

```powershell
docker compose --env-file deployment/.env.local -f docker-compose.yml exec -e ADMIN_PASSWORD api python manage.py bootstrap_survey_admin --username admin --tenant default
```

Creating the first administrator requires `ADMIN_PASSWORD` or `--password`; choose a password of at least 10 characters. The command above passes the variable into the container without recording it in Git.

Stopping with `down` preserves data. `down -v` deletes the database and must not be used in an environment containing data that must be retained.

## Deployment phase 3: Staging and HTTPS

Copy `.env.staging.example` to `.env.staging`. Provide the actual domain, certificate email address, hosts, origins, secrets, and valid SMTP settings. DNS must point to the server, and ports 80 and 443 must be open. Do not run another Compose setup that occupies these ports at the same time. The web application and API are exposed only on the host's loopback interface; Caddy routes `/api/*` and `/health` to the API and all other paths to the web application.

An empty `NEXT_PUBLIC_API_URL` makes the browser send requests to the current domain; this value is fixed at build time. Rebuild the web application after changing it.

```powershell
docker compose --env-file deployment/.env.staging -f docker-compose.yml --profile tls up -d --build
```

Acceptance checks: administrator login, survey creation, preview, publication, public response submission, reporting, survey closure, and rejection of new responses after closure. Check email invitations only after configuring a real SMTP server. The destination domain and server have not yet been selected; this runbook does not establish that the application has been deployed publicly.

## Deployment phase 4: Production, backup, and rollback

For production, copy `.env.production.example` and fill in actual values. Keep `DEBUG=false` and an exact allowed domain. Choose a unique `RELEASE_TAG` for each release so that previous images remain available for rollback; back up the database and file volume before releasing. Retain old images until the rollback period ends.

```powershell
./scripts/backup-survey.ps1 -EnvironmentFile deployment/.env.production
./scripts/rollback-survey.ps1 -EnvironmentFile deployment/.env.production -ReleaseTag production-001
./scripts/restore-survey.ps1 -EnvironmentFile deployment/.env.production -BackupFile backups/survey-YYYYMMDD-HHMMSS.dump -ConfirmOverwrite
```

Database backups use PostgreSQL's custom format; the script uses `docker cp` for binary transfer to prevent PowerShell from corrupting the data. Keep encrypted backup copies outside the application server. If the API is running, the script also saves the `survey_media` volume in a separate tar.gz archive. When restoring files, stop the application and restore the corresponding archive into the file volume; database and file backups must come from the same backup run. Image rollback restores only code; it does not automatically reverse migrations. If the schema becomes incompatible, restoring a backup requires accepting the loss of newer responses. Practice restoration in staging first.

Health monitoring:

```powershell
Invoke-RestMethod http://localhost:8003/health
docker compose --env-file deployment/.env.production -f docker-compose.yml ps
docker compose --env-file deployment/.env.production -f docker-compose.yml logs --tail 100 api web
```

The API health check indicates the process's HTTP health; by itself, it does not establish that SMTP, the database, or the complete survey lifecycle works correctly. Add periodic response-lifecycle and database-health checks for operational monitoring. Environment files, logs, and backups must not be made public.

## Multi-stage image builds

The API has two stages: dependency installation in an isolated Python environment, followed by copying that environment into a non-root runtime image. The web application has three stages: dependency installation, the Next.js build, and standalone output execution as the `node` user. The web runtime image receives only the files required for the server, pages, static assets, and public assets.

Run all product services from the repository root:

```powershell
docker compose --env-file deployment/.env.local up -d --build
```

The `survey-platform` project name and existing volumes are preserved. Migrations run before the API; the worker and web application start after the API becomes healthy. For HTTPS, use the same file with `--profile tls`.

## AI survey proposals

The survey builder supports a goal, audience, language and desired question count. AI proposals are not saved until the author reviews them and chooses to add the selected questions. Applying a proposal appends new pages atomically and preserves existing questions. Only organization administrators/editors may generate/apply to a draft.

Configure server-only `AI_PROVIDER`, `AI_BASE_URL`, `AI_MODEL`, `AI_TIMEOUT` (up to 90 seconds), and `AI_API_KEY` when required. The Ollama endpoint uses its `/api/chat` API; an OpenAI-compatible base URL includes `/v1`. Never put provider credentials in `NEXT_PUBLIC_` variables.

For the local Windows Docker setup, use `AI_PROVIDER=ollama` and `AI_BASE_URL=http://host.docker.internal:11434`. Download a model on the host and use its exact name in `AI_MODEL`. The local build uses `registry.ollama.com/library/qwen3:1.7b`; the alternate official registry is useful when the default registry cannot be reached. Model weights are not committed or included in the application image. Manual creation works if generation is unavailable.

Provider configuration examples are in `deployment/.env.example`. Production must use a model service reachable from the API container. The model's output is a draft suggestion requiring human review, not a validated research instrument.