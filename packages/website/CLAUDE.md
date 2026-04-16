# website Agent Notes

## Purpose

This package is the public Cosmos Journeyer website built with Next.js static export. It is a presentation layer for
the game, roadmap, community links, and project messaging.

Read root `VISION.md` before changing public copy, roadmap framing, feature emphasis, or calls to action.

## Static Export

`next.config.js` uses `output: "export"` and unoptimized images. Keep routes, assets, and links compatible with static
hosting. Do not add server-only Next.js features unless deployment is changed at the same time.

Public assets live under `public/`; large media should follow the repository Git LFS policy.

## React Boundaries

Use `"use client"` only for components that need browser APIs, event handlers, refs, scrolling, or animation. Keep
metadata and layout server-compatible.

Central project constants live in `src/utils/constants.ts`. Update metadata, roadmap, social links, and public copy in
one place where possible.

## Product Tone

Website copy should match the project vision: exploration, wonder, cosmic scale, open source, relaxed discovery, and
purposeful narrative. Avoid drifting toward combat/grind-first marketing unless the vision changes.

Keep accessibility basics intact: semantic sections, useful alt text, keyboard-usable buttons/links, and readable text
over video/image backgrounds.

## Validation

Run:

```sh
pnpm --filter @cosmos-journeyer/website lint
pnpm --filter @cosmos-journeyer/website typecheck
pnpm --filter @cosmos-journeyer/website build
```

Use `pnpm --filter @cosmos-journeyer/website test:all` for the package's combined check.

If changing framework versions or public content, keep `README.md`, `package.json`, and `next.config.js` aligned.
