# Cosmos Journeyer - Codex Agent Briefing

## Mission

Contribute maintainable, testable code aligned with Cosmos Journeyer's long-term open-source goal: a durable, high-quality space-exploration codebase that can keep evolving for years.

Treat this repository as a cathedral-scale game project, not a quick demo. Prefer changes that reduce coupling, preserve save compatibility, and keep rendering/runtime resources owned and disposable.

## Required Reading

Before non-trivial work, read these root documents:

- `README.md`
- `ARCHITECTURE.md`
- `CONTRIBUTING.md`
- `VISION.md`
- `TRANSLATIONS.md` (when touching player-facing text, locales, or i18n flow)

Then read package-level README files only as needed for the area you touch.

Always reread `VISION.md` when a task touches gameplay direction, narrative, exploration loops, onboarding/tutorials,
player-facing tone, world atmosphere, or prioritization tradeoffs. The file is the product north star: favor decisions
that reinforce wonder, cosmic scale, relaxed exploration, and purposeful narrative over combat/grind-oriented design.

Always reread `ARCHITECTURE.md` before changing package boundaries, `UniverseBackend`, `StarSystemView`,
`StarSystemController`, orbital object interfaces, terrain loading, save/model relationships, or any code that changes
how immutable universe data becomes runtime Babylon objects. Treat it as the architecture map, but verify details
against the current source before editing because the codebase evolves faster than the diagrams.

Always reread `TRANSLATIONS.md` before changing locale files, i18next keys, translated UI copy, or any player-facing
string flow in `packages/game`.

## Workspace Map

This is a pnpm workspace. Packages live in `packages/`.

- `packages/game`: main Babylon.js game. Most gameplay, rendering, UI, saves, procedural universe, missions, tests, and assets are here.
- `packages/website`: static-export Next.js website.
- `packages/desktop-electron`: Electron desktop shell serving the built game through a custom `app://bundle` protocol.
- `packages/physics`: pure formulas, constants, unit conversions, and orbital/stellar helpers.
- `packages/universe-model`: pure universe data models, discriminated unions, and Zod schemas.
- `packages/terrain-generation`: Rust terrain engine compiled to WebAssembly.
- `packages/babylonjs-shading-language`: source-only wrapper around BabylonJS NodeMaterial.
- `packages/channel-packer`: Vite web utility for texture channel packing.
- `packages/gaia-explorer`: Python/uv tool for querying and voxelizing Gaia data.

The game package is the main complexity center. Avoid changes spanning game and website unless the task explicitly requires it.

## Toolchain

Use the root manifests as the source of truth.

- Node.js: see root `package.json` engines. Current baseline is Node `>=24.0.0`.
- Package manager: `pnpm@10.18.0`.
- TypeScript is strict across packages.
- ESLint is type-aware and forbids circular imports with `import-x/no-cycle`.
- Formatting is handled by Oxfmt via `.oxfmtrc.json`.
- Rust/WASM work needs Rust, `wasm32-unknown-unknown`, and `wasm-pack`.
- E2E visual tests use Playwright and Git LFS snapshots.

If the local environment lacks pnpm, Node 24, dependencies, Rust, Playwright browsers, or Git LFS assets, state that clearly instead of pretending validation passed.

## Key Commands

Look at the relevant `package.json` before running commands. Common root commands:

```sh
pnpm install
pnpm build
pnpm test:unit
pnpm lint
pnpm typecheck
pnpm test:e2e
pnpm format:check
```

Useful package-scoped commands:

```sh
pnpm --filter @cosmos-journeyer/game build
pnpm --filter @cosmos-journeyer/game test:unit
pnpm --filter @cosmos-journeyer/game test:e2e
pnpm --filter @cosmos-journeyer/physics test:unit
pnpm --filter @cosmos-journeyer/website test:all
pnpm --filter terrain-generation test:unit
```

Before opening a PR, run build, unit tests, lint, and E2E tests when feasible. Follow `.github/PULL_REQUEST_TEMPLATE.md`; remove "Related Tickets" if no issue number is known.

## Architecture Model

The game separates data from runtime rendering:

- `UniverseBackend` generates or returns `StarSystemModel` data.
- `@cosmos-journeyer/universe-model` owns shared universe model types and schemas.
- `StarSystemLoader` instantiates Babylon objects from models.
- `StarSystemController` updates orbital objects, floating origin, gravity, shaders, facilities, targets, and LOD.
- `StarSystemView` coordinates the active in-system scene, controls, post-processes, interactions, UI layers, and star-system loading.
- `StarMapView` owns the galaxy map and routing/selection flow.
- `CosmosJourneyer` is the top-level orchestrator for engine startup, active view switching, menus, audio, tutorials, save/load, screenshots, and render loop.

Shared pure logic belongs in `packages/physics`, `packages/universe-model`, or a small tested helper, not deep inside UI or Babylon-specific classes.

When architecture is involved, preserve these boundaries unless the task explicitly requires moving them:

- Universe data models and schemas belong in `packages/universe-model`.
- Physics formulas, constants, and unit conversions belong in `packages/physics`.
- Procedural system generation belongs under `packages/game/src/ts/backend/universe`.
- Runtime Babylon orbital objects belong under `packages/game/src/ts/frontend/universe`.
- Terrain mesh generation spans `packages/terrain-generation` and the game-side `ChunkForge` pipeline.
- Save schemas, migrations, and save backends belong under `packages/game/src/ts/backend/save`.
- Player-facing UI belongs under `packages/game/src/ts/frontend/ui` and must respect i18next.
- Star map behavior belongs under `packages/game/src/ts/frontend/starmap`.
- Visual regression scenes belong under `packages/game/src/ts/playgrounds` with E2E coverage in `packages/game/tests/e2e`.

