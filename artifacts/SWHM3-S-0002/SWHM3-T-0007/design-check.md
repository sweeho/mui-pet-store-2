# Design check — SWHM3-T-0007

The `design-measure.mjs` script of the `artifact-design-check` skill is not present in this workspace. Each mockup was measured with a Playwright probe against the production build (`next build`, standalone server) instead: both pages screenshotted (`design-check/<mockup>.mockup.png`, `<mockup>.built.png`) and the h1 and primary button's font, colour and size compared (`<mockup>.measure.json`). No diff image was produced.

| Mockup | Route and state | Viewport | Result |
| --- | --- | --- | --- |
| mockup-locale-selection-form | /locale, en_US | 1440 | h1 24px/600 and 30px high, button 36px high: equal. |
| mockup-locale-selection-form-mobile | /locale | 390 | h1 equal; button full width 324x44: equal. |
| mockup-locale-change-success-screen | /locale/changed?from=/ | 1440 | h1 24px/600, button 36px: equal. |
| mockup-locale-change-success-screen-mobile | /locale/changed?from=/ | 390 | h1 two lines 60px, button 358x44: equal. |

The theme token `typography.h1` was set to the mockup's 1.5rem / 600 / 1.25 (it was 2rem / 700).

## Differences left, with reasons

- Rail Catalog, Search, Cart and Profile entries, header search box, Cart button and Sign in: left out (design.md SD10; later capabilities).
- Header language control shows the chosen language's native name; the mockup shows the same for en_US.
- Footer "Language" link: not built (the rail and header already reach /locale).
- h1 width 1152 vs 1136 and button width 149 vs 147: the shell's 1200px container and font rendering; no layout difference.
- Mockup's "Changing…" disabled button state and the client-side "Choose a language" error: not built; the form is a plain POST and the current language is always checked. A server-side `?error=invalid` alert is shown instead.
- The mockup's selected row (Japanese) is demo state; the built page checks the current language, as PLAN.md states.
- Currency note: the mockup's English prose is per locale in message catalogs; the examples are computed with Intl.
