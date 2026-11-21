## Context

Legacy implementation notes for localization. Source is under `legacy-source/`.

## Legacy implementation notes

- **Locale parsing** exists three times with the same logic: `I18nUtil.getLocaleFromString` (waf), `CatalogHelper.getLocaleFromString` (catalog) and `LocaleUtil.getLocaleFromString` (opc). Null or underscore-less text gives null; "default" gives the JVM default. In opc the variant branch is dead (variantIndex never assigned) and a three-part string loses its country.
- **Front controller** (`MainServlet.doProcess`) sets the session locale from init-param `default_locale` (en_US) when absent. Unhandled errors are mapped through `ScreenFlowManager.getExceptionScreen`; the only mapping in `mappings.xml` names a petstore exception class, not the WAF one.
- **Locale change**: `ChangeLocaleHTMLAction` stores the Locale in the session under `com.sun.j2ee.blueprints.waf.LOCALE`; `ChangeLocaleEJBAction` copies it to the state-machine attribute `locale`. Suspected defect: the event mapping names a class that does not exist, so the EJB action is not invoked. The only caller found is the framework demo page `changelocale.jsp`, which posts to `changelocale.do`; it offers de_DE although `web.xml` `locales` lists only en_US.
- **Screen locale** (`TemplateServlet`): request parameter `locale`, else session; unknown locale replaced by the default; a screen missing in a locale file is taken from the default. Definitions load from `/WEB-INF/screendefinitions_<locale>.xml`. If the default also lacks the screen a NullPointerException is possible. `PREVIOUS` re-renders the stored last screen.
- **Client-state links** (`ClientStateFlowHandler`, wired to `changeclientchachelinklocale.do`) deserialise Base64 data with `ObjectInputStream`. Suspected defect: untrusted deserialisation; read errors are logged and ignored.
- **Catalog**: `catalog.locales` and `catalog.defaultLocale` in `conf/petstore.properties`. A null locale reaches `locale.toString()` in the DAO and throws an unhandled NullPointerException.
- **Schema**: `CATEGORY_DETAILS`, `PRODUCT_DETAILS`, `ITEM_DETAILS` with composite keys (id, locale); item attributes attr1..attr5 optional. Prices are per locale, so one item may be priced differently per locale. Requirement LOC-REQ-0002 (name and locale required; image and description optional for category and product details) differs from LOCALIZATION-ENT-0001 on item details; both are kept as recorded.
- **Encoding**: `EncodingFilter` calls `setCharacterEncoding` from init-param `encoding` (UTF-8 in the petstore `web.xml`), mapped to `/*`. The in-class default ASCII is overwritten in init(). Other web apps were not seen to declare the filter.
- **Mailer**: `MailerMDB` passes `Locale.getDefault()`; `MailHelper` ignores it. Localization, if any, happens upstream.
- **Formatting**: `I18nUtil.formatCurrency/formatNumber/parseKeywords`; callers were not verified. `parseKeywords` returns null on error.

## Codebase findings (sprint planning, SWHM3-S-0002)

- **No locale model exists.** `src/lib/locales.ts` is a constant list of three BCP-47 codes
  (`en-US`, `ja-JP`, `zh-CN`) served by `GET /api/locales` and drawn by the placeholder page
  `src/app/(DashboardLayout)/localization/` (`LocalesList` through `ResourceView`). Nothing records
  a chosen language, and `src/app/layout.tsx` hard-codes `<html lang="en">`.
- **No session, no proxy, no auth.** There is no `src/proxy.ts`, no cookie, no session store.
  `src/db/schema.ts` holds only the template's `users` table (`drizzle/0000_*.sql`), and
  `src/db/prepare.ts` migrates and seeds at first use.
- **No catalog tables yet.** `architecture/schema.sql` records the legacy `category`, `product`,
  `item` and their `*_details` tables keyed by (id, locale). Catalog browsing (SWHM3-I-0003) reads
  them later; this change creates them.
- **The shell** (`src/shell/SidebarItems.tsx`, `Header.tsx`) has one "Areas" list in `MENU_ITEMS`
  (Home, Localization, Order administration) and a header with only the menu button and brand.
  The landing page's cards are generated from `MENU_ITEMS`.
- **Locked acceptance tests** `tests/acceptance/localization/localization.test.ts` and
  `e2e/localization.spec.ts` state the module contract (`@/lib/localization`), the routes
  (`/locale`, `/api/locale`, `/api/session`, `/locale-link`) and the radio labels. The unit file
  also imports `createCart` from `@/lib/shopping-cart`, which does not exist yet: without it every
  case in the file fails on import.
- **The site-shell locked specs C-0166/C-0167** need at least one landing-page area whose page
  issues a browser `/api/` request. Today that is `/localization` alone.
- **Intl in Node 22 covers formatting and word-breaking.** Checked: `de-DE` gives `1.234,50`,
  `en-US` USD gives `$1,234.50`, and `Intl.Segmenter("ja-JP")` splits `私は猫が好き` into five words.
  No i18n or formatting dependency is needed.
- **CI** (`.github/workflows/ci.yml`) already triggers on `vortex/**` pushes and pull requests and
  runs unit, E2E and both acceptance suites.

