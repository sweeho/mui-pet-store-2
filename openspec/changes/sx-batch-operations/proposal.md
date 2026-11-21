# Batch operations

## Why
Recover the nightly and periodic batch behaviour of the legacy Pet Store: backup, Finance order extract, aging and low-stock reports, weekly purge, catalog integrity check and web module health check, plus their ordering, limits, logging and exit codes.

## What changes
Adds the batch-operations capability as 27 requirements (2 approved, 25 awaiting SME review).

## Impact
Scheduling, file outputs (orders_YYYYMMDD.csv, order_aging report), database retention and operator notification.
