## ADDED Requirements

### Requirement: Direct catalog data access
ID: SWHM3-R-0164
Recovered from: CATALOG-REQ-0001
The system SHALL read catalog data directly from the catalog database from the web tier, using a configured catalog data-access class and SQL definitions file.

#### Scenario: Direct catalog data access
- **GIVEN** the web tier is configured with a catalog data-access class and a SQL definitions file
- **WHEN** a catalog read is requested
- **THEN** the data is read from the catalog database through that class and file

### Requirement: Catalog lists per page (CATB)
ID: SWHM3-R-0165
Recovered from: CATB-REQ-0001
The system SHALL list catalog results two items per page.

#### Scenario: Catalog lists per page (CATB)
- **GIVEN** a product with five items
- **WHEN** its items are listed with the default page size
- **THEN** the first page holds two items

### Requirement: Catalog page size configuration
ID: SWHM3-R-0166
Recovered from: CATBRW-REQ-0001
The system SHALL page catalog listings two items per page.

#### Scenario: Catalog page size configuration
- **GIVEN** the configured catalog page size is 2
- **WHEN** a listing of five entries is requested
- **THEN** pages of two, two and one entries are produced

### Requirement: Item detail record content
ID: SWHM3-R-0001
Recovered from: CAT-REQ-0003
The system SHALL require each item detail record to have a locale, list price, unit cost, image and description, and permit up to five optional attributes of 80 characters each, with prices held to two decimal places.

#### Scenario: Item detail record content
- **GIVEN** an item detail record lacking a list price
- **WHEN** it is stored
- **THEN** the record is rejected as incomplete

### Requirement: No price-versus-cost constraint
ID: SWHM3-R-0162
Recovered from: CATALOG-BR-0001
The system SHALL NOT enforce at database level that an item's list price is at or above its unit cost, and sample data MAY contain an item priced below cost.

#### Scenario: No price-versus-cost constraint
- **GIVEN** an item whose list price is below its unit cost
- **WHEN** it is stored
- **THEN** the store accepts it without error

### Requirement: Item attributes exposed
ID: SWHM3-R-0163
Recovered from: catalog-browsing-REQ-0006
The system SHALL expose for each item its id, product, category, name, image, description, five attributes, a list price and a unit cost.

#### Scenario: Item attributes exposed
- **GIVEN** an existing item
- **WHEN** its detail is requested
- **THEN** id, product, category, name, image, description, five attributes, list price and unit cost are returned

### Requirement: Catalog check repopulation
ID: SWHM3-R-0042
Recovered from: BATCH-RULE-0010
The system SHALL, GIVEN the catalog check finds the catalog tables missing, request the storefront's first-load population (not a forced reload), re-run the checks once, and end with code 8 if the population request fails.

#### Scenario: Catalog check repopulation
- **GIVEN** the catalog check finds the catalog tables missing
- **WHEN** the check runs
- **THEN** first-load population is requested and the checks re-run once

### Requirement: Flow handler screen resolution
ID: SWHM3-R-0043
Recovered from: CAT-BR-0007
The system SHALL, GIVEN a request whose mapping has a flow handler and a result code returned, show the screen configured for that result, or treat the result itself as the screen name when none is configured, and SHALL fail with a "Screen not found" error when no screen can be determined.

#### Scenario: Flow handler screen resolution
- **GIVEN** a flow handler returns a result code with no configured screen
- **WHEN** the request completes
- **THEN** the result code is used as the screen name, and if none can be determined a Screen not found error is raised

### Requirement: Catalog entity hierarchy
ID: SWHM3-R-0007
Recovered from: CAT-ENT-0001
The system SHALL store catalog data as categories, products within a category, and items within a product, each identified by a unique code of up to 10 characters, with localized details keyed by (code, locale).

#### Scenario: Catalog entity hierarchy
- **GIVEN** a category, a product and an item
- **WHEN** they are stored
- **THEN** each has a unique code of at most 10 characters and localized details keyed by code and locale

### Requirement: Single front controller
ID: SWHM3-R-0044
Recovered from: CAT-WF-0006
The system SHALL serve every request ending in .do through a single front controller that resolves the last URL path segment to a configured mapping, runs the mapped action if declared, dispatches any resulting event to the controller component, and forwards to the screen named by the mapping or its flow handler.

#### Scenario: Single front controller
- **GIVEN** a request ending in .do
- **WHEN** it is received
- **THEN** the last path segment is resolved to a mapping, its action run, and the response forwarded to the mapped screen

### Requirement: Catalog identifier and ownership
ID: SWHM3-R-0045
Recovered from: CATALOG-ENT-0001
The system SHALL store the catalog as category, product and item, each keyed by a short identifier (max 10 characters), where every product belongs to exactly one category and every item to exactly one product.

