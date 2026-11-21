## Why

Recover the legacy supplier-fulfillment behaviour: how an approved order becomes a supplier purchase order, how the supplier ships lines from stock, issues invoices and reprocesses pending orders, and how its documents and stored records are shaped.

## What Changes

- Specify the supplier order, supplier line and inventory records.
- Specify all-or-nothing line shipment, order completion and invoice contents.
- Specify the SupplierOrder and Invoice XML exchange documents and messaging destinations.
- Specify line item and invoice-receipt behaviour.

## Impact

- Capability: supplier-fulfillment. Order approval, notifications and batch operations are specified separately.
- Several records conflict between sources (status set, non-negative stock, role name, line-item shipped cap); see design.md.
