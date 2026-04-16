# physics Agent Notes

## Purpose

`@cosmos-journeyer/physics` is a source-only, side-effect-free TypeScript package for formulas, constants, unit
conversions, and small domain helpers shared by the game and other packages.

This package must stay independent from Babylon, DOM APIs, game runtime state, and package-specific models.

## Units And Accuracy

Use SI units internally unless a function name explicitly says otherwise. Function names should make conversions clear,
for example meters, kilometers, astronomical units, light years, Kelvin, Celsius, Pascals, kilograms, seconds.

When adding formulas:

- document the expected units in JSDoc,
- cite a source or explain the approximation,
- handle edge cases such as zero mass, zero pressure, invalid ranges, or negative inputs deliberately,
- keep approximations stable enough for procedural generation and tests.

## API Contract

This package exports directly from `src/index.ts`. Avoid renaming exports or changing semantics without updating all
call sites in the game and tests.

Do not add dependencies unless there is a strong reason. Most physics helpers should remain pure functions over numbers
and simple readonly data.

## Tests

Run:

```sh
pnpm --filter @cosmos-journeyer/physics test:unit
pnpm --filter @cosmos-journeyer/physics typecheck
pnpm --filter @cosmos-journeyer/physics lint
```

Add `*.spec.ts` coverage for new formulas, conversions, boundary cases, and monotonicity/known-value checks. Prefer
tolerant numeric assertions for floating-point formulas.
