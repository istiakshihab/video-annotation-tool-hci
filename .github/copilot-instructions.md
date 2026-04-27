# Copilot Instructions

## Commands

```bash
npm run dev       # start dev server at http://localhost:5173
npm run build     # production build
npm run lint      # run ESLint
npm run preview   # preview production build locally
```

No test suite exists. There is no backend.

## Architecture

Single-page React 19 app (Vite). No server — all state is client-side.

**Data persistence:**
- **IndexedDB** (`annotation-tool`, version 2, store `sessions`): stores annotation sessions (id, videoName, annotations array, segmentStart, lastTask, schemeId, timestamps). See `src/utils/db.js`.
- **`localStorage`**: stores active scheme under key `vat-scheme`; theme preference under `vat-theme`.

**State lives in `App.jsx`**: annotations array, current segmentStart, modal open state, scheme, sessionId, theme, and video filename. All major handlers are defined there and passed down as props.

**Scheme system** (`src/utils/scheme.js`): the annotation form is entirely driven by a `scheme` object with a `levels` array. Each level has an `id`, `label`, `type` (`select` or `text`), and optionally `dependsOn` + `optionsByParent` for cascading selects. The default scheme is `DEFAULT_SCHEME` in `scheme.js` (not `constants.js` — that file is legacy and no longer used by the form). `AnnotationForm` renders one control per level dynamically.

**Annotation object shape**: each annotation stored in state contains:
- `id`, `timeStart`, `timeEnd`, `comment`
- For each scheme level: `annotation[level.id]` (the option value, e.g. `"WC"`) and `annotation[level.id + "Label"]` (the full label string, e.g. `"WC (WRITE CODE)"`)
- `featureTask`: backward-compat field set to the task label string; used by CSV export and session save/restore

**CSV export** (`src/utils/exportCsv.js`): uses a hardcoded legacy header (`Time Start,Time End,Primary Code,Secondary Code,Task,Comment`) and the `primaryCodeLabel`/`secondaryCodeLabel` fields (with fallback to `primaryLabel`/`secondaryLabel` for old annotations).

**Timestamp format**: `H:MM:SS` strings throughout (e.g. `"1:23:45"`). Conversion helpers `secondsToTimestamp` / `timestampToSeconds` are in `exportCsv.js`.

## Key Conventions

**CSS design system**: all styling uses CSS custom properties defined in `src/index.css`. Light/dark themes are toggled via `data-theme="dark"` on `<html>`. Do not use Tailwind utility classes — the project has Tailwind installed but the design system is entirely custom CSS classes (`.btn`, `.btn-primary`, `.f-input`, `.modal-card`, etc.).

**Task level convention**: the task level is always the **last level** in `scheme.levels`. `AnnotationForm` uses `scheme.levels[scheme.levels.length - 1]` to find it. `App.jsx` tracks `lastTask` and passes it as `defaultTask` to the modal so the task selection is sticky across segments.

**Scheme dependency resolution**: when a `select` level has `dependsOn`, changing the parent resets all transitive dependents to their first available option. This cascades via a `while (hadChanges)` loop in `handleLevelChange`.

**`constants.js` is legacy**: `PRIMARY_CODES`, `SECONDARY_CODES`, and `DEFAULT_SECONDARY` in `src/constants.js` predate the scheme system. They are no longer imported anywhere — use `DEFAULT_SCHEME` from `src/utils/scheme.js` instead.

**No Tailwind in components**: Bootstrap 5 is a dependency but only Bootstrap utility classes like `d-none d-md-flex` are used sparingly in `App.jsx`. Prefer the custom CSS design system for new UI.

**Vite base path**: `vite.config.js` sets `base: '/video-annotation-tool-hci/'` for GitHub Pages deployment. Keep this when modifying the config.