If a change crosses these boundaries, explain why the boundary crossing is necessary and add tests around the contract
being changed.

## Engineering Principles

- Prefer composition over inheritance. Use interface-based composition, discriminated unions, or small collaborators.
- Do not introduce circular dependencies.
- Prefer explicit dependencies and dependency injection over mutable globals and singletons.
- Treat GPU and browser resources as owned resources. Know who disposes meshes, materials, textures, buffers, workers, observables, audio nodes, and physics bodies.
- Prefer `const`, `readonly`, `ReadonlyArray<T>`, and immutable data flow when practical.
- Preserve save compatibility. Changes to save shape need versioned schemas, migrations, and tests.
- Player-facing strings must go through i18next. Locales currently include `en-US` and `fr-FR`.
- Prefer strong typing. Avoid `any`; use `unknown` only at boundaries and narrow it.
- Use Git LFS for large binary assets, screenshots, textures, models, WASM, and other large generated artifacts.

## Save Compatibility

Treat player saves as user-owned data. Prefer migration and fallback behavior over rejecting existing saves.

Never change save data shape casually. If a save schema changes structurally, add a new version folder under
`packages/game/src/ts/backend/save/vX`, keep migration from the previous version, update the exported current schema,
and add tests proving old saves still load.

For save-related changes, inspect `packages/game/src/ts/backend/save/README.md` first. Test current schema parsing,
old schema migration, invalid/corrupted input behavior, and backend import/export when relevant.

## Runtime Resource Ownership

Any code that creates Babylon meshes, materials, textures, render targets, post-processes, physics bodies,
observables, workers, audio nodes, or WASM-owned buffers must have an explicit disposal path.

When adding a runtime object, identify its owner and verify it is disposed when leaving a star system, switching views,
resetting terrain, closing UI, or replacing loaded assets. This is especially important under `StarSystemView`,
`StarSystemController`, `ChunkForge`, post-process managers, terrain chunks, orbital facilities, and procedural assets.

Do not hide long-lived runtime state in globals unless an existing subsystem already owns that state and documents the
lifecycle. Prefer passing dependencies explicitly.

## High-Risk Areas

Be especially careful around these known fragility points:

- Save backend fallback in `packages/game/src/ts/backend/backendLocal.ts`: OPFS and legacy localStorage fallback must both work. Test non-OPFS environments if changing this path.
- Terrain workers in `packages/game/src/ts/frontend/universe/planets/telluricPlanet/terrain/chunks/workerPool.ts`: do not reuse workers after `terminate()`. Reset/cancellation logic needs clear ownership.
- Universe plugins in `UniverseBackend`: plugins should not mutate persistent custom system models in place. Clone or return new data when adding anomalies/facilities/etc.
- Autosave on browser unload: async `beforeunload` is not reliable. Prefer periodic/event-driven saves as the real safety mechanism.
- Large orchestrators: `CosmosJourneyer` and `StarSystemView` are broad. Extract only when a concrete change naturally creates a small owned collaborator.
- Rendering snapshots: visual behavior often needs Playwright playground coverage, not only unit tests.

## Testing Guidance

Add focused unit tests for new logic or bug fixes. Put `*.spec.ts` next to TypeScript implementation where existing patterns do so.

Use Playwright visual tests for rendering, shader, scene composition, camera, and UI-over-canvas regressions. Existing E2E tests load `playground.html`, wait for a `canvas[data-*="1"]` flag, then compare screenshots.

Rendering changes should usually include or update a playground scene and a Playwright snapshot test. Prefer
deterministic scene setup: fixed seeds, fixed camera, frozen frame count, stable asset loading, and explicit canvas
readiness flags.

For save changes, test:

- current schema parsing,
- old schema migration,
- invalid/corrupted input behavior,
- backend import/export when relevant.

For model changes in `universe-model`, add schema or helper tests if possible. That package is data-critical even if currently under-tested.

For Rust terrain changes, run Rust formatting, clippy, and cargo tests through the package scripts when toolchain is available.

## Documentation Expectations

Keep documentation aligned with manifests. In particular, verify Node/pnpm versions, framework versions, package names, and dependency mode before editing docs.

Package READMEs should describe the current package behavior, not a past publishing or consumption model.

When editing package manifests, scripts, engines, dependency versions, workspace links, public package names, build
outputs, or deploy behavior, check the related README files in the same change. Do not leave docs describing old Node,
framework, package, or dependency behavior.

## Windows Notes

This workspace may be used from PowerShell on Windows. Prefer PowerShell-native commands and avoid bash-specific
assumptions unless the project script already uses bash.

Use `rg` when available, but fall back to PowerShell search commands if native tools fail in this environment. If Git
commands fail with transient Git-for-Windows process errors, retry with a narrower command before assuming repository
corruption.

Do not compose destructive filesystem commands across shells. For Windows file operations, prefer native PowerShell
cmdlets with explicit paths.

## Working Style

Read the surrounding implementation before editing. Follow existing conventions even when they are not your personal preference.

Keep patches scoped. Do not mix broad refactors with behavior changes unless the refactor is necessary to make the change safe.

When touching save data, universe generation, rendering resources, worker pools, or package boundaries, explain the ownership and compatibility assumptions in the PR description.

If validation cannot be run locally, say exactly what was skipped and why.