#### Scenario: Catalog identifier and ownership
- **GIVEN** an item
- **WHEN** it is stored
- **THEN** it belongs to exactly one product, which belongs to exactly one category

### Requirement: Category ordering and caller page size
ID: SWHM3-R-0046
Recovered from: CATBR-BR-0002
The system SHALL return category lists ordered by category name and SHALL return results in pages of a caller-supplied size, with the first page starting at offset 0.

#### Scenario: Category ordering and caller page size
- **GIVEN** categories named Birds, Cats and Dogs
- **WHEN** page size 2 is requested at offset 0
- **THEN** Birds and Cats are returned

### Requirement: Unknown identifier yields no result
ID: SWHM3-R-0047
Recovered from: CATBR-BR-0009
The system SHALL, GIVEN a category, product or item identifier that does not exist in the requested locale, return no result rather than an error when a single record is requested.

#### Scenario: Unknown identifier yields no result
- **GIVEN** an item id absent in the requested locale
- **WHEN** the item is requested
- **THEN** no result is returned and no error is raised

### Requirement: Language-specific detail records
ID: SWHM3-R-0048
Recovered from: CATBR-REQ-0011
The system SHALL keep catalog data in separate language-specific detail records for categories, products and items, keyed by identifier and locale.

#### Scenario: Language-specific detail records
- **GIVEN** a product with English and Japanese details
- **WHEN** the Japanese locale is requested
- **THEN** only the Japanese detail record is used

### Requirement: Fragment caching
ID: SWHM3-R-0049
Recovered from: LOC-BR-0010
The system SHALL cache rendered page fragments for a configured duration, keyed by request URL, fragment name and query string, in the chosen scope (page, request, session or application), and SHALL re-render the fragment once its age exceeds the duration.

#### Scenario: Fragment caching
- **GIVEN** a fragment cached for 60 seconds
- **WHEN** it is requested after 61 seconds
- **THEN** the fragment is re-rendered

### Requirement: Locale-specific browsing
ID: SWHM3-R-0050
Recovered from: catalog-browsing-REQ-0001
The system SHALL list categories, the products of a category, the items of a product, and the detail of a single item, each in the shopper's locale.

#### Scenario: Locale-specific browsing
- **GIVEN** a shopper locale
- **WHEN** categories, products or items are listed
- **THEN** only rows with a description in that locale are returned

### Requirement: Name ordering and missing entities
ID: SWHM3-R-0051
Recovered from: catalog-browsing-REQ-0002
The system SHALL present categories and products in ascending name order, and SHALL return no entity (null) when the requested category, product or item id does not exist for the locale.

#### Scenario: Name ordering and missing entities
- **GIVEN** products named Zebra and Ant
- **WHEN** a category's products are listed
- **THEN** Ant precedes Zebra

### Requirement: Offset paging with next and previous
ID: SWHM3-R-0008
Recovered from: catalog-browsing-REQ-0003
The system SHALL page catalog lists by a start offset and a page size (default 2 rows), SHALL report whether a next page exists, SHALL report a previous page when the start offset is above zero, and GIVEN a negative start or a start beyond the result set THEN the system SHALL return an empty page.

#### Scenario: Offset paging with next and previous
- **GIVEN** five items and page size 2
- **WHEN** start offset 2 is requested
- **THEN** two items are returned with next and previous pages reported; start 9 returns an empty page

### Requirement: Keyword item search
ID: SWHM3-R-0052
Recovered from: catalog-browsing-REQ-0004
The system SHALL search items by one or more whitespace-separated keywords, matching an item when ANY keyword is contained in the product name, the category id, or the item description, case-insensitively, in the shopper's locale, with the same paging as other lists.

#### Scenario: Keyword item search
- **GIVEN** items whose product name contains "fish"
- **WHEN** the query "FISH bird" is searched
- **THEN** items matching either keyword are returned in pages

### Requirement: Empty search query
ID: SWHM3-R-0053
Recovered from: catalog-browsing-REQ-0005
The system SHALL, GIVEN a search query that is empty or only whitespace, return an empty result page.

#### Scenario: Empty search query
- **GIVEN** a query of only spaces
- **WHEN** a search is run
- **THEN** an empty result page is returned

### Requirement: External SQL statements and error reporting
ID: SWHM3-R-0054
Recovered from: catalog-browsing-REQ-0007
The system SHALL load the catalog SQL for the configured database type from an external XML statement file and SHALL read the catalog via a datasource, reporting any data-access failure as a system error to the caller.

#### Scenario: External SQL statements and error reporting
- **GIVEN** a data-access failure
- **WHEN** a catalog read is attempted
- **THEN** a system error is reported to the caller

