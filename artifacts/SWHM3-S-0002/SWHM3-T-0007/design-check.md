# Design check — SWHM3-T-0007

The `design-measure.mjs` script of the `artifact-design-check` skill is not present in this workspace. Each mockup was measured with a Playwright probe against the production build (`next build`, standalone server) instead: both pages screenshotted (`design-check/<mockup>.mockup.png`, `<mockup>.built.png`) and the h1 and primary button's font, colour and size compared (`<mockup>.measure.json`). No diff image was produced.

## SWHM3-MCK-13 — mockup-locale-selection-form.html

- Route and state: /locale, en_US current; viewport 1440.
- Mockup: `design-check/mockup-locale-selection-form.mockup.png`; built: `design-check/mockup-locale-selection-form.built.png`.
- Measured (`design-check/SWHM3-MCK-13.measure.json`): h1 24px/600, 30px high; button 36px high: equal.
- Differences left: see the list below.

## SWHM3-MCK-14 — mockup-locale-selection-form-mobile.html

- Route and state: /locale, rail folded; viewport 390.
- Mockup: `design-check/mockup-locale-selection-form-mobile.mockup.png`; built: `design-check/mockup-locale-selection-form-mobile.built.png`.
- Measured (`design-check/SWHM3-MCK-14.measure.json`): h1 equal; button 324x44 full width: equal.
- Differences left: see the list below.

## SWHM3-MCK-15 — mockup-locale-change-success-screen.html

- Route and state: /locale/changed?from=/; viewport 1440.
- Mockup: `design-check/mockup-locale-change-success-screen.mockup.png`; built: `design-check/mockup-locale-change-success-screen.built.png`.
- Measured (`design-check/SWHM3-MCK-15.measure.json`): h1 24px/600, 30px high; button 36px high: equal.
- Differences left: see the list below.

## SWHM3-MCK-16 — mockup-locale-change-success-screen-mobile.html

- Route and state: /locale/changed?from=/; viewport 390.
- Mockup: `design-check/mockup-locale-change-success-screen-mobile.mockup.png`; built: `design-check/mockup-locale-change-success-screen-mobile.built.png`.
- Measured (`design-check/SWHM3-MCK-16.measure.json`): h1 two lines, 60px; button 358x44: equal.
- Differences left: see the list below.

## Differences left, with reasons

- Rail Catalog, Search, Cart and Profile entries, header search box, Cart button and Sign in: left out (design.md SD10; later capabilities).
- Header language control shows the chosen language's native name; the mockup shows the same for en_US.
- Footer "Language" link: not built (the rail and header already reach /locale).
- h1 width 1152 vs 1136 and button width 149 vs 147: the shell's 1200px container and font rendering; no layout difference.
- Mockup's "Changing…" disabled button state and the client-side "Choose a language" error: not built; the form is a plain POST and the current language is always checked. A server-side `?error=invalid` alert is shown instead.
- The mockup's selected row (Japanese) is demo state; the built page checks the current language, as PLAN.md states.
- Currency note: the mockup's English prose is per locale in message catalogs; the examples are computed with Intl.
