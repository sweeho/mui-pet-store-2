## Legacy implementation notes

- Catalog reads go through `GenericCatalogDAO` (with a Cloudscape variant); SQL for the configured database (cloudscape or oracle) is loaded from `CatalogDAOSQL.xml`. Every statement filters on the locale of the `*_details` tables.
- `GET_CATEGORIES` and `GET_PRODUCTS` end with `order by name`; `GET_ITEMS` and `SEARCH_ITEMS` have no order clause, so item order is database-dependent.
- Paging is implemented in the DAO with a start offset and count; `Page` carries next/previous flags. Page size defaults to 2 via `conf/petstore.properties`.
- Search splits the query on whitespace into a distinct keyword set and matches product name, category id or item description; an empty set returns an empty page without querying.
- Schema (`petstore_oracle.sql`): category, product, item with 10-character ids; detail tables keyed by (id, locale); no CHECK relating list price to unit cost.
- Requests ending in `.do` are handled by `MainServlet`/`RequestProcessor` using `mappings.xml` and `ScreenFlowManager`; fragment caching is done by `CacheTag`. These are framework mechanics, kept here and not as behaviour.
- `ps_catalog_check.sh` / `catalog_check.sql` verify catalog tables at batch time and request first-load population when missing.

## User interface

No record of kind `screen` appears among the 21 records ingested for this capability, so its user interface is unspecified here. The screen count was not stated in the stage input; no UI is described because none was extracted.

## Planning context (SWHM3-T-0010, sprint SWHM3-S-0003)

### Codebase findings

Measured on `vortex/sprint/swhm3-s-0003-cf97ddf6` after the localization sprint landed. The brief's
"Current State" section predates that sprint and is stale.

- F1. The catalog tables already exist: `category`, `product`, `item` and `category_details`,
  `product_details`, `item_details` in `src/db/schema.ts`, created by `drizzle/0001_lyrical_gertrude_yorkes.sql`.
  Detail tables have composite keys (id, locale). `item_details` has `image`, `description`,
  `list_price`, `unit_cost` NOT NULL (`real`), `attr1`–`attr5` nullable, and **no name**. No index on
  `(locale, name)` or on the foreign keys. Nothing seeds catalog rows (`src/db/prepare.ts` seeds users only).
- F2. `src/lib/localization/runtime.ts` already writes category and product details for the
  localization tests over a fresh in-memory libsql database migrated from `drizzle/`. That is the
  pattern for a "fresh store".
