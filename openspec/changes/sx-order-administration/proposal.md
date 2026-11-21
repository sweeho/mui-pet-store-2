## Why

Recover the order administration behaviour of the legacy pet store: an administrator signs in, launches a management client, lists orders by status, and views sales charts. This change records it as a reviewable specification.

## What Changes

- Specifies administrator-only access, session expiry and the launch/logout workflow.
- Specifies order listing by status, sales chart aggregation and the XML message contract between client and server.
- Flags legacy defects for Business Owner decision (see design.md); no behaviour is changed here.

## Impact

- Capability: order-administration (9 recovered records, 1 screen).
