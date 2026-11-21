# Pet Store Modernisation

_PRD v5 · approved 2026-11-21 · by sweeho@gmail.com. Published from the Design Workbench — edit it there, not here._

## Summary

Pet Store Modernisation replaces the Java Pet Store 1.3.2 online shop and its supporting back office with a rebuilt system that keeps the approved behaviour. Shoppers browse a localized catalog, keep a cart, sign on and place orders. Orders are approved automatically within locale limits or held for an administrator, then fulfilled by a supplier and notified to the customer by e-mail. Administrators manage orders and view sales charts. Operations run nightly and weekly batch jobs for backup, Finance extract, reports, integrity checks and purge.

## Context

The existing system is being replaced, and its behaviour has been extracted and approved as the specification on this initiative. This document states what the replacement must do, taken only from that specification. The specification describes the system as it exists, including some behaviour the business may not want to keep. Those points are named under Open questions and are not decided here.

No source documents were uploaded, so no disagreement between documents and the specification has been recorded.

## Goals

- Let shoppers browse and search the catalog in their own language (en_US, ja_JP, zh_CN, with en_US as default) with prices and numbers formatted for their locale.
- Let shoppers keep a per-session cart with add, remove, update, count and subtotal.
- Let visitors create accounts, sign on and off, keep a profile, and return to the page they asked for after sign-on.
- Let a signed-on customer check out: shipping and billing details, a purchase order with unique identifier, and hand-off to order processing.
- Approve small orders automatically (US under 500, Japan under 50000) and leave all others pending for an administrator decision.
- Ship approved orders from supplier stock, invoice them, and complete them only when every line has shipped.
- Tell customers of order status changes by e-mail, controlled by administrator-enabled switches.
- Give administrators an order list by status, batch approve or deny, and sales charts.
- Run the nightly and weekly batch chain: backup, Finance extract of the previous day, aging and low-stock reports, catalog integrity check, weekly purge, with logging and exit codes.
- Provide a landing page, global navigation, a shared layout and shared empty, error and loading frames.

## Non-goals

- Payment authorisation: the existing store performs none.
- Adding locales beyond en_US, ja_JP and zh_CN, and de_DE as offered on the selection form.
- Catalog maintenance screens and any price-versus-cost validation.
- Persisting carts beyond the session.
- Notification channels other than e-mail, and localizing the mailer itself.
- Copying the existing plain-text password and card number storage. The specification records it as a defect for the Business Owner.

## Users

- Shopper or visitor: browses, searches, fills a cart, signs up and signs on.
- Customer: a signed-on shopper who keeps a profile, places orders and receives status e-mail.
- Administrator: holds the administrator role; lists and decides on orders, views sales charts, and updates supplier inventory.
- Supplier: receives purchase orders, ships from stock and returns invoices.
- Finance: receives the nightly order extract and a failure e-mail when it is not produced.
- Operator: receives reports on stuck orders and low stock, and failure notices from batch jobs and health checks.

## User journeys

1. Browse and find a pet: Landing page, Category list, Product list, Item list, Item detail. Search by keyword goes from any page to Search results, then Item detail.
2. Change language: Locale selection form, Locale-change success screen, then the page the shopper came from in the new locale.
3. Sign up: Sign-in page, Account creation (profile form), Sign-on welcome screen. A duplicate user name goes to the Duplicate account screen.
4. Sign on and return: Protected page requested, Sign-on form, the originally requested page. A failed sign-on goes to the Sign-in error screen.
5. Buy: Cart, Sign-on form if not signed on, Shipping information, Billing information, Order confirmation showing order id and bill-to e-mail. A missing-form-data screen is shown when a step lacks required input.
6. Edit profile: Profile screen, saved profile, session locale switched to the preferred language.
7. Sign off: Sign-off screen, with a new session that keeps only the locale.
8. Administrator decides on orders: Admin sign-in form, Admin home page, Order management client, Order list by status, approve or deny pending orders, commit.
9. Administrator views sales: Admin home page, Order management client, Sales charts for a date range.
10. Administrator updates stock: Inventory page, update quantities. A non-administrator sees a not-authorised message.

## Capability map

