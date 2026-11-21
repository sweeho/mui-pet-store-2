## ADDED Requirements

### Requirement: Supported locales and default
Recovered from: LOCAL-REQ-0001

The system SHALL support the locales en_US, ja_JP and zh_CN and SHALL use en_US as the default locale.

#### Scenario: Default locale
- **GIVEN** no locale has been chosen
- **WHEN** a locale is needed
- **THEN** en_US is used

### Requirement: Locale formatting of currency and numbers
Recovered from: LOCALIZATION-REQ-0005

The system SHALL format currency and numbers according to the shopper's locale with a caller-specified number of decimal places, and SHALL split search keywords into words using the locale's word-break rules.

#### Scenario: Currency with precision
- **GIVEN** an amount and a locale
- **WHEN** the amount is formatted with a precision of 2
- **THEN** it is shown in the locale's currency style with exactly 2 fraction digits

#### Scenario: Keyword splitting
- **GIVEN** a search text and a locale
- **WHEN** keywords are parsed
- **THEN** the text is split into words by the locale's word-break rules

### Requirement: Catalog locale resolution
Recovered from: CATBR-REQ-0010

The system SHALL resolve a locale given as text such as language_COUNTRY (or "default" for the server default) into a locale for catalog reads, and SHALL treat a text without an underscore as no locale.

#### Scenario: Valid locale text
- **GIVEN** the text "ja_JP"
- **WHEN** it is resolved for a catalog read
- **THEN** the Japanese (Japan) locale is used

#### Scenario: Text without underscore
- **GIVEN** the text "en"
- **WHEN** it is resolved
- **THEN** no locale results

### Requirement: Locale formatting with fraction digits
Recovered from: LOC-BR-0004

The system SHALL format currency and numbers according to the user's locale with a caller-specified number of fraction digits.

#### Scenario: Number formatting
- **GIVEN** the number 1234.5, locale de_DE and 2 fraction digits
- **WHEN** it is formatted
- **THEN** it is shown in that locale's number style with 2 fraction digits

### Requirement: Detail record required fields
Recovered from: LOC-REQ-0002

The system SHALL require a name and locale for each category and product detail record, while image and description are optional.

#### Scenario: Missing name
- **GIVEN** a category detail without a name
- **WHEN** it is saved
- **THEN** it is rejected

#### Scenario: Optional fields omitted
- **GIVEN** a product detail with name and locale only
- **WHEN** it is saved
- **THEN** it is accepted

### Requirement: Locale selection form
Recovered from: LOC-REQ-0005

The locale selection screen SHALL offer the choices US English (en_US), German (de_DE), Japanese (ja_JP) and Simplified Chinese (zh_CN), and its submit control MUST send the selected code as "locale".

#### Scenario: Form displayed
- **GIVEN** a visitor opens the locale selection screen
- **WHEN** the screen is displayed
- **THEN** four language choices are listed and a control to submit the selection is present

#### Scenario: Choice submitted
- **GIVEN** the visitor has selected Japanese
- **WHEN** the form is submitted
- **THEN** the code ja_JP is sent as "locale" to the locale-change function

### Requirement: Locale recorded after change
Recovered from: LOC-REQ-0006

The system SHALL, after a locale change, record the locale as the "locale" attribute of the user's server-side controller state and SHALL display the locale-change success screen.

#### Scenario: Successful change
- **GIVEN** a valid locale change request
- **WHEN** it is processed
- **THEN** the controller state holds the locale and the success screen is shown

### Requirement: Error screen routing
Recovered from: LOC-REQ-0008

The system SHALL route an unhandled error to the screen mapped to the closest matching exception type, and SHALL fail with a server error when no mapping matches.

#### Scenario: Mapped error
- **GIVEN** an exception type with a mapped screen
- **WHEN** it is unhandled
- **THEN** the mapped screen is shown

#### Scenario: Unmapped error
- **GIVEN** an exception with no matching mapping
- **WHEN** it is unhandled
- **THEN** a server error is returned

### Requirement: Client-state locale-change links
Recovered from: LOC-REQ-0009

WHERE client-state links are used, the system SHALL restore request attributes from Base64-encoded serialized parameters named <cacheId>_attribute_<key> and forward to the screen named by "referring_screen".

#### Scenario: Link restores page state
- **GIVEN** a locale-change link carrying encoded state and a referring screen
- **WHEN** the link is followed
- **THEN** the attributes are restored and the referring screen is shown in the new locale

### Requirement: Screen rendering by name
Recovered from: LOC-REQ-0011

