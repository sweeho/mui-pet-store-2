## 1. Scheduling and chain

- [ ] 1.1 Implement the nightly chain with backup, extract, aging report, inventory report and Sunday purge dependencies
- [ ] 1.2 Schedule the 06:00 catalog check and 10-minute health check independently
- [ ] 1.3 Run all jobs under the service account on the application node
- [ ] 1.4 Implement backup rerun up to 2 times and operator notification

## 2. Backup

- [ ] 2.1 Implement the online backup into dated folder PetStoreDB_YYYYMMDD
- [ ] 2.2 Implement 7-day backup retention deletion

## 3. Order extract

- [ ] 3.1 Export day D-1 orders ordered by order id with the specified columns and no header
- [ ] 3.2 Write the TRAILER line and orders_YYYYMMDD.csv naming
- [ ] 3.3 Mail Finance on extract failure with exit code 8

## 4. Reports and checks

- [ ] 4.1 Implement the order aging report with STUCK, MISMATCH and per-status counts
- [ ] 4.2 Implement the low-stock report with totals
- [ ] 4.3 Implement catalog checks C1 to C5 with exit code 4
- [ ] 4.4 Implement catalog bootstrap when tables are missing
- [ ] 4.5 Implement the web module health check with DOWN logging

## 5. Purge

- [ ] 5.1 Implement the Sunday purge of COMPLETED and DENIED orders older than retention in one transaction
- [ ] 5.2 Guarantee PENDING and APPROVED orders are never purged
- [ ] 5.3 Gate the purge on a successful extract

## 6. Configuration, logging and data

- [ ] 6.1 Provide configurable limits with the default values
- [ ] 6.2 Implement batch.log logging and exit codes 0, 4, 8
- [ ] 6.3 Add order indexes and the per-order status view
