# Implementation Task List

Feature: server-model-proxy

## Tasks

- [x] Align `server/catalog.js` `models` with frontend `onlineModels` ids (`nano-banana`, `nano-pro`, `seedream`, `gpt-image`, `kling`, `seedance`)
- [x] Add `server/vendor.js`: per-model env credentials, prompt builder, size mapping, Node built-in HTTP to `/v1/images/generations` and `/v1/images/edits`
- [x] Update `server/worker.js`: `fake` keeps sample pool; `live` calls vendor, persists outputs as `role=output` assets, maps vendor errors and refunds
- [x] Add `.env.example` with `AMAM_VENDOR_*` placeholders only
- [x] Map vendor error codes to Chinese in `src/api/client.js`
- [x] Extend `tests/generation-pipeline.test.js` with mock vendor server cases listed in design.md
- [x] Update `.monkeycode/docs/INTERFACES.md`, `ARCHITECTURE.md`, and Job concept for live vendor outputs
- [x] SenseNova: JSON `images` edits, `watermark: false`, frontend slots default to `u1.5-fast` / `u1.5-lite`