- F3. `getLocaleContext()` (`src/lib/localization/request.ts`) gives `chosen` (the shopper's pick) and
  `locale` (the pick, or en_US when it has no messages). `parseKeywords(text, locale)` and
  `formatCurrency(amount, locale, precision)` live in `src/lib/localization/locale.ts`.
- F4. The shell (`src/shell/`) has grouped rail entries in `MENU_ITEMS` (shop / account / admin) and a
  header with the language control only. **There is no header search box.** The landing page's
  links are generated from `MENU_ITEMS`, which the locked site-shell spec checks (C-0163..C-0165).
- F5. `src/proxy.ts` holds `PUBLIC_PATHS`; shared frames are in `src/components/StateFrames/`; the
  route group already has `error.tsx` and `loading.tsx`.
- F6. The locked suite `tests/acceptance/catalog-browsing/catalog-browsing.test.ts` fixes the module
  contract: `@/lib/catalog-browsing` exports `createCatalog`, `createFrontController`,
  `resolveScreen`, `createFragmentCache`, `runCatalogCheck` (signatures in that file's header). Item
  `name` is the product's name (C-0234 expects "Angelfish").
- F7. CI (`.github/workflows/ci.yml`) already runs on pull requests to `vortex/**`.

### Decisions

- P1. **One catalog module, `src/lib/catalog-browsing.ts`**, exports the locked contract. `createCatalog({ db?, pageSize? })`
  is synchronous; with no `db` it lazily opens a fresh in-memory libsql database migrated from
  `drizzle/` (as F2); pages pass `await getDb()`. All reads are Drizzle queries in code. This is the
  "configured data-access class" of R-0164 and R-0054.
- P2. **Validation at write** in `addCategory/addProduct/addItem`: code 1–10 characters; duplicate code
  refused (primary key); category and product details need a name; item details need list price,
  unit cost, image and description, with prices of at most two decimals and attributes of at most 80
  characters. No list-price-versus-cost check (R-0162).
- P3. **Item name = its product's name** in the item's locale (F1, F6). The item detail page's title
  is `attr1` + product name when `attr1` is set ("Large Angelfish"), as the mockup shows.
- P4. **Paging**: `{ start = 0, size = pageSize (default 2) }`, size capped at 50 (API-104; brief Q2).
  A negative `start` or one past the end gives an empty page. Fetch `size + 1` rows: `hasNext` is
  "got more than size", `hasPrevious` is `start > 0`. Pages use `?start=`.
- P5. **Ordering**: categories and products by name, then id; items and search results by item id (the
  legacy order was database-dependent, so id gives a stable one).
- P6. **Locale**: a listing joins the detail row of the requested locale, so an entity without text in
  that locale is absent (R-0050). Pages pass `LocaleContext.locale` (en_US for a pick without
  messages, such as de_DE), and format prices with the same locale, precision 2.
- P7. **Search**: blank or whitespace-only query returns an empty page without querying (R-0053).
  Otherwise keywords come from `parseKeywords(query, locale)`, lowercased and de-duplicated; an item
  matches when any keyword is contained in `lower(product name)`, `lower(category id)` or
  `lower(item description)`, with `%`, `_` and `\` escaped. Translated category names are not
  matched (legacy behaviour; brief Q3 left open).
- P8. **Unknown id** returns `null`; the page renders the shared empty frame with a link to `/catalog`
  and HTTP 200, never `notFound()` or an error (R-0047, brief table).
- P9. **Data-access failure** is logged with the operation and ids and rethrown as `CatalogSystemError`
  (R-0054, OBS-003). Pages let it reach the route group's `error.tsx` (error frame with **Try again**).
- P10. **Legacy mechanisms as small pure functions** (R-0042, R-0043, R-0044, R-0049): `resolveScreen`,
  `createFrontController`, `createFragmentCache` and `runCatalogCheck` meet the locked contract. Pages
  do not route through them; App Router file routing is the single way in. `runCatalogCheck` returns
  exit code 0 when the tables exist (after at most one population request and one re-check) and 8
  when population fails or the re-check still finds them missing. Wiring it to a batch job belongs
  to batch operations (SWHM3-I-0011).
- P11. **Data**: one new migration adds indexes on `category_details(locale, name)`,
  `product_details(locale, name)`, `product(category_id)`, `item(product_id)` (DATA-106). Column types
  stay as F1. `prepareDatabase()` seeds a sample catalog (five categories, their products and items)
  in en_US, ja_JP and zh_CN when `category` is empty, including one item priced below cost.
- P12. **Screens** under `src/app/(DashboardLayout)/catalog/`: `/catalog`, `/catalog/categories/[categoryId]`,
  `/catalog/products/[productId]`, `/catalog/items/[itemId]`, `/catalog/search?q=&start=`. Server
  components; breadcrumbs (MUI `Breadcrumbs` in a `nav` labelled "Breadcrumb", after the rail in DOM
  order) start at **Catalog** on every page below the category list. The pager shows a range
  ("Categories 1–2") with **Previous** only when `hasPrevious` and **Next** only when `hasNext`. Blank
  search, no matches and paging past the end render the shared empty frame with the brief's wording.
  Item detail shows list price only, never unit cost (brief Q1; the mockup shows no cost).
- P13. **Shell**: `MENU_ITEMS` gains **Catalog** (`/catalog`) and **Search** (`/catalog/search`) in the
  shop group (brief Q4, Q5: the shell's "Shop"). The header gains the search box from the mockups
  (labelled "Search the catalog"), a GET form to `/catalog/search` with `q`, using `next/form` so the
  base path is added. `/catalog` paths join `PUBLIC_PATHS`. Every string comes from the three message
  catalogs.

### Phases

1. Data model (tasks 1.x): validation, migration with indexes, seed.
2. Browsing queries (2.x) and paging (3.x) in `src/lib/catalog-browsing.ts`.
3. Search (4.x).
4. Operations (5.x): `runCatalogCheck`, `CatalogSystemError`, plus the P10 functions.
5. Screens and shell (P12, P13).
6. **Test harness**: Jest unit tests beside the module, one or more per case key
   (`[SWHM3-C-0218]`…`[SWHM3-C-0236]`); component tests for the pager, breadcrumbs and item detail
   view; a Playwright spec in `e2e/` that browses category → product → item → detail and runs a
   matching, a no-match and a blank search; the structural accessibility spec covers the catalog
   pages. The locked acceptance suite `tests/acceptance/catalog-browsing/` turns green unchanged, and
   the locked site-shell and localization suites stay green.
7. **CI**: the existing workflow already runs lint, format, typecheck, unit, E2E and the Docker build
   on pull requests to `vortex/**` (F7); no workflow change is needed. The new migration must be
   committed so CI's fresh database matches.

### Spec discrepancies

Recorded, not edited into the delta spec:

- SD1. R-0164 and R-0054 describe SQL loaded from an external XML file per database type and a
  datasource. The rebuild uses Drizzle queries in code (project convention, ARCHITECTURE.md). The
  scenarios' outcomes (reads go through one configured module; a failure reaches the caller as a
  system error) are met by P1 and P9. Neither requirement has a test case.
- SD2. R-0043, R-0044 and R-0049 are framework mechanics of the legacy store (`.do` controller, flow
  handler, `CacheTag`). The locked tests C-0222, C-0223, C-0228 require them as functions, so they
  are built (P10) but no page uses them. `tasks.md` has no line for them; the FEATURE owns them.
- SD3. R-0042 (catalog check) is out of scope in the brief (batch operations), but C-0221 is approved
  under this change. The pure function is built here; the scheduled job is not.
- SD4. R-0163 exposes unit cost. The data layer returns it (C-0234); the shopper screen does not show
  it (brief Q1, mockup).
- SD5. R-0163 lists an item "name", but legacy item details have no name. The name is the product's (P3).
- SD6. R-0050 drops an entity with no text in the locale, while localization falls back to en_US for a
  locale with no text at all. Both hold: rows are filtered per locale, and a locale without messages
  (de_DE) is read as en_US (P6).
- SD7. R-0001 asks for prices "to two decimal places"; the existing columns are `real`. Two decimals
  are enforced at write (P2) rather than by a column type change.
- SD8. R-0165 and R-0166 restate the default page size of R-0008; one implementation covers all three.
- SD9. The brief assumes the shell provides the header search box; it does not (F4). This FEATURE adds it.