## Implementation decisions for this sprint

- **P1. One locale module.** `src/lib/localization/` exports the contract the locked test states
  (`DEFAULT_LOCALE`, `resolveLocale`, `serverDefaultLocale`, `parseLocaleCode`,
  `resolveCatalogLocale`, `orderEmailLocale`, `formatNumber`, `formatCurrency`, `parseKeywords`,
  `createLocalizationRuntime`). One parser serves session, catalog and order strings (the three
  legacy copies collapse into one). Codes are stored and exchanged in the legacy underscore form
  (`ja_JP`). The BCP-47 tag (`ja-JP`) is derived only at the edge, for `Intl` and `<html lang>`.
- **P2. Parsing.** `language_COUNTRY[_variant]` keeps the variant (fixes the legacy opc loss).
  `"default"` in any case gives `serverDefaultLocale()`, which is the en_US model, not the host's
  OS locale, so it is the same on every machine. Null, empty or no underscore is invalid (`null`).
  A catalog read with no locale uses the default instead of failing (fixes the legacy DAO crash).
- **P3. Session.** A `sessions` table (id, `attributes` JSON, `controller_state` JSON, timestamps),
  not process memory (ARC-103). The locale is the session attribute `locale`, so
  customer-accounts' "sign-off keeps only the locale" builds on the same row. `src/proxy.ts` issues
  an httpOnly, SameSite=Lax `sid` cookie on the first visit. A session with no `locale` attribute
  reads as en_US, which is written on first use. `GET /api/session` answers
  `{ id, locale, attributes: [names] }`.
- **P4. The runtime is the screen model.** `createLocalizationRuntime(opts)` implements
  sessions, controller state, screen definitions per locale, exception mappings, `handle`,
  `changeLocale` and `parseForm` over a fresh store, exactly as the locked test describes. The web
  routes call the same functions (`changeLocale`, the screen-locale resolver), so the test and the
  app share one implementation. Its session reads are synchronous by contract, so the runtime keeps
  a write-through in-memory view over its store. The web app reads and writes the `sessions` table.
- **P5. Request locale.** One server function, `getRequestLocale()`, answers for a page: the
  `?locale=` parameter, else the session locale, else en_US. If no messages exist for that locale,
  en_US is used. `src/proxy.ts` forwards the parameter to server components as a request header,
  because the root layout gets no `searchParams`. The root layout sets `<html lang>` from it.
- **P6. Text per locale.** User-facing strings of the shell, the landing page and the two language
  screens come from message catalogs in `src/lib/localization/messages/` (en_US, ja_JP, zh_CN).
  de_DE has none and falls back to en_US. Other capabilities add their own keys.
- **P7. The language page replaces the placeholder.** `/locale` (in the shell) loads its choices
  from `GET /api/locales` through `ResourceView`. That keeps a data page for the site-shell
  C-0166/C-0167 specs. The current locale is read on the server and passed in as a prop.
  `/localization` and `LocalesList` are removed. `MENU_ITEMS` gains a `group` field: Shop (Home),
  Account (Language → `/locale`) and Admin (Order administration). The header gets a language
  control showing the current language and linking to `/locale?from=<current path>`.
- **P8. Change flow.** The form is a plain HTML POST (`application/x-www-form-urlencoded`) to
  `/api/locale` with `locale` and `from`, so it works without JavaScript. On success it updates the
  session and controller state, writes an audit record (ACC-003), and answers 303 to
  `/locale/changed?from=…`. On an unparseable code it answers 303 back to `/locale?error=invalid`
  and leaves the session unchanged. A JSON client gets RFC 9457 problem+json (API-103). `from` is
  accepted only as a same-origin path (no open redirect). Data-changing requests are refused when
  `Origin` is foreign. The new entry points are listed in a `PUBLIC_PATHS` list in `src/proxy.ts`
  (ACC-001). Deny-by-default arrives with sign-in (SWHM3-I-0004).
- **P9. Locale-change links.** `GET /locale-link` decodes each `<cacheId>_attribute_<key>` as
  Base64 of **JSON** and stores it as a session attribute. It never deserialises objects (this
  replaces the legacy untrusted Java deserialisation). A value that fails to decode is logged and
  skipped. It sets the locale and answers 303 to the route of `referring_screen` (a fixed
  screen→route map, for example `main` → `/`). Each page's root carries `data-screen="<name>"`.
- **P10. Catalog text.** Drizzle tables `category`, `product`, `item`, and `category_details`,
  `product_details`, `item_details`, each with a composite primary key (id, locale) that enforces
  one row per locale. `name` is NOT NULL on category and product details. Item details require
  image, description, list price and unit cost (R-0103), and attributes 1–5 are optional. The
  migration is generated and committed (DATA-102). No seed: catalog data is SWHM3-I-0003's job.
- **P11. Formatting.** `formatCurrency(amount, code, precision)` uses the locale's own currency
  (en_US USD, ja_JP JPY, zh_CN CNY, de_DE EUR) with exactly `precision` fraction digits. Prices are
  stored per locale (legacy model), so nothing is converted. `formatNumber` uses
  minimum = maximum = `fractionDigits`. `parseKeywords` uses `Intl.Segmenter` word granularity and
  keeps word-like segments only. On bad input it returns `[]` (legacy returned null).
