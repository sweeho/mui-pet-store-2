## Why

Recover the legacy Pet Store checkout and order-placement behaviour (order creation, address/contact/card records, line items, identifier generation, hand-off to the Order Processing Center) as a verifiable specification for the rebuild.

## What Changes

- Adds 36 requirements for `checkout-order-placement`, one per extracted IR record. Two carry approved keys; the rest await SME review with recommendations in `legacy-analysis/ir/_recommendations/checkout-order-placement.yaml`.
- No screen records were extracted, so no screen requirements are included.

## Impact

- Affected capability: checkout-order-placement.
