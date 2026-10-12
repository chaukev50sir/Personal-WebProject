# Riverside Library Learning Portal

Accessible Community Resource Hub prototype for ticket **MD-2026-0143** (Local Public Library: Adaptive Learning & Resource Portal). Residents can search courses and learning archives, filter them, register for events and book study rooms, using a keyboard or a screen reader only.

**Stack:** React 18, Vite 5, Vitest + Testing Library + axe-core. No UI component library.

## Getting started

```bash
npm install
npm run dev        # development server on http://localhost:5173
npm test           # component and accessibility tests
npm run contrast   # WCAG contrast check for every colour pair
npm run build      # production build in dist/
```

The app uses hash routing, so `dist/` can be served as static files. Netlify settings are in `netlify.toml`. GitHub Actions (`.github/workflows/ci.yml`) runs the tests, the build and the contrast check on every push.

## Project structure

```
wireframes/          Part A: index.html, search.html, book.html, main.css,
                     persona.md, wcag-matrix.md
src/
  components/        Announcer, PageHeading, FilterGroup, ToggleButton,
                     BookingForm, ErrorSummary, Dialog, ResourceCard
  pages/             Home, Catalogue, ResourceDetail, BookRoom
  hooks/             useHashRoute
  data/              mock catalogue and room availability
  test/              component, keyboard and axe test suites
  styles.css, fonts/
scripts/             contrast.mjs, axe-audit.mjs
docs/                manual test log, Lighthouse and axe reports
```

## Wireframes and prototype

The wireframes are low fidelity: greyscale, a system font, and hatched placeholders where images go. They exist to prove structure, so every landmark has a colour-coded dashed outline and a tag naming it. The tags are `aria-hidden`, so assistive technology only sees the real page. They use no JavaScript; filter groups use `<details>`.

The React app applies the visual design. Each topic has a "book spine" colour used on cards, filter chips and tags, always paired with a text label. Focused links get a marigold highlight under dark text (8.83:1). Body text is set in Atkinson Hyperlegible, a typeface designed for low-vision readers.

---

## Technical write-up

### 1. Accessibility trade-offs

**Native controls over custom widgets.** Filter chips, accordion headers and the registration dialog are real `<button>` and `<dialog>` elements rather than styled `<div>`s. This limits the styling, and the date field keeps the browser's own picker. In return, Enter and Space activation, focusability and roles come from the browser, and there is less hand-written ARIA to drift out of sync. The single-choice "Format" filter uses native radios so arrow keys behave the way screen reader users expect.

**Native modal inertness instead of a scripted focus trap.** `showModal()` makes the rest of the page inert and Escape always closes the dialog. A keydown-based trap is a common cause of real keyboard traps (2.1.2). The cost is less control: Tab can reach the browser toolbar, but never the page behind. Confirming a registration removes the trigger button, so focus moves to the success message instead. Testing exposed a bug here: re-attaching the `close` listener on each render removed it in the same commit that closed the dialog, so focus was never returned. The listener is now attached once and reads its callbacks from refs.

**Live-region verbosity.** Search results change on every keystroke, and announcing each change would interrupt the user mid-word. Result counts are debounced by 600 ms and sent to one polite region. Field errors are shown on blur, not while typing. After a failed submit, focus moves to the error summary instead of firing an alert, because focus plus `role="alert"` makes NVDA read the same text twice.

### 2. How React state reaches the accessibility tree

ARIA state is derived from React state during render, never set imperatively, so the accessibility tree cannot disagree with the screen. `FilterGroup` keeps `open` in `useState` and renders `aria-expanded={open}` and `hidden={!open}`. `ToggleButton` receives `pressed` from the filter arrays in `Catalogue`. `BookingForm` keeps an `errors` object, and each input's `aria-invalid` and `aria-describedby` (hint id plus error id) are computed from it. While slot availability loads, a `checking` flag drives `aria-busy` on the time-slot fieldset.

Announcements go through an `AnnouncerProvider` context that mounts one polite and one assertive region at startup and exposes `announce(message, politeness)`. Regions created together with their text are often not read, which is why they stay mounted. Focus changes use `useRef` and `focus()` in effects: `PageHeading` focuses the new `<h1>` after navigation, the form focuses the error summary whenever `submitCount` changes, and `BookRoom` focuses the confirmation heading.

### 3. Verification and testing audit

| Check | Tool | Result |
|---|---|---|
| Accessibility score, 4 views | Lighthouse 12 | **100 / 100** on Home, Catalogue, Resource detail and Book a room (`docs/audit/`) |
| WCAG 2.0/2.1 A + AA rules, 10 page states including errors, dialog and wireframes | axe-core in Chromium | **0 violations** |
| Component and accessibility tests | Vitest, Testing Library, vitest-axe | **33 / 33 passing** |
| Colour contrast | `scripts/contrast.mjs` | All pairs pass AA; lowest text pair 5.41:1 |
| Focus visibility and contrast at every Tab stop, 6 pages | `scripts/axe-audit.mjs` | No stop without a visible indicator or below 4.5:1 while focused |
| Reflow at 320px | Chromium | No horizontal scrolling on any page |

axe flags one item for review: text inside the open modal, because it cannot resolve the browser's top layer. Those colours (15.91:1) are covered by the contrast script. Testing found six issues, all fixed. One example: focused links whose component styles overrode the highlight dropped to 1.8:1, which axe misses because it only tests the resting state.

**Manual testing** (full log in `docs/manual-testing.md`):

| Test | Setup | Result |
|---|---|---|
| Keyboard tab sequence (13 checks) |Chrome 141, Windows 11|Runs well(13/13 passed)|
| Screen reader script (13 checks) |NVDA 2025.1, Chrome 141, Windows 11|Runs well (13/13 passed)|

<!-- Summary of manual findings -->
All keyboard and screen reader checks passed. NVDA announced filter changes and result counts after a short pause, read validation errors when leaving a field, and moved to the error summary on a failed submit. The booking confirmation was announced once, so the focused heading and the live region did not double up.
