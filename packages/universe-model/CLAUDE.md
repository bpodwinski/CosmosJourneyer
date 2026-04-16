# universe-model Agent Notes

## Purpose

`@cosmos-journeyer/universe-model` is the data-only model package for star systems, coordinates, orbital objects,
facilities, anomalies, terrain settings, and schema definitions.

It must remain free of Babylon, DOM, game frontend, save backend, and procedural generation implementation details.

## Model Contract

Discriminated union `type` strings are public contracts. Changing them affects universe generation, runtime object
instantiation, saves, UI labels, missions, tests, and potentially player data.

When adding or changing a model:

- keep the model serializable,
- use readonly-friendly shapes where practical,
- update union exports in `src/orbitalObjects/index.ts` and `src/index.ts`,
- add or update Zod schemas when runtime validation is needed,
- verify `getObjectModelById` and related helpers still cover the new type if applicable.

## Boundaries

This package describes what exists, not how it is generated or rendered. Keep:

- procedural generation in `packages/game/src/ts/backend/universe`,
- rendering/runtime behavior in `packages/game/src/ts/frontend/universe`,
- formulas in `packages/physics`,
- save-version migration in `packages/game/src/ts/backend/save`.

## Compatibility

Model changes can become save compatibility changes. If a model is embedded in saves or stable IDs, coordinate systems,
or object IDs, coordinate with the game save schema and migration tests.

Avoid mutating shared model objects in consumers. Treat models as immutable blueprints.

## Validation

Run:

```sh
pnpm --filter @cosmos-journeyer/universe-model typecheck
pnpm --filter @cosmos-journeyer/universe-model lint
```

There are currently few package-local tests. Add focused tests when introducing schemas, helpers, ID behavior,
coordinate behavior, or new discriminated union members.
