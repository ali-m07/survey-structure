# Survey Builder Development and Launch Plan

Date: 2026-10-09

Status: Historical initial plan based on documentation and independent code reviews by two agents. The baseline and proposed branch policy below describe the project before implementation. The initial eight development phases have since been implemented, integrated, and merged into and pushed to `main` at the user's request. Server staging and production deployment remain pending. Completion of the initial scope does not mean every aspirational feature below or full QuestionPro feature parity has been delivered; see `IMPLEMENTATION_PROGRESS.md` for implemented capabilities and remaining limitations.

## Goal

Complete the survey creation, preview, publication, response, distribution, and analysis lifecycle with capabilities comparable to QuestionPro. Completion is measured by working product flows; claims of “100% complete” in older documents are not acceptance criteria.

## Original Baseline Before Implementation

- The Survey → Section → Question and Participant → Submission → Answer structures exist.
- The model defines ten question types; the builder exposes eight and currently supports adding and deleting questions.
- The public response page does not match the distribution link.
- Response validation, administrative access, and organization isolation need completion.
- Invitations, QR codes, and some reports are partially implemented.
- API addresses are inconsistent across pages and hooks.
- The existing Docker Compose starts infrastructure but excludes the survey web app and API. Grafana and the web app both use port 3000.

## Original Change and Commit Policy

This was the policy proposed at planning time. Implementation was subsequently merged into and pushed to `main` following the user's explicit instruction, superseding the original branch-only push proposal.

1. Develop on `codex/survey-platform`.
2. Each independent, reviewable change receives its own commit; related changes across several files may share one commit.
3. Record the reason, acceptance criteria, and verification result for each change in the progress report.
4. The lead agent owns integration and commits. Agents modify only files within their assigned scope and do not overwrite others' changes.
5. Backend, interface, and launch work proceed in parallel once the API contract is stable. Shared files have a single owner.
6. Secrets and local environment files must not enter commits.
7. Push to the development branch; do not directly replace `main` with a large change. This original proposal was superseded by the user's later instruction to merge and push to `main`.

## Development Phases: Eight Phases

The following sections preserve the original tasks and acceptance criteria. Refer to the progress report for the delivered scope rather than interpreting every planned item as a completed feature.

### Phase 1 — Data Foundation, Access, and API Contract

Tasks: Unify the API; authenticate administrators; implement organization membership and restrict all resources to authorized organizations; separate public response routes; save responses transactionally; validate question ownership, type, options, and required status. Review existing migrations and the fresh installation path.

Acceptance: An administrator from organization A cannot access organization B's data; invalid responses are not saved; fresh installation and migrations succeed.

Suggested commits: `unify survey API configuration`; `enforce survey tenant permissions`; `validate submissions atomically`.

### Phase 2 — Complete Builder

Tasks: Edit surveys, sections, and questions; duplicate and reorder items; configure options and pagination; show save status; autosave with error handling; preview using the shared response engine.

Acceptance: A survey with multiple sections can be created, reordered, edited, and reopened without losing changes.

Suggested commits: `edit survey structure`; `duplicate and reorder questions`; `add builder save state and preview`.

### Phase 3 — Question Types and Settings

Tasks: Complete text, single choice, multiple choice, date, rating, Likert, matrix, and ranking questions; add number, email, yes/no, and NPS questions; configure selection limits, scale ranges, and an Other option. Offer file and audio questions only with real storage, size limits, and access controls.

Acceptance: Every exposed question type works from builder configuration through response submission and data export; incomplete types are not presented as ready.

Commits: Independent groups of question types and their related settings.

### Phase 4 — Survey Logic Engine

Tasks: Conditional visibility; question and section branching; reuse earlier answers; optional random ordering; validation of invalid references and cycles. Define a consistent contract for browser logic execution and server validation.

Acceptance: The response path changes according to conditions; hidden required questions do not block submission; invalid logic cannot be published.

Commits: `logic schema and validation`; `conditional visibility`; `branching and answer piping`.

### Phase 5 — Respondent Experience

