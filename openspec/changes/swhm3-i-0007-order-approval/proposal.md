## Why

Recover the legacy order-approval behaviour: how a received purchase order is auto-approved or held PENDING, how an administrator's decision is applied, and how the per-order status record and the OrderApproval document carry that state.

## What Changes

- Specify the order status set and lifecycle, and the per-order status record.
- Specify locale-based auto-approval (US under 500, Japan under 50000, others pending).
- Specify decision handling (PENDING only, otherwise ignored) and the customer notice batch.
- Specify the OrderApproval XML exchange document and its validation.

## Impact

- Capability: order-approval. Adjacent capabilities (checkout, supplier fulfilment, notifications, order administration) are specified separately.
- Several records are disputed (boundary at exactly 500, SHIPPED_PART missing from the guide); see design.md.