The system SHALL render a screen by looking up its definition by the URL name and inserting its template, and SHALL print a "Definition for screen ... not found" message when no definition exists in any locale.

#### Scenario: Known screen
- **GIVEN** a defined screen name
- **WHEN** it is requested
- **THEN** its template is rendered

#### Scenario: Unknown screen
- **GIVEN** a screen name with no definition in any locale
- **WHEN** it is requested
- **THEN** a "Definition for screen ... not found" message is printed

### Requirement: Order locale string interpretation
Recovered from: LOCALIZATION-BR-0001

The system SHALL interpret a stored order locale string "language_country" as that locale, "default" as the server default locale, and a null or underscore-less value as no locale.

#### Scenario: Stored order locale
- **GIVEN** an order with locale "zh_CN"
- **WHEN** a customer e-mail locale is determined
- **THEN** the Chinese (China) locale is used

### Requirement: Per-locale catalog text
Recovered from: LOCALIZATION-ENT-0001

The system SHALL hold the name, image and description of categories, products and items per locale, with at most one row per (entity, locale), and SHALL require a name for category and product details and an image, description, list price and unit cost for item details.

#### Scenario: Duplicate locale row
- **GIVEN** a product with an en_US detail row
- **WHEN** a second en_US row is added for it
- **THEN** it is rejected

### Requirement: Change session locale
Recovered from: LOCALIZATION-REQ-0001

The system SHALL change the shopper's session locale to the requested locale when a locale-change request names a valid locale code, and SHALL report a failure when the code cannot be parsed.

#### Scenario: Valid code
- **GIVEN** a locale-change request with code ja_JP
- **WHEN** it is processed
- **THEN** the session locale is ja_JP

#### Scenario: Invalid code
- **GIVEN** a locale-change request with code "xx"
- **WHEN** it is processed
- **THEN** a failure is reported and the session locale is unchanged

### Requirement: Locale code parsing
Recovered from: LOCALIZATION-RULE-0002

The system SHALL interpret a locale code as language_COUNTRY[_variant], SHALL treat the text "default" (any case) as the server default locale, and SHALL treat null or a code with no underscore as invalid.

#### Scenario: Default keyword
- **GIVEN** the code "DEFAULT"
- **WHEN** it is parsed
- **THEN** the server default locale results

#### Scenario: Invalid code
- **GIVEN** a null code or the code "en"
- **WHEN** it is parsed
- **THEN** it is invalid

### Requirement: Screen locale selection and fallback
Recovered from: LOCALIZATION-RULE-0004

The system SHALL choose the screen-definition locale for a page request as the "locale" request parameter if present, otherwise the session locale, and SHALL fall back to the default locale when no screens are defined for the chosen locale.

#### Scenario: Parameter wins
- **GIVEN** a session locale en_US and a request parameter locale=ja_JP with Japanese screens defined
- **WHEN** a page is requested
- **THEN** Japanese screens are used

#### Scenario: Unsupported locale
- **GIVEN** a request for a locale with no screen definitions
- **WHEN** a page is requested
- **THEN** the default locale's screens are used

### Requirement: Mailer does not localize
Recovered from: NOTIF-BR-0006

GIVEN a mail request WHEN it is sent THEN the system SHALL NOT localize it in the mailer; the locale passed is the server default and has no effect on the content.

#### Scenario: Mail sent
- **GIVEN** a mail request with subject and content
- **WHEN** it is sent
- **THEN** subject and content are sent as supplied

### Requirement: Cart locale
Recovered from: SHOP-REQ-0006

The system SHALL allow the cart's locale to be set, defaulting to US English, and use it for catalog lookups of cart lines.

#### Scenario: Default cart locale
- **GIVEN** a new cart with no locale set
- **WHEN** a cart line is looked up in the catalog
- **THEN** US English is used

### Requirement: Request character encoding
Recovered from: LOC-REQ-0001

The system SHALL decode the body and parameters of every incoming web request using the character encoding configured for the application, before any other request handling reads them. The storefront SHALL be configured with UTF-8.

#### Scenario: Japanese input
- **GIVEN** a form post containing Japanese text
- **WHEN** it is received
- **THEN** the text is decoded as UTF-8 without garbling

### Requirement: Default session locale
Recovered from: LOCALIZATION-RULE-0003

GIVEN a request reaches the front controller and the session has no locale, WHEN the request is processed, THEN the system SHALL set the session locale to the configured default locale (en_US).

#### Scenario: First visit
- **GIVEN** a visitor with no session locale
- **WHEN** any request is processed
- **THEN** the session locale is en_US
