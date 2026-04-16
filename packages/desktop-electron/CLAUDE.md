# desktop-electron Agent Notes

## Purpose

This package packages the web game as a desktop Electron app. It builds the game, copies `packages/game/dist` into
`dist/renderer`, and serves it through a custom secure `app://bundle` protocol.

## Security

Preserve the current security posture unless the user explicitly asks otherwise:

- `contextIsolation: true`
- `nodeIntegration: false`
- `sandbox: true`
- no preload exposing Node APIs to the renderer unless reviewed as a security boundary
- custom protocol limited to the renderer directory
- path traversal checks before serving files
- COOP/COEP/CORP headers for the game runtime and WASM/SharedArrayBuffer needs

Do not load remote content in the main window. The renderer should come from the built game bundle.

## Protocol And Assets

The protocol handler must continue to support:

- `GET` and `HEAD`,
- range requests for media,
- correct content types for game assets including `.wasm`, `.glb`, `.env`, audio, images, CSS and JS,
- fallback to `index.html` only for app routes, not missing assets,
- dev reload only when `COSMOS_DESKTOP_DEV=1`.

If you change paths, keep `scripts/clean-game-dist.mjs`, `scripts/sync-game-dist.mjs`, `scripts/wait-for-renderer.mjs`,
and `src/main.ts` in sync.

## Packaging

Run:

```sh
pnpm --filter @cosmos-journeyer/desktop-electron typecheck
pnpm --filter @cosmos-journeyer/desktop-electron lint
pnpm --filter @cosmos-journeyer/desktop-electron build
```

Use `package` only when installer artifacts are required; it can be slow and platform-sensitive.

For changes to pure helpers such as range parsing, content types, or path checks, prefer extracting small functions and
adding tests rather than validating only through a packaged app.
