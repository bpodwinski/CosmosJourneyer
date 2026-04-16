# Cosmos Journeyer Translation System (i18n)

## Scope

The translation system currently applies to the game package (`packages/game`), not the Next.js website package.

## Stack

- Library: `i18next`
- Entry point: `packages/game/src/ts/i18n.ts`
- Resource root: `packages/game/src/locales`
- Current locales: `en-US`, `fr-FR`

## Runtime Behavior

`initI18n()` does the following:

1. Select language from URL query param `?lang=...`, else fallback to `navigator.language`.
2. Initialize i18next with:
    - `fallbackLng: "en-US"`
    - `resources` loaded from `src/locales`
3. Translate static DOM nodes with `data-i18n` attributes.

The game startup calls `await initI18n()` before most UI/runtime flows are initialized.

## Resource Loading Model

Resources are bundled at build time using `require.context("../locales/", true, /\.json$/)`.

Folder and filename mapping:

- `src/locales/en-US/common.json` -> namespace `common`
- `src/locales/en-US/notifications.json` -> namespace `notifications`
- `src/locales/en-US/missions/common.json` -> key path prefix `missions:common:*`
- `src/locales/en-US/tutorials/flightTutorial.json` -> key path prefix `tutorials:flightTutorial:*`

Important constraint from `i18n.ts`:

- Each JSON file is parsed as a flat object `Record<string, string>`.
- Do not use nested JSON objects inside a single locale file.

## Key Usage Patterns

Use:

- `i18n.t("namespace:key")`
- `i18n.t("namespace:key", { interpolationVars... })`

Examples:

- `i18n.t("notifications:saveOk")`
- `i18n.t("common:sellFor", { price: "1200 credits" })`
- `i18n.t("sidePanel:lastPlayedOn", { val: new Date(...), formatParams: ... })`

## HTML In Translations

Some strings intentionally contain HTML links and are rendered with `innerHTML` in UI panels (`contributePanel`, `aboutPanel`).

Rules:

- Keep HTML usage limited to trusted, reviewable text (e.g. project links, email links).
- Never inject untrusted user input into translated HTML strings.
- Prefer `textContent` for normal labels/messages.

## Adding Or Updating Translations

### Update existing language

1. Edit JSON files under the target locale (`en-US` or `fr-FR`).
2. Keep key names stable unless you also update all call sites.
3. Run game and verify with URL language override:
    - `...?lang=en-US`
    - `...?lang=fr-FR`

### Add a new language

1. Create a new folder under `packages/game/src/locales/<locale-code>`.
2. Copy all files/subfolders from `en-US`.
3. Translate values only, keep file names and key names identical.
4. Test with `...?lang=<locale-code>`.

No extra registry step is required: files are auto-discovered during build.

## Consistency Checklist For PRs

- No new player-facing hardcoded English string in TS where i18n is expected.
- Key exists in `en-US`.
- Matching key also exists in `fr-FR` (or missing keys are called out explicitly in PR notes).
- Interpolation placeholders are preserved across languages (`{{price}}`, `{{systemName}}`, etc.).
- If using HTML translations, verify rendered links and ensure trusted content only.

## Known Notes

- `packages/game/src/locales/fr-FR/sidePanel.json` is currently missing:
    - `audioSettings`
    - `musicVolume`
- Website (`packages/website`) currently has no i18n framework configured.
