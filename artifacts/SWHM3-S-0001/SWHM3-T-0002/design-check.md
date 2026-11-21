---
ticket: SWHM3-T-0002
mockups: [SWHM3-MCK-1, SWHM3-MCK-2, SWHM3-MCK-3, SWHM3-MCK-4, SWHM3-MCK-5, SWHM3-MCK-6, SWHM3-MCK-7, SWHM3-MCK-8]
---
# Design check

Tokens changed to match the mockups: primary #4f46e5 (dark #4338ca, light #eef2ff), text #0f172a, muted #64748b, divider #e2e8f0, page #f8fafc, paper #fff, success/warning/error/info per the Design Reference, radius 4, font Inter (loaded through `@fontsource-variable/inter`). Measured against `npm run build && npm run start`.

Differences left, common to every mockup (each reason is an accepted one):
- Rail groups and entries (Catalog, Search, Cart, Sign in, Profile, Language, Orders, Sales charts, Inventory), header search, language, cart and sign-in controls, the mobile quick tab bar, the hero buttons, and the landing cards for those areas: sample content of areas later capabilities build. The spec for this ticket names two areas (design.md P6, SD2), so the rail and landing cards hold Home, Localization and Order administration.
- Page titles and wording ("Catalog", "Cart", "Your cart is empty"): sample pages in the mockups; built pages show their own (`/localization`, `/admin/orders`).
- Breadcrumb "Home / Catalog" and "Reference req_…" on the error frame: a breadcrumb navigation must not precede the rail (design.md P6; the locked spec reads the first navigation landmark), and no request identifier exists yet.
- Error frame about 75px higher: consequence of the missing breadcrumb.
- Mobile footer position and page height: the mockup's bottom tab bar and extra cards are not built (first item).
- Card text box widths ("Approve or deny pending orders."): the mockup draws three card columns, the built page has fewer cards.

## SWHM3-MCK-1 · Landing page (/ default, 1440)
![mockup](design-check/SWHM3-MCK-1-mockup.png) ![built](design-check/SWHM3-MCK-1-built.png) ![diff](design-check/SWHM3-MCK-1-diff.png)
Measured: 6.1% of pixels differ, 51 differences (first run: many more; the rail, brand, footer, menu button, type and radius were fixed).
Differences left: the common list above; no font, colour, size, weight or radius difference remains.

## SWHM3-MCK-2 · Landing page · Mobile (/ default, 390)
![mockup](design-check/SWHM3-MCK-2-mockup.png) ![built](design-check/SWHM3-MCK-2-built.png) ![diff](design-check/SWHM3-MCK-2-diff.png)
Measured: 12.5% of pixels differ, 49 differences (first run: many more; the rail, brand, footer, menu button, type and radius were fixed).
Differences left: the common list above; no font, colour, size, weight or radius difference remains.

## SWHM3-MCK-3 · Site shell (/localization loading (API held open), 1440)
![mockup](design-check/SWHM3-MCK-3-mockup.png) ![built](design-check/SWHM3-MCK-3-built.png) ![diff](design-check/SWHM3-MCK-3-diff.png)
Measured: 6.2% of pixels differ, 24 differences (first run: many more; the rail, brand, footer, menu button, type and radius were fixed).
Differences left: the common list above; no font, colour, size, weight or radius difference remains.

## SWHM3-MCK-4 · Site shell · Mobile (/localization loading, 390)
![mockup](design-check/SWHM3-MCK-4-mockup.png) ![built](design-check/SWHM3-MCK-4-built.png) ![diff](design-check/SWHM3-MCK-4-diff.png)
Measured: 9.3% of pixels differ, 15 differences (first run: many more; the rail, brand, footer, menu button, type and radius were fixed).
Differences left: the common list above; no font, colour, size, weight or radius difference remains.

## SWHM3-MCK-5 · Empty state (/admin/orders, 1440)
![mockup](design-check/SWHM3-MCK-5-mockup.png) ![built](design-check/SWHM3-MCK-5-built.png) ![diff](design-check/SWHM3-MCK-5-diff.png)
Measured: 4.2% of pixels differ, 27 differences (first run: many more; the rail, brand, footer, menu button, type and radius were fixed).
Differences left: the common list above; no font, colour, size, weight or radius difference remains.

## SWHM3-MCK-6 · Empty state · Mobile (/admin/orders, 390)
![mockup](design-check/SWHM3-MCK-6-mockup.png) ![built](design-check/SWHM3-MCK-6-built.png) ![diff](design-check/SWHM3-MCK-6-diff.png)
Measured: 10.2% of pixels differ, 18 differences (first run: many more; the rail, brand, footer, menu button, type and radius were fixed).
Differences left: the common list above; no font, colour, size, weight or radius difference remains.

## SWHM3-MCK-7 · Error state (/localization with /api/locales answering 500, 1440)
![mockup](design-check/SWHM3-MCK-7-mockup.png) ![built](design-check/SWHM3-MCK-7-built.png) ![diff](design-check/SWHM3-MCK-7-diff.png)
Measured: 3.4% of pixels differ, 29 differences (first run: many more; the rail, brand, footer, menu button, type and radius were fixed).
Differences left: the common list above; no font, colour, size, weight or radius difference remains.

## SWHM3-MCK-8 · Error state · Mobile (/localization with /api/locales answering 500, 390)
![mockup](design-check/SWHM3-MCK-8-mockup.png) ![built](design-check/SWHM3-MCK-8-built.png) ![diff](design-check/SWHM3-MCK-8-diff.png)
Measured: 12.4% of pixels differ, 20 differences (first run: many more; the rail, brand, footer, menu button, type and radius were fixed).
Differences left: the common list above; no font, colour, size, weight or radius difference remains.
