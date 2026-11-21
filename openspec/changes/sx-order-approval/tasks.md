## 1. Data model

- [ ] 1.1 Define the per-order status record keyed by order id with a mandatory text status
- [ ] 1.2 Define the status set PENDING, APPROVED, DENIED, SHIPPED_PART, COMPLETED and its lifecycle
- [ ] 1.3 Define the order status view joining orders with their status records
- [ ] 1.4 Index orders by status

## 2. Status service

- [ ] 2.1 Create a status record for a new order with an initial status
- [ ] 2.2 Update and read a status by order id, signalling not-found when absent
- [ ] 2.3 Support a pluggable transition step that wraps instantiation failures in a transition error

## 3. Auto-approval

- [ ] 3.1 Apply the US (below 500) and Japan (below 50000) limits
- [ ] 3.2 Leave other locales and over-limit orders PENDING
- [ ] 3.3 Emit an APPROVED order-approval message for auto-approved orders only

## 4. Decision handling

- [ ] 4.1 Apply decisions only to PENDING orders and ignore others silently
- [ ] 4.2 Update status and queue a customer notice for each accepted decision
- [ ] 4.3 Forward an empty notice batch when no order changed
- [ ] 4.4 Let an administrator submit batched decisions as an order-approval message

## 5. Order-approval document

- [ ] 5.1 Define the OrderApproval document with OrderId and OrderStatus entries
- [ ] 5.2 Validate incoming documents against the schema and reject malformed ones
