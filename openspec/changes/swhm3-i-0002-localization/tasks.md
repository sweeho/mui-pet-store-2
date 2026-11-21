## 1. Locale model

- [ ] 1.1 Define the supported locales (en_US, ja_JP, zh_CN) and the en_US default
- [ ] 1.2 Implement locale-code parsing (language_COUNTRY[_variant], "default", invalid input)
- [ ] 1.3 Decide the handling of the legacy defects in parsing (variant loss, null locale in catalog reads)

## 2. Locale selection and session

- [ ] 2.1 Set the session locale to the default when none is set
- [ ] 2.2 Implement the locale-change request with failure on an unparseable code
- [ ] 2.3 Record the locale in the user's controller state and show the success screen
- [ ] 2.4 Resolve the screen locale (request parameter, then session, then default) with fallback
- [ ] 2.5 Decide whether client-state locale-change links are carried forward

## 3. Screens and rendering

- [ ] 3.1 Build the locale selection form
- [ ] 3.2 Render screens by name and report a missing screen definition
- [ ] 3.3 Route unhandled errors to the screen mapped to the closest exception type

## 4. Catalog and cart data

- [ ] 4.1 Store category, product and item text per locale with one row per (entity, locale)
- [ ] 4.2 Enforce required fields on category, product and item details
- [ ] 4.3 Resolve the cart locale (default US English) for cart-line catalog lookups
- [ ] 4.4 Resolve order locale strings for customer e-mails

## 5. Encoding and formatting

- [ ] 5.1 Decode every request using the configured UTF-8 encoding before other handling
- [ ] 5.2 Format currency and numbers per locale with caller-specified fraction digits
- [ ] 5.3 Split search keywords with locale word-break rules
- [ ] 5.4 Keep the mailer free of localization
