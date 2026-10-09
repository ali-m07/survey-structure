# Deployment Validation — 2026-10-09

- Final local deployment ran on Docker Desktop 29.8.0: web at `http://localhost:3000`, API at `http://localhost:8003`, and PostgreSQL 16 on a persistent volume.
- The `postgres`, `api`, and `web` services reached healthy status. The `jobs` worker runs the webhook and reminder cycle every 30 seconds.
- Compose passed `config --quiet`; PowerShell files were parsed without syntax errors.
- A fresh PostgreSQL installation successfully applied migrations 0001 through 0006.
- Web dependency installation with `npm ci` succeeded on Linux; the lockfile was regenerated in a clean Linux environment to prevent optional Windows dependencies from breaking CI.
- The final Next 15.5.27 build succeeded, including type checking and 13 pages. Development dependencies were removed from the runtime image; the runtime dependency audit reported zero vulnerabilities.
- The API health endpoint, login page, and public GET through the same-origin path `/api/v1/survey/public/surveys/1/` returned HTTP 200.
- The redirect issue between Next and Django was fixed: the proxy preserves the API's trailing slash so POST requests are not converted to GET requests.
- A custom-format database backup and file archive were created. The database backup was restored into a separate temporary database; 28 migrations were readable, and the verification database was deleted afterward. The product database was not overwritten.
- Caddy configuration passed `caddy validate`. HTTPS has not been deployed on a public server; the domain, server, and certificate email address must be selected for staging and production.
- The actual environment file, administrator credentials, and backups are not tracked in Git. Development SQLite remains in place, while Docker deployment data is stored independently in PostgreSQL.

Product lifecycle and interface checks are recorded in the main development report. Instructions for repeating deployment, backup, and rollback are in `RUNBOOK.md`.

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
