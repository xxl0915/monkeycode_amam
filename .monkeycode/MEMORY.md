# User Instruction Memory

This file records user instructions, preferences, and teachings for reference in future interactions.

## Format

### User Instruction Entry
User instruction entries should follow this format:

[User Instruction Summary]
- Date: [YYYY-MM-DD]
- Context: [Mentioned scenario or time]
- Instructions:
  - [Content of user teaching or instruction, described line by line]

### Project Knowledge Entry
Entries discovered by the Agent during task execution should follow this format:

[Project Knowledge Summary]
- Date: [YYYY-MM-DD]
- Context: Discovered by Agent while performing [specific task description]
- Category: [Operations & Deployment|Build Methods|Testing Methods|Troubleshooting & Debugging|Workflow & Collaboration|Environment Configuration]
- Instructions:
  - [Specific knowledge points, described line by line]

## Deduplication Strategy
- Before adding a new entry, check for similar or identical instructions.
- If a duplicate is found, skip the new entry or merge it with the existing one.
- When merging, update the context or date information.
- This helps avoid redundant entries and keeps the memory file tidy.

## Entries

[Project Knowledge Summary]
- Date: 2026-09-22
- Context: Discovered by Agent while implementing the generation-job-pipeline
- Category: Operations & Deployment
- Instructions:
  - Local generation API lives in `server/` and runs with `npm run server` (Node built-in http, no deps), listening on `127.0.0.1:8787`.
  - Vite `server` and `preview` both proxy `/api` to `http://127.0.0.1:8787`; generation and asset thumbnails need both `npm run server` and `npm run dev` (or `preview`).
  - Runtime data is persisted to `server/data/db.json` (gitignored); deleting it resets users, credits, jobs and assets.
  - Uploaded reference images live in `server/data/files/` next to `db.json`; `AMAM_DB_FILE` also relocates that files directory.
  - Image jobs in `AMAM_VENDOR_MODE=live` call per-model OpenAI-compatible Images APIs via `server/vendor.js`; keys stay in `AMAM_VENDOR_*` env vars. `AMAM_VENDOR_MODE=fake` (used by `npm test`) still serves `public/product-scenes/samples/`.

[Project Knowledge Summary]
- Date: 2026-09-22
- Context: Discovered by Agent while reviewing the vendored canvas integration
- Category: Build Methods
- Instructions:
  - `vendor/infinite-canvas` is a shallow-cloned React sub-app (gitignored); its built assets are served statically from `public/ic/` and mounted at `/ic/canvas`.
  - Rebuild it in an isolated dir (`/tmp/ic-build/web`) with `VITE_BASE=/ic/` and a large Node heap (2Gi) to avoid OOM; do not use bun in this environment.
  - Avoid `manualChunks` splitting `react`/`vendor` separately: the earlier split created a circular ESM chunk that froze the page on "加载画布…".

[Project Knowledge Summary]
- Date: 2026-09-24
- Context: Discovered by Agent while adding generation-pipeline tests
- Category: Testing Methods
- Instructions:
  - Run tests with `npm test` (`node --test tests/generation-pipeline.test.js`).
  - Tests isolate storage via `AMAM_DB_FILE` so they do not touch `server/data/db.json`.
  - `settleCredits` / `refundCredits` are idempotent for the same `jobId`.

[User Instruction Summary]
- Date: 2026-10-08
- Context: User reported garbled/invented characters on generated product images and asked to avoid this going forward
- Instructions:
  - Generated images must not invent, misspell, or hallucinate on-image text, logos, prices, or slogans.
  - If the user did not supply exact copy, output a text-free product photo and keep only real brand marks already on the product.
  - SenseNova calls use `prompt_extend: false`; `buildPrompt` always appends the typography policy.
