# Rebuild guidance (Java Pet Store 1.3.2 extraction SX-0001)

Read `openspec/changes/sx-<capability>/specs/*/spec.md` first. Those delta specs are the requirements. `api/openapi.yaml`, `architecture/erd.mermaid` and `architecture/schema.sql` describe the legacy system and are evidence only; where they disagree with a delta spec, the delta spec wins. `build/manifest.yaml` gives the release order.

## Order and shape
- Build in manifest order: localization, catalog-browsing, customer-accounts, shopping-cart, checkout-order-placement, order-approval, then supplier-fulfillment, customer-notifications, order-administration, and batch-operations last.
- Legacy messaging (JMS queues between storefront, order processing, supplier and mailer) is an implementation detail. Preserve the observable behaviour (an order is handed off, approved, shipped, invoiced, mailed), not the queues or XML documents, unless a spec names the document as an interface.

## Flagged legacy defects: decide, do not copy
- Passwords are stored in clear (`signon_user.password`) and the create-user servlet logs the password. Rebuild with salted slow hashes and no logging.
- Card numbers are stored in clear. Rebuild must not store them in clear.
- `item_details` has no price-versus-cost check; sample data has an item priced below cost.
- Disputed records (the approval boundary at exactly 500, SHIPPED_PART missing from the guide, supplier status set, non-negative stock, shipped cap) are listed in each change's `design.md`. They need a Business Owner decision before implementation.
- `order_manager.order_id` has no foreign key to `purchase_order`; the legacy relies on identifiers matching.
- de_DE is offered in the locale form but has no screen definitions; it falls back to the default.

## Data
- Identifiers come from named counters; keep atomic, unique generation per prefix.
- Order dates are epoch milliseconds in legacy storage; choose a native timestamp and convert at migration.
- Seed data lives in legacy-source populate files (catalog) and the supplier Populate servlet (inventory).

## Out of extraction
- No screens were extracted except the locale selection form and the order list by status. All other UI needs design from the specs, not from the legacy JSPs.
