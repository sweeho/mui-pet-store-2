## 1. Data model

- [ ] 1.1 Define the cart line (item id, product id, category, name, attribute, quantity, unit cost, line total)
- [ ] 1.2 Define the per-shopper session cart as a map of item id to quantity, starting empty

## 2. Cart operations

- [ ] 2.1 Implement add item with default quantity 1 and replace-on-readd semantics
- [ ] 2.2 Implement remove item as a no-op for absent items
- [ ] 2.3 Implement multi-item quantity update with removal at zero or less
- [ ] 2.4 Treat non-whole-number quantity input as 0
- [ ] 2.5 Implement empty cart and distinct-item count

## 3. Presentation and totals

- [ ] 3.1 List lines with current catalog data and omit lines whose lookup fails, logging the error
- [ ] 3.2 Compute the subtotal as the sum of unit cost times quantity
- [ ] 3.3 Confirm with the Business Owner the rounding and the add-time quantity validation gap
