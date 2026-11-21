## 1. Data model

- [ ] 1.1 Define purchase order and order line records with their keys and constraints
- [ ] 1.2 Define address, contact and credit card records and their mandatory fields
- [ ] 1.3 Define the named counter record for identifier generation

## 2. Order placement

- [ ] 2.1 Refuse empty-cart orders and validate billing and shipping fields
- [ ] 2.2 Build the purchase order with generated id, lines and total
- [ ] 2.3 Reject order lines with quantity not above zero
- [ ] 2.4 Send the placed order to the Order Processing Center and empty the cart
- [ ] 2.5 Persist received orders as PENDING

## 3. Identifier generation

- [ ] 3.1 Issue prefix plus per-prefix counter value atomically
- [ ] 3.2 Create missing counters starting at 0

## 4. Documents and cascades

- [ ] 4.1 Implement XML forms for address, contact, card and line item
- [ ] 4.2 Implement the card expiry month/year rule with defaults
- [ ] 4.3 Cascade order deletion and purge to dependent records
- [ ] 4.4 Resolve the Country optional/mandatory conflict with the Business Owner
