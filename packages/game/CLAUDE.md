# game Agent Notes

## Purpose

This is the main Cosmos Journeyer game: Babylon.js rendering, procedural universe, local backend, saves, UI, audio,
controls, missions, playgrounds, and E2E visual tests.

Read the root `VISION.md` before product/gameplay/narrative work and root `ARCHITECTURE.md` before structural changes.
Read root `TRANSLATIONS.md` before touching locale files, i18next keys, or player-facing text.

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

Follow the key conventions and safety notes documented in root `TRANSLATIONS.md`.

## CDLOD Terrain System

The planetary terrain uses a Continuous Distance-Dependent LOD system. The TypeScript side lives entirely under
`src/ts/frontend/universe/planets/telluricPlanet/terrain/`. The Rust/WASM generation engine lives in
`packages/terrain-generation/`.

### Key files

| File                                  | Role                                                                                       |
| ------------------------------------- | ------------------------------------------------------------------------------------------ |
| `terrain/chunks/chunkTree.ts`         | Per-face quadtree; decides which chunks to create/destroy each frame                       |
| `terrain/chunks/chunkForgeWorkers.ts` | Dispatches `BuildTask`s to the worker pool; applies WASM results back on the main thread   |
| `terrain/chunks/planetChunk.ts`       | Owns one Babylon.js mesh + physics aggregate + instance patches for a single LOD chunk     |
| `terrain/chunks/workerPool.ts`        | Priority queue of workers ordered by chunk depth (shallow = higher priority)               |
| `terrain/chunks/deleteSemaphore.ts`   | Defers disposal of old chunks until all replacement chunks are fully loaded                |
| `terrain/workers/buildScript.ts`      | Worker entry point; calls WASM `build_chunk_vertex_data`, returns transferables            |
| `telluricPlanet.ts`                   | Owns 6 `ChunkTree` instances (one per cube face); calls `updateLOD` each frame             |
| `telluricPlanetMaterial.ts`           | Node Material shader: tri-planar texturing, PBR, normal maps, ocean/atmosphere integration |

### Frame pipeline

```
StarSystemController.update()
  └─ TelluricPlanet.updateLOD(observerPosition, chunkForge)
       └─ ChunkTree[6].update()
            └─ updateLODRecursively()       ← subdivide or merge based on angular distance
                 └─ chunkForge.addTask()    ← enqueue BuildTask

chunkForge.update()
  ├─ available worker → postMessage(BuildData) → WASM
  └─ onmessage(ReturnedChunkData)
       └─ PlanetChunk.init(vertexData, instanceMatrices, assets)
            ├─ mesh.applyVertexData()
            ├─ PhysicsAggregate (only for high-res chunks near surface)
            └─ InstancePatch / ThinInstancePatch (rocks, trees, grass, butterflies)

DeleteSemaphore.update()
  → dispose() old chunks only once all replacement chunks are loaded
```

### LOD depth formula

```
maxDepth = ceil(log2(planet_diameter / (MIN_VERTEX_SPACING × VERTEX_RESOLUTION)))
targetLOD = clamp(floor(maxDepth
  - log2(1 + angularFactor × 2^range) × 0.8
  - log2(1 + distanceFactor × 2^range) × 0.8), minDepth, maxDepth)
```

### Instance patches

Two patch types exist side-by-side in `terrain/instancePatch/`:

- `InstancePatch` — Babylon.js `createInstance()`, one `InstancedMesh` per object; used for rocks and trees;
  supports custom shaders.
- `ThinInstancePatch` — GPU-side `thinInstanceSetBuffer()`; used for grass and butterflies; lower CPU overhead but
  limited shader access.

Both must be explicitly disposed in `PlanetChunk.dispose()`. Never let a patch outlive its parent chunk.

### Fragility points

- **Worker pool**: do not reuse a worker after `terminate()`. Reset and cancellation logic must have clear ownership.
  See root `CLAUDE.md` high-risk section.
- **DeleteSemaphore**: every subdivision/merge path that creates new chunks must register them with a semaphore before
  the old chunks can be disposed. Missing registrations cause visible holes.
- **ChunkForge singleton**: `StarSystemView` creates one `ChunkForgeWorkers` instance shared across all planets. Do
  not create per-planet instances; the worker pool budget is global.
- **Physics chunks**: a `PhysicsAggregate` is only created when
  `chunkSideLength / (VERTEX_RESOLUTION - 1) <= MAX_DISTANCE_BETWEEN_PHYSICS_VERTICES`. Changing resolution or that
  constant affects which chunks get collision bodies.

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
