# channel-packer Agent Notes

## Purpose

Channel Packer is a standalone Vite web utility for packing texture channels into RGBA PNG outputs. It has a small
pure packing core and a browser UI layer.

## Boundaries

Keep `src/packerCore.ts` DOM-free and testable. Browser APIs such as `File`, `Blob`, `canvas`, `createImageBitmap`, and
`crypto.subtle` belong in `src/packer.ts` or UI modules, not in the core.

Use adapters when adding alternate input/output paths. Preserve the current split:

- core: request validation, cache synchronization, dimension checks, pixel packing,
- browser adapter: file hashing, image decoding, preview resize, PNG encoding,
- app/UI: drag/drop, state, controls, user interaction.

## Pixel Correctness

Texture packing must be byte-exact. Be explicit about channel offsets, fill constants, source channels, dimensions, and
cache invalidation. Do not introduce color-space conversions, premultiplication, smoothing, or alpha manipulation in the
full-size packed output unless the UI and tests clearly request it.

Preview resizing may smooth pixels, but saved PNG output should preserve packed channel values.

## Tests

Run:

```sh
pnpm --filter @cosmos-journeyer/channel-packer test:unit
pnpm --filter @cosmos-journeyer/channel-packer typecheck
pnpm --filter @cosmos-journeyer/channel-packer lint
```

Add focused Vitest coverage for new packing behavior, state transitions, cache signatures, missing inputs, dimension
mismatches, and error messages. Prefer small synthetic `Uint8ClampedArray` fixtures over image files for core tests.

## UX

Keep error messages actionable for artists: tell the user what texture is missing, which dimensions mismatch, or why
export failed. Avoid throwing raw browser errors through the UI.
