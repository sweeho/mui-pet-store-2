## 1. Data model

- [ ] 1.1 Define the supplier order record (id, date, status, contact reference)
- [ ] 1.2 Define the supplier line record keyed by order id and line number
- [ ] 1.3 Define the inventory record with one integer quantity per item
- [ ] 1.4 Define the order line item with exact-decimal unit price and shipped quantity
- [ ] 1.5 Decide the shipped-not-above-ordered and non-negative stock constraints

## 2. Order intake and shipment

- [ ] 2.1 Receive a supplier purchase order, persist it as PENDING with copied contact and lines
- [ ] 2.2 Ship each line all-or-nothing against stock and skip already shipped lines
- [ ] 2.3 Treat an item with no inventory record as unavailable
- [ ] 2.4 Mark the order COMPLETED only when every line shipped, else leave PENDING
- [ ] 2.5 Find supplier orders by status

## 3. Invoicing and invoice receipt

- [ ] 3.1 Issue an invoice for lines shipped in the current pass and publish it
- [ ] 3.2 Apply a received invoice to line shipped quantities and report completeness

## 4. Inventory update

- [ ] 4.1 Apply submitted quantities only for ticked, non-empty, non-negative entries
- [ ] 4.2 Reprocess pending orders and send invoices in the same transaction
- [ ] 4.3 Restrict inventory update to the administrator role

## 5. Documents and messaging

- [ ] 5.1 Produce and validate the SupplierOrder document
- [ ] 5.2 Produce and validate the Invoice document
- [ ] 5.3 Read and validate the PurchaseOrder document
- [ ] 5.4 Configure the messaging destinations
- [ ] 5.5 Reject null values and format dates as yyyy-MM-dd
