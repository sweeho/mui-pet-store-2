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
