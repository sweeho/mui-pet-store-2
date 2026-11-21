## 1. Locale model

- [x] 1.1 Define the supported locales (en_US, ja_JP, zh_CN) and the en_US default (SWHM3-T-0007; SWHM3-R-0204)
- [x] 1.2 Implement locale-code parsing (language_COUNTRY[_variant], "default", invalid input) (SWHM3-T-0007; SWHM3-R-0105, SWHM3-R-0094)
- [x] 1.3 Decide the handling of the legacy defects in parsing (variant loss, null locale in catalog reads) (SWHM3-T-0007; SWHM3-R-0105, SWHM3-R-0094)

## 2. Locale selection and session

- [x] 2.1 Set the session locale to the default when none is set (SWHM3-T-0007; SWHM3-R-0148)
- [x] 2.2 Implement the locale-change request with failure on an unparseable code (SWHM3-T-0007; SWHM3-R-0104)
- [x] 2.3 Record the locale in the user's controller state and show the success screen (SWHM3-T-0007; SWHM3-R-0098)
- [x] 2.4 Resolve the screen locale (request parameter, then session, then default) with fallback (SWHM3-T-0007; SWHM3-R-0106)
- [x] 2.5 Decide whether client-state locale-change links are carried forward (SWHM3-T-0007; SWHM3-R-0100)

## 3. Screens and rendering

- [x] 3.1 Build the locale selection form (SWHM3-T-0007; SWHM3-R-0097)
- [x] 3.2 Render screens by name and report a missing screen definition (SWHM3-T-0007; SWHM3-R-0101)
- [x] 3.3 Route unhandled errors to the screen mapped to the closest exception type (SWHM3-T-0007; SWHM3-R-0099)

## 4. Catalog and cart data

- [x] 4.1 Store category, product and item text per locale with one row per (entity, locale) (SWHM3-T-0007; SWHM3-R-0103)
- [x] 4.2 Enforce required fields on category, product and item details (SWHM3-T-0007; SWHM3-R-0096, SWHM3-R-0103)
- [x] 4.3 Resolve the cart locale (default US English) for cart-line catalog lookups (SWHM3-T-0007; SWHM3-R-0108)
- [x] 4.4 Resolve order locale strings for customer e-mails (SWHM3-T-0007; SWHM3-R-0102)

## 5. Encoding and formatting

- [x] 5.1 Decode every request using the configured UTF-8 encoding before other handling (SWHM3-T-0007; SWHM3-R-0147)
- [x] 5.2 Format currency and numbers per locale with caller-specified fraction digits (SWHM3-T-0007; SWHM3-R-0205, SWHM3-R-0095)
- [x] 5.3 Split search keywords with locale word-break rules (SWHM3-T-0007; SWHM3-R-0205)
- [x] 5.4 Keep the mailer free of localization (SWHM3-T-0007; SWHM3-R-0107)
