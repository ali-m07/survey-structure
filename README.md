# Survey Structure

A survey platform with a Next.js interface and a Django REST Framework API. The project is organized into eight development phases and four rollout stages.

## Project status

The initial implementation of all eight development phases is complete and has been integrated and run locally. The changes have been pushed to `main`. External deployment is still pending. This milestone does not represent full QuestionPro feature parity or verified production capacity.

Older reports labeled “100% complete” or “production ready” are not validation of the current version. Refer to the [implementation report](IMPLEMENTATION_PROGRESS.md) for verified results and limitations, and the [implementation plan](IMPLEMENTATION_PLAN.md) for the original scope and acceptance criteria.

## User journey

1. An administrator signs into their organization and creates a draft survey.
2. They configure sections, questions, options, and display logic, then preview the survey.
3. They publish the prepared survey and distribute a public link or individual invitations.
4. Respondents submit answers through the public survey page.
5. The administrator reviews and exports their organization's responses and reports.

## Repository structure

- `frontend/`: administration interface, survey builder, and respondent interface.
- `services/3-survey_engine_service/`: survey models, permissions, API, and survey logic.
- `scripts/`: local startup and test runners.
- `deployment/` and `docker-compose.yml`: standalone product deployment.
- `.github/workflows/survey-platform.yml`: backend checks and frontend build checks.
- Other `services/`: the original broader platform structure; not all services are needed to run the core survey product.

## Setup and deployment

Installation, administrator creation, local startup, Docker, backups, and deployment instructions are documented in the [runbook](RUNBOOK.md). External deployment requires a target server, domain, and environment configuration.

Environment settings and secrets are stored in local files and excluded from the repository. Example configuration files document variable names only.

## API contract

Base path: `/api/v1/survey/`.

Administrative endpoints use token authentication and organization membership. Public survey submissions have a separate route. Published survey structures remain immutable; structural changes require a new draft.

## Development workflow

Each independent change is recorded in its own commit. Backend, frontend, and deployment work have separate owners; the coordinating agent handles integration and progress reporting. Phase completion is reported against its acceptance criteria, with any remaining limitations documented.

## Test runner

Run all survey checks from the repository root:

```powershell
python scripts/run-tests.py
# Windows shortcut:
./scripts/test.ps1
```

Use `--install` on first setup to install Python requirements and locked npm dependencies. Select one part with `--suite backend` or `--suite frontend`. `make test` runs the same runner.

The backend checks Django configuration, missing migrations, and survey tests using SQLite and Django's isolated test database. The frontend runs a production build (including Next lint checks) and TypeScript checks. Frontend checks write build output, so stop a local frontend development server before running them. The runner returns a nonzero exit code on failure and writes logs and `summary.json` under ignored `test-results/<suite>/`.

GitHub Actions runs the two suites in parallel on pushes and relevant pull requests. It also supports manual runs through **Actions → Survey platform checks → Run workflow** and uploads the reports even when checks fail. The latest local run passed all 16 backend tests, configuration and migration checks, the frontend build, and TypeScript checks. The online Actions result has not yet been verified.
