# Shopping cart (recovered from legacy)

## Why
Record the shopping-cart behaviour of the legacy Pet Store as a specification the rebuild can be verified against.

## What changes
Adds one capability, `shopping-cart`: a per-shopper session cart with add, remove, update, empty, count, line presentation and subtotal. 12 extraction records are stated; none is approved yet.

## Impact
Checkout (`checkout-order-placement`) reads the cart; localization supplies the locale used for line lookups (record SHOP-REQ-0006 belongs to that capability, not this one).