Tasks: A public route consistent with the distribution link; mobile presentation; Persian and right-to-left layout; progress bar; temporary saves and response resumption; completion and error states; repeat-response restrictions based on survey settings.

Acceptance: A respondent can open a published survey without an administrator account, resume it, and submit a valid final response; drafts are not publicly accessible.

Commits: `public survey runner`; `response resume and completion`; `Persian mobile accessibility`.

### Phase 6 — Publication and Distribution

Tasks: Draft, published, and closed lifecycle; immutable published survey versions; public links and token-based invitations; real QR codes; email and reminders with delivery and failure states; scheduling and participants. SMS depends on a real provider.

Acceptance: Draft changes do not corrupt earlier responses; expired links and closed surveys reject responses; invitation success is recorded only after valid delivery.

Commits: `survey publication lifecycle`; `invitation links and QR`; `email delivery and reminders`.

### Phase 7 — Analytics and Exports

Tasks: Responses and completion rates; charts by question type; filters and comparisons; NPS; CSV and Excel exports; real PDF output; text analysis with a fallback when AI is unavailable; preserve anonymity in reports.

Acceptance: Counts and exports match stored responses; Persian is preserved in output; another organization's responses never enter the report.

Commits: `response analytics`; `data exports`; `printable reports`; `optional text insights`.

### Phase 8 — Additional Features and Final Preparation

Tasks: Template library; team collaboration and roles; change history; webhook integration with retries; performance improvements and accurate documentation; review the complete lifecycle and fix issues.

Acceptance: Features report their real status; the creation-to-reporting scenario works with different users; limitations are documented.

Commits: `survey templates`; `team collaboration and audit`; `webhook integrations`; `final hardening and documentation`.

## Launch Phases: Four Phases

### Launch 1 — Reproducible Development Environment

Prerequisite: Development phase 1 and a defined API contract.

Tasks: Inspect installed tools; provide Windows-compatible commands; dependencies and lockfiles; sample configuration; migrations; a local administrator account; start the web app and API; resolve the Grafana port conflict.

Deliverable: A local address and startup instructions for a fresh installation. Acceptance: A healthy API and accessible interface using synthetic sample data.

### Launch 2 — Integrated Local Version

Prerequisite: Development phases 1 through 6.

Tasks: Product-specific Docker Compose with the web app, API, and PostgreSQL; health checks; persistent storage; optional seed data; verify creation, publication, response submission, and initial exports.

Deliverable: Integrated startup with one command. Enable extra services only when needed.

### Launch 3 — Server Staging Environment

Prerequisite: A successful integrated version and a specified server, domain, and deployment access.

Tasks: Configure the server environment; HTTPS; secrets; data migration; real email delivery; backups and restoration; error logging; deploy an identified commit with a rollback path.

Deliverable: A staging link for user review. If the deployment target is not yet specified, prepare deployment files and instructions and obtain target details when needed.

Current status: Pending server, domain, and deployment access. Prepared deployment artifacts and local verification do not constitute a completed staging deployment.

### Launch 4 — Production Release

Prerequisite: Completed development phases, staging review, and approval of release readiness.

Tasks: Final domain; backup before release; health and capacity checks; enable alerts; administrator guidance; document remaining limitations.

Deliverable: An operational service with a recorded version, backups, and an executable rollback path. Declare this phase complete only after observing a successful deployment and a real end-to-end lifecycle.

Current status: Pending staging and production deployment.

## Original Execution Order and Responsibilities

Start with development phase 1 and launch phase 1; then phases 2 and 3 with the shared response engine. Begin phase 4 after establishing question contracts; phases 5 and 6 after establishing the publication contract; then launch phase 2; development phases 7 and 8; and launch phases 3 and 4.

- Backend agent: Survey service, models, API, migrations, and server logic.
- Interface agent: Builder and respondent interface in `frontend`, following the established API contract.
- Launch agent: Startup files, Docker, and installation documentation, without modifying code owned by others.
- Lead agent: Contracts, integration, verification of results, commits, and pushes.

This plan does not assign speculative dates or progress percentages. Phase completion is reported against acceptance criteria and recorded commits. The progress report records actual implementation results and remaining limitations.