- localization: supported locales, locale parsing, session locale change and fallback, per-locale text, request encoding and locale-aware formatting.
- catalog-browsing: read-only category, product and item lists and detail by locale, name ordering, offset paging, keyword search and page size.
- customer-accounts: sign up, sign on and off, session timeouts, return to requested page, remember-user-name cookie and profile.
- shopping-cart: per-session cart with add, remove, update, count, empty, line presentation and subtotal.
- checkout-order-placement: shipping and billing validation, purchase order with contact, card and lines, unique identifiers, and hand-off to order processing.
- order-approval: order status lifecycle, locale-based auto-approval, administrator decisions and the approval exchange document.
- supplier-fulfillment: supplier order creation, all-or-nothing line shipment from inventory, completion, invoices and supplier inventory.
- customer-notifications: queue-based HTML order-status e-mail with enablement switches, locale-specific rendering and defined failure handling.
- order-administration: administrator-only management client with order list by status, batch decisions, sales charts and session expiry.
- batch-operations: nightly and weekly batch chain with backup, Finance extract, reports, integrity check, purge, logging and exit codes.
- Site shell (from the specification; describe it in one line)

## Screens

- Landing page: introduces the product and links to every primary area (site-shell specification).
- Locale selection form: offers US English (en_US), German (de_DE), Japanese (ja_JP) and Simplified Chinese (zh_CN) and submits the chosen code as "locale".
- Category, product and item lists and Item detail: shown in the shopper locale, in ascending name order, two items per page by default with next and previous.
- Search results: items matching any entered keyword, paged like other lists.
- Cart: each line with item, product, category, name, attribute, unit cost and quantity, plus the subtotal.
- Sign-in page, Sign-on form, Sign-in error, Duplicate account, Sign-off and Sign-on welcome screens.
- Profile form: contact details, address, payment card, preferred language, favorite category, my-list and banner preferences; mandatory fields are enforced.
- Shipping information, Billing information and Missing-form-data screens in the checkout flow.
- Admin home page: launch the order-management client and log out.
- Order list by status: order id, user id, order date (month/day/year), order value and status, with pending orders presented separately from approved, denied and completed ones.
- Sales charts: revenue and order quantity per category, or per item within a chosen category, for a date range entered as mm/dd/yyyy, with a total.
- Inventory page: administrator-only stock update.
- Shared empty, error (with retry) and loading frames used by every page.

## Constraints and assumptions

- Orders get unique identifiers from per-prefix counters that are incremented atomically.
- Automatic approval limits are US 500 and Japan 50000. Other locales are never approved automatically.
- Supplier lines ship all or nothing; an order completes only when every line has shipped. Shipped quantity never exceeds ordered quantity.
- Defaults for batch jobs: order retention 180 days, backup retention 7 days, stuck-order limit 24 hours, low-stock limit 500 units. Exit codes are 0 success, 4 found something, 8 error.
- Nightly chain: backup at 01:00, Finance extract at 01:30 only after a successful backup, aging report at 01:45, inventory report at 01:50, weekly purge Sunday 02:00 only after a successful extract, catalog check daily at 06:00.
- The Finance extract covers only the previous day and is written as orders_YYYYMMDD.csv without a header and with a TRAILER line.
- Order status mail is off unless an administrator enables it, and the confirmation, approval and completed switches are off in the shipped configuration.
- The specification records that the existing system stores passwords and card numbers in plain text. This PRD assumes the rebuild does not copy that, pending the Business Owner.
- The specification says the existing system performs no payment authorisation and no price-versus-cost check.

## Open questions

- Approval boundary: one requirement approves orders under 500 automatically, another treats orders as pending only when the total exceeds 500. Behaviour at exactly 500 is unspecified. The business must decide.
- Order status set: the lifecycle lists SHIPPED_PART, while the process-manager record allows only PENDING, APPROVED, DENIED and COMPLETED. The specification marks this as disputed.
- Session timeouts: signed-on customer sessions end after 15 minutes, while another requirement expires an inactive web session after 30 minutes. This PRD assumes 15 minutes for signed-on customers; the business should confirm which applies.
- Administrator session expiry is 54 minutes in the specification, an unusual value. Confirm it is intended.
- Plain-text passwords and card numbers: the business must decide the rebuild's handling. This PRD assumes they are not copied.
- Locales: the supported-locale requirement lists en_US, ja_JP and zh_CN, but the selection form also offers de_DE. Confirm whether German is in scope.
- Manifest and specification differ in scope: the specification contains a site-shell change (landing page, navigation, shared layout and state frames) that the build manifest does not list, so this PRD maps it to no manifest capability and lists it only under Screens. Decide whether to add site-shell as an eleventh capability.
- The change directories on this branch are named swhm3-i-NNNN-..., while the manifest names them sx-<slug>. Sources below cite the directories that exist.

## Sources

The sources are the approved specification files on this branch, one per capability, cited per section in design/prd/sources.yaml. No uploaded documents were provided.
