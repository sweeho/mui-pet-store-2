## Why

The legacy pet store serves shoppers in several languages. Locale selection, locale parsing, per-locale catalog text, request encoding and locale-aware formatting are spread over the web framework, catalog, cart, mailer and database modules. They must be recovered as one capability so the rebuild keeps their behaviour.

## What Changes

- Records the supported locales, default locale and locale-code parsing rules.
- Records how the shopper's locale is chosen, changed and remembered, and how screens fall back to the default locale.
- Records per-locale catalog text and price storage, request character encoding and locale-aware number and currency formatting.
- Records the locale-selection screen.
- Flags suspected legacy defects for a person to decide; nothing is silently corrected.

## Impact

- Affected specs: localization (new).
- Source: the web application framework (waf), catalog, cart, mailer, encoding filter, order-processing and database schema modules.
