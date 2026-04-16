# game Agent Notes

## Purpose

This is the main Cosmos Journeyer game: Babylon.js rendering, procedural universe, local backend, saves, UI, audio,
controls, missions, playgrounds, and E2E visual tests.

Read the root `VISION.md` before product/gameplay/narrative work and root `ARCHITECTURE.md` before structural changes.

## Main Boundaries

- `src/ts/backend`: save data, player serialization, universe generation, missions data, society, local backend.
- `src/ts/frontend`: Babylon runtime, assets, controls, UI, star map, star-system view, orbital objects, player runtime.
- `src/ts/playgrounds`: deterministic scenes used for debug and visual regression.
- `src/ts/utils`: shared helpers that are not product-domain packages.
- `src/locales`: i18next translations.
- `tests/e2e`: Playwright visual tests and Git LFS snapshots.

Prefer moving pure physics into `@cosmos-journeyer/physics` and pure universe model changes into
`@cosmos-journeyer/universe-model` instead of burying reusable logic in the game package.

## Runtime Ownership

Anything that creates Babylon resources must have a disposal path: scenes, meshes, transform nodes, materials, textures,
render targets, post-processes, physics bodies, observables, audio nodes, workers, and WASM-backed data.

Be especially careful when touching `CosmosJourneyer`, `StarSystemView`, `StarSystemController`, `ChunkForge`,
`PostProcessManager`, terrain chunks, orbital facilities, and procedural assets. System changes, view switches, and
save loads must not leak old runtime objects.

## Saves

Inspect `src/ts/backend/save/README.md` before save changes. Structural save changes require a new `vX` schema folder,
migration from the previous version, current schema update, and tests proving old saves still load.

Treat saves as player-owned data. Prefer migration, quarantine, and fallback behavior over hard failure.

## I18n

Player-facing strings belong in i18next locale files. Update both `en-US` and `fr-FR` when practical; otherwise make the
missing translation obvious in the PR notes.

## Rendering And E2E

Rendering, shader, scene composition, camera, UI-over-canvas, terrain, atmosphere, anomaly, station, and star map
changes usually need a playground scene and/or Playwright snapshot coverage.

Keep visual tests deterministic: fixed seeds, fixed camera, stable assets, frozen frame counts where useful, and clear
canvas readiness flags.

Run targeted checks:

```sh
pnpm --filter @cosmos-journeyer/game typecheck
pnpm --filter @cosmos-journeyer/game test:unit
pnpm --filter @cosmos-journeyer/game lint
pnpm --filter @cosmos-journeyer/game test:e2e
```

If updating screenshots, use `test:e2e:update` deliberately and review Git LFS snapshot diffs.
