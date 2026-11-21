# Customer notifications (recovered from legacy)

## Why
The legacy Pet Store sends order-status e-mails (approval/denial, shipment, completion) through a queue-based mailer. The rebuild must preserve what customers receive, when mail is suppressed, and how failures are handled.

## What changes
Recovers 14 behaviours: mail request shape, queue hand-off, HTML delivery, enable switches (default off), subjects and locale-specific bodies, failure handling and transaction semantics.

## Impact
Capability `customer-notifications`. No screens were extracted.
