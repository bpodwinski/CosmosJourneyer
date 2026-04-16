# babylonjs-shading-language Agent Notes

## Purpose

This package is a source-only TypeScript helper layer over BabylonJS NodeMaterial blocks. It exists to make shader
graphs readable and composable without using Babylon's visual node editor.

The package is public API surface: every exported helper in `src/index.ts` may be used by the game or external
consumers.

## API Contract

Do not rename exported helpers, change return types, or change connection semantics casually. Most helpers return
`NodeMaterialConnectionPoint`; some intentionally return Babylon blocks such as `InputBlock` when callers need to set
uniforms later.

When adding helpers:

- follow the existing functional style: create blocks, configure target/options, connect inputs, return the relevant output,
- keep type aliases narrow enough to catch invalid attribute names or options,
- support explicit `target` options where Babylon block target matters,
- avoid hidden scene/material state; helpers should build graph fragments, not own runtime resources.

## Babylon Compatibility

This package peers against `@babylonjs/core`. Check Babylon 8 NodeMaterial APIs before changing imports or block wiring.
Prefer official Babylon block classes over ad hoc wrappers when possible.

If raw Babylon API access is still needed for an advanced case, keep interop easy: helpers should not prevent callers
from mixing BSL with raw `NodeMaterial` blocks.

## Validation

Run:

```sh
pnpm --filter babylonjs-shading-language typecheck
pnpm --filter babylonjs-shading-language lint
pnpm --filter babylonjs-shading-language format:check
```

For new public helpers, add a small usage example in docs or tests if a local test pattern is introduced. At minimum,
ensure TypeScript catches wrong input types and that generated Typedoc remains valid with `pnpm --filter
babylonjs-shading-language doc`.
