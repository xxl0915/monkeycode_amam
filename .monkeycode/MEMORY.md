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
  - Vite dev/preview proxies `/api` to `http://127.0.0.1:8787`; generation features need both `npm run server` and `npm run dev` running.
  - Runtime data is persisted to `server/data/db.json` (gitignored); deleting it resets users, credits and jobs.
  - Upstream model vendors are not integrated; the fake worker produces sample images from `public/product-scenes/samples/`.

[Project Knowledge Summary]
- Date: 2026-09-22
- Context: Discovered by Agent while reviewing the vendored canvas integration
- Category: Build Methods
- Instructions:
  - `vendor/infinite-canvas` is a shallow-cloned React sub-app (gitignored); its built assets are served statically from `public/ic/` and mounted at `/ic/canvas`.
  - Rebuild it in an isolated dir (`/tmp/ic-build/web`) with `VITE_BASE=/ic/` and a large Node heap (2Gi) to avoid OOM; do not use bun in this environment.
  - Avoid `manualChunks` splitting `react`/`vendor` separately: the earlier split created a circular ESM chunk that froze the page on "加载画布…".
