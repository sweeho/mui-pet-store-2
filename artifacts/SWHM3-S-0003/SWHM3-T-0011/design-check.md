---
ticket: SWHM3-T-0011
mockups: [SWHM3-MCK-17, SWHM3-MCK-18, SWHM3-MCK-19, SWHM3-MCK-20, SWHM3-MCK-21, SWHM3-MCK-22, SWHM3-MCK-23, SWHM3-MCK-24, SWHM3-MCK-25, SWHM3-MCK-26, SWHM3-MCK-27, SWHM3-MCK-28]
---
# Design check

Tokens: primary #4f46e5, text #0f172a, divider, surfaces and Inter already matched the mockups' `:root`, so no token changed. The mockups' monospace face (JetBrains Mono) was not loaded by the app: added `@fontsource-variable/jetbrains-mono` (imported in `src/app/layout.tsx`) for codes and prices. Shared pieces changed to match the mockups: the shell content padding (32px), the shared empty frame (56px round icon, 400px text, full-width action on a small screen).

Measured against a production build (`next build`, standalone server, seeded database) with `design-measure.mjs`; screenshots, diff and `.measure.json` per mockup are in `design-check/`.

Differences left on every mockup (shared shell, from other capabilities' sample content):
- Rail entries Cart, Sign in, Profile, Orders, Sales charts, Inventory and the note "Admin entries need the administrator role.", and the header Cart and Sign in buttons: later capabilities (cart, accounts, admin) own them; the rail has only entries that have a page.
- "Order administration" and "English (United States)" vs "Orders" and "English (US)": existing locked shell and localization copy that this ticket does not change.
- Mobile header (menu button, brand, "Pet Store", language icon): the existing shell header is built by the site-shell capability; vertical offsets of about 11px on mobile come from it.
- The Search rail entry is never marked current; Catalog is, as every mockup shows.

## SWHM3-MCK-17 · Category list (/catalog, first page, 1440)
![mockup](design-check/SWHM3-MCK-17-mockup.png) ![built](design-check/SWHM3-MCK-17-built.png)
![diff](design-check/SWHM3-MCK-17-diff.png)
Measured: 2.8% of pixels differ, 14 differences (shell items above included).
Differences left:
- "Categories"/"Products"/"Items"/"Results" and "· Fish" reported only in built: the mockup's range and code are one text node; mine split the label and the category into spans (same visible text; the label is hidden on a small screen as the mockup does).

## SWHM3-MCK-18 · Category list · Mobile (/catalog, first page, 390)
![mockup](design-check/SWHM3-MCK-18-mockup.png) ![built](design-check/SWHM3-MCK-18-built.png)
![diff](design-check/SWHM3-MCK-18-diff.png)
Measured: 7.6% of pixels differ, 23 differences (shell items above included).
Differences left:
- Row boxes and positions: the measure matches by text, and the built rows add the visually hidden range label; the thumb, gap and padding follow the mockup's mobile CSS.

## SWHM3-MCK-19 · Product list (/catalog/categories/FISH, 1440)
![mockup](design-check/SWHM3-MCK-19-mockup.png) ![built](design-check/SWHM3-MCK-19-built.png)
![diff](design-check/SWHM3-MCK-19-diff.png)
Measured: 2.8% of pixels differ, 15 differences (shell items above included).
Differences left:
- "Next" colour: the mockup shows Next enabled; the seeded Fish category has two products, so Next is correctly disabled. Sample data.
- "Categories"/"Products"/"Items"/"Results" and "· Fish" reported only in built: the mockup's range and code are one text node; mine split the label and the category into spans (same visible text; the label is hidden on a small screen as the mockup does).

## SWHM3-MCK-20 · Product list · Mobile (/catalog/categories/FISH, 390)
![mockup](design-check/SWHM3-MCK-20-mockup.png) ![built](design-check/SWHM3-MCK-20-built.png)
![diff](design-check/SWHM3-MCK-20-diff.png)
Measured: 7.6% of pixels differ, 28 differences (shell items above included).
Differences left:
- "Next" colour: the mockup shows Next enabled; the seeded Fish category has two products, so Next is correctly disabled. Sample data.
- Row boxes and positions: the measure matches by text, and the built rows add the visually hidden range label; the thumb, gap and padding follow the mockup's mobile CSS.

## SWHM3-MCK-21 · Item list (/catalog/products/FI-SW-01, 1440)
![mockup](design-check/SWHM3-MCK-21-mockup.png) ![built](design-check/SWHM3-MCK-21-built.png)
![diff](design-check/SWHM3-MCK-21-diff.png)
Measured: 2.9% of pixels differ, 14 differences (shell items above included).
Differences left:
- "Categories"/"Products"/"Items"/"Results" and "· Fish" reported only in built: the mockup's range and code are one text node; mine split the label and the category into spans (same visible text; the label is hidden on a small screen as the mockup does).

## SWHM3-MCK-22 · Item list · Mobile (/catalog/products/FI-SW-01, 390)
![mockup](design-check/SWHM3-MCK-22-mockup.png) ![built](design-check/SWHM3-MCK-22-built.png)
![diff](design-check/SWHM3-MCK-22-diff.png)
Measured: 7.8% of pixels differ, 27 differences (shell items above included).
Differences left:
- Row boxes and positions: the measure matches by text, and the built rows add the visually hidden range label; the thumb, gap and padding follow the mockup's mobile CSS.

## SWHM3-MCK-23 · Item detail (/catalog/items/EST-1, 1440)
![mockup](design-check/SWHM3-MCK-23-mockup.png) ![built](design-check/SWHM3-MCK-23-built.png)
![diff](design-check/SWHM3-MCK-23-diff.png)
Measured: 3.6% of pixels differ, 20 differences (shell items above included).
Differences left:
- "Add to cart" missing and the Details block sits higher: the button belongs to the shopping-cart capability (PLAN.md, Design reference).

## SWHM3-MCK-24 · Item detail · Mobile (/catalog/items/EST-1, 390)
![mockup](design-check/SWHM3-MCK-24-mockup.png) ![built](design-check/SWHM3-MCK-24-built.png)
![diff](design-check/SWHM3-MCK-24-diff.png)
Measured: 12.6% of pixels differ, 30 differences (shell items above included).
Differences left:
- "Add to cart" missing and the Details block sits higher: the button belongs to the shopping-cart capability (PLAN.md, Design reference).
- Page height 968px vs 923px: the missing Add to cart button and the mobile header offsets above.

## SWHM3-MCK-25 · Search results (/catalog/search?q=fish, 1440)
![mockup](design-check/SWHM3-MCK-25-mockup.png) ![built](design-check/SWHM3-MCK-25-built.png)
![diff](design-check/SWHM3-MCK-25-diff.png)
Measured: 2.9% of pixels differ, 15 differences (shell items above included).
Differences left:
- "Categories"/"Products"/"Items"/"Results" and "· Fish" reported only in built: the mockup's range and code are one text node; mine split the label and the category into spans (same visible text; the label is hidden on a small screen as the mockup does).
- Header search box shows the searched keywords as the mockup does; its text is matched as "fish"/"unicorn" in different boxes (input vs lead text).
- Mockup marks "Catalog" current; built matches it (Search is never current).

## SWHM3-MCK-26 · Search results · Mobile (/catalog/search?q=fish, 390)
![mockup](design-check/SWHM3-MCK-26-mockup.png) ![built](design-check/SWHM3-MCK-26-built.png)
![diff](design-check/SWHM3-MCK-26-diff.png)
Measured: 7.1% of pixels differ, 26 differences (shell items above included).
Differences left:
- Row boxes and positions: the measure matches by text, and the built rows add the visually hidden range label; the thumb, gap and padding follow the mockup's mobile CSS.
- Header search box shows the searched keywords as the mockup does; its text is matched as "fish"/"unicorn" in different boxes (input vs lead text).
- Mockup marks "Catalog" current; built matches it (Search is never current).

## SWHM3-MCK-27 · Search results — no matches (/catalog/search?q=unicorn, 1440)
![mockup](design-check/SWHM3-MCK-27-mockup.png) ![built](design-check/SWHM3-MCK-27-built.png)
![diff](design-check/SWHM3-MCK-27-diff.png)
Measured: 2.8% of pixels differ, 13 differences (shell items above included).
Differences left:
- Header search box shows the searched keywords as the mockup does; its text is matched as "fish"/"unicorn" in different boxes (input vs lead text).
- Mockup marks "Catalog" current; built matches it (Search is never current).

## SWHM3-MCK-28 · Search results — no matches · Mobile (/catalog/search?q=unicorn, 390)
![mockup](design-check/SWHM3-MCK-28-mockup.png) ![built](design-check/SWHM3-MCK-28-built.png)
![diff](design-check/SWHM3-MCK-28-diff.png)
Measured: 14.6% of pixels differ, 19 differences (shell items above included).
Differences left:
- Header search box shows the searched keywords as the mockup does; its text is matched as "fish"/"unicorn" in different boxes (input vs lead text).
- None beyond the shared differences listed at the top (the action is full width as in the mockup).
- Mockup marks "Catalog" current; built matches it (Search is never current).