- **P12. Cart locale.** `src/lib/shopping-cart.ts` is created with the shopping-cart contract's
  `createCart`, `add` and `list`, plus `cart.locale` (default `en_US`), which is passed as the
  lookup's second argument. SWHM3-I-0005 extends this module; nothing here contradicts that
  capability's locked contract.
- **P13. Encoding.** `parseForm(raw: Buffer)` decodes the body as UTF-8 before parsing it. Every
  route that reads a form body uses it or the Web `Request.formData()` (UTF-8 by the Fetch
  standard). No route reads bytes with another charset.

## Phases

1. **Locale model** (tasks 1.x): the module, the parser and the supported list. Re-point
   `src/lib/locales.ts` and `GET /api/locales` at it, with four entries (de_DE included, with a
   flag that it has no translation).
2. **Data** (4.1, 4.2, 2.1): the `sessions`, catalog and `audit_log` tables and their migration.
3. **Session and change flow** (2.1–2.5, 3.3, 5.1): `src/proxy.ts`, `/api/locale`, `/api/session`,
   `/locale-link` and the runtime.
4. **Screens** (3.1, 3.2): `/locale`, `/locale/changed`, the header control, the rail groups, the
   message catalogs and `<html lang>`.
5. **Formatting, cart, order locale** (4.3, 4.4, 5.2, 5.3, 5.4).
6. **Test harness**: no new tooling. Jest node tests beside each new route, and unit tests beside
   the module, the cart and the runtime. jsdom tests for the language form and the header control.
   `e2e/home.spec.ts` and `e2e/accessibility.spec.ts` move from `/localization` to `/locale` and
   add the success screen to the WCAG 2.2 AA check. The locked acceptance suites (localization and
   site-shell) are the oracle and are never edited.
7. **CI**: no workflow change. The existing workflow runs on `vortex/**` pushes and pull requests
   and runs every suite above. The change is done when they are green on the ticket's pull request.

## Spec discrepancies

Recorded, not silently corrected. The delta spec is unchanged.

- **SD1. Supported locales vs the form.** R-0204 lists en_US, ja_JP, zh_CN. R-0097 and the
  mockup also offer de_DE, and C-0003 formats for de_DE. Resolved: de_DE parses and can be chosen,
  numbers and currency use de_DE, and screens fall back to en_US text. The mockup's German row says
  so. The PRD open question on German stays open.
- **SD2. Radio names in the locked e2e vs the mockup.** The mockup's rows lead with the native
  name (`日本語 (日本)`) and show the English name second. The German row's note says "shown in US
  English". C-0006 finds radios by the substrings "US English", "German", "Japanese" and
  "Simplified Chinese", so the note inside a label would make "US English" match two radios. The
  radio's accessible name carries the native and English names only. The note and the code go in
  `aria-describedby`.
- **SD3. "Controller state" (R-0098).** The legacy EJB state machine is not rebuilt. The
  session's `controller_state` holds `locale`. Legacy design notes say the EJB action was never
  invoked (the mapping names a missing class). The rebuild follows the requirement, not the defect.
- **SD4. Client-state links (R-0100).** Legacy deserialised Java objects (untrusted input). The
  locked C-0011 uses Base64 of JSON, and the rebuild decodes JSON only (P9). Task 2.5 is decided:
  carried forward.
- **SD5. Screen definitions and exception mappings (R-0099, R-0101, R-0106).** Legacy screens are
  XML definitions per locale rendered by a servlet. The rebuild's pages are Next.js routes, so the
  model lives in the runtime (P4), and pages use the same locale resolver. Where legacy could crash
  (the default lacks the screen), the rebuild prints the not-found message.
- **SD6. Mailer (R-0107).** No mailer exists in this repository. It arrives with
  customer-notifications (SWHM3-I-0009, `@/lib/notifications`). This change adds no locale handling
  to any mail path, and the scenario has no approved test case. Its check belongs to SWHM3-I-0009's
  `buildCustomerEmail` pass-through.
- **SD7. Required fields differ.** R-0096 requires only name (and locale) for category and product
  details. R-0103 also requires image, description, list price and unit cost for item details.
  Both are built as stated (P10).
- **SD8. Cart and order locale belong to later capabilities.** R-0108 (cart) and R-0102 (order
  e-mail locale) are owned here but used by shopping-cart and notifications. This change provides
  `createCart`'s locale and `orderEmailLocale` only (P12).
- **SD9. Existing codes.** The bootstrap's `src/lib/locales.ts` uses hyphenated codes and three
  locales. Unified on underscore codes and four entries (P1, P7).
- **SD10. Shell items the brief names but the product lacks.** Header sign-in and the Admin group
  shown only to administrators need authentication (SWHM3-I-0004). As in the site-shell change's
  D5, sign-in is not drawn, and Order administration stays visible until roles exist. The mockup's
  Catalog, Search, Cart and Profile entries are added by their own capabilities.
