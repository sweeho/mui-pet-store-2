## ADDED Requirements

### Requirement: Batch lookup indexes
Recovered from: BAT-REQ-0011
The system SHALL provide lookups indexed by product category, item product, purchase order user and date, and order approval status.

#### Scenario: Batch lookup indexes
- **GIVEN** a lookup by purchase order user and date
- **WHEN** orders for a user in a date range are requested
- **THEN** they are found through the index without a full scan

### Requirement: Purge runs after extract
Recovered from: BATCH-BR-0006
The system SHALL run the order purge only after the order extract has run, so that every order has been extracted before deletion.

#### Scenario: Purge runs after extract
- **GIVEN** the order extract has not succeeded today
- **WHEN** the Sunday purge is due
- **THEN** the purge does not start

### Requirement: Catalog bootstrap on missing tables
Recovered from: BATCH-REQ-0010
GIVEN the catalog tables do not exist WHEN the catalog check runs THEN the system SHALL request the storefront's populate function without forcing it, re-run the checks, and end with code 8 if that request fails.

#### Scenario: Catalog bootstrap on missing tables
- **GIVEN** the catalog tables do not exist
- **WHEN** the catalog check runs
- **THEN** a non-forced first load is requested from the storefront and the checks are re-run; exit code 8 if the request fails

### Requirement: Order extract window and format
Recovered from: BATCH-BR-0004
The system SHALL export the purchase orders dated from yesterday 00:00 (inclusive) to today 00:00 (exclusive) to a UTF-8 comma-separated file with double-quote delimiters named orders_YYYYMMDD.csv, ordered by order id.

#### Scenario: Order extract window and format
- **GIVEN** orders dated yesterday and today
- **WHEN** the extract runs
- **THEN** only yesterday's orders are written, ordered by order id

### Requirement: Purge of finished orders
Recovered from: BATCH-BR-0005
The system SHALL permanently delete COMPLETED and DENIED orders older than the retention limit (180 days by default), together with their order lines, supplier orders and lines, contact information, address and payment card, in a single transaction; PENDING and APPROVED orders MUST never be purged.

#### Scenario: Purge of finished orders
- **GIVEN** a COMPLETED order 200 days old and a PENDING order 200 days old
- **WHEN** the purge runs
- **THEN** the COMPLETED order and its dependants are deleted and the PENDING order remains

### Requirement: Nightly Finance extract
Recovered from: BATCH-REQ-0003
The system SHALL export the previous day's purchase orders each night at 01:30, after a successful backup, to a CSV file for Finance, and SHALL end with code 8 and notify Finance when the export fails.

#### Scenario: Nightly Finance extract
- **GIVEN** a successful backup tonight
- **WHEN** 01:30 arrives
- **THEN** the extract file for the previous day is produced for Finance

### Requirement: Order extract file layout
Recovered from: BATCH-REQ-0004
The order extract file SHALL have no header row, SHALL contain per order the columns order number, user name, order time in epoch milliseconds, locale, order total, number of order lines and order status, and SHALL end with a trailer line TRAILER,YYYYMMDD,<row count> where the count excludes the trailer.

#### Scenario: Order extract file layout
- **GIVEN** an extract of 3 orders for 2026-11-20
- **WHEN** the file is written
- **THEN** it has 3 data rows without header and the final line is TRAILER,20261120,3

### Requirement: Sunday order purge schedule
Recovered from: BATCH-REQ-0008
The system SHALL, on Sundays only at 02:00 and after the order extract has succeeded, delete COMPLETED and DENIED orders older than 180 days together with their dependent records.

#### Scenario: Sunday order purge schedule
- **GIVEN** it is Sunday and the extract has succeeded
- **WHEN** 02:00 arrives
- **THEN** the purge runs; on other days it does not

### Requirement: Extract covers day D-1 only
Recovered from: BATCH-RULE-0004
GIVEN an extract run on date D WHEN the job executes THEN it SHALL always cover day D-1 only; re-extracting an older day is a manual operation.

#### Scenario: Extract covers day D-1 only
- **GIVEN** an extract run on date D
- **WHEN** the job executes
- **THEN** only orders of day D-1 are exported

### Requirement: Shared batch logging
Recovered from: BATC-REQ-0001
The system SHALL write a time-stamped, job-tagged line to batch.log in the log folder whenever a batch job logs through the shared logging helper.

#### Scenario: Shared batch logging
- **GIVEN** a batch job that logs a message
- **WHEN** the helper is called
- **THEN** a line with timestamp and job tag is appended to batch.log

### Requirement: Catalog integrity findings
Recovered from: BATCH-BR-0001
The system SHALL, in the catalog integrity check, report every category that has no product, every product that has no item, every item whose list price is below unit cost, every item lacking a description for a locale of its category, and every item with no supplier inventory row, and SHALL end with code 4 when any is found.

#### Scenario: Catalog integrity findings
- **GIVEN** a product with no item
- **WHEN** the check runs
- **THEN** the product is reported and the job ends with code 4

### Requirement: Stuck and mismatched order report
Recovered from: BATCH-BR-0003
The system SHALL list every order still PENDING or APPROVED more than 24 hours after its order date, oldest first, with order id, user, locale, value and status, followed by a count of orders per status.

#### Scenario: Stuck and mismatched order report
- **GIVEN** an APPROVED order placed 30 hours ago
- **WHEN** the aging report runs
- **THEN** the order is listed as STUCK

### Requirement: Online database backup
Recovered from: BATCH-BR-0007
The system SHALL take an online backup of the PetStore database into the backup folder, moved to a dated folder PetStoreDB_YYYYMMDD.

#### Scenario: Online database backup
- **GIVEN** the database is running
- **WHEN** the backup job runs
- **THEN** a dated backup folder exists and the database stayed online

### Requirement: Order indexes and summary view
Recovered from: BATCH-ENT-0001
The system SHALL index purchase orders by user and date, and orders by status, to support the batch jobs, and SHALL expose a view giving one row per order with its user, date, value and order-processing status.

#### Scenario: Order indexes and summary view
- **GIVEN** the order tables
- **WHEN** the batch jobs filter by user, date or status
- **THEN** indexes support the filters and the view returns one row per order

### Requirement: Aging report content
ID: SWHM3-R-0006
Recovered from: BATCH-REQ-0006
The system SHALL list orders still PENDING or APPROVED after 24 hours, and orders the supplier has invoiced but the order processing has not completed (MISMATCH), with a count of orders per status.

#### Scenario: Aging report content
- **GIVEN** a supplier order COMPLETED while the order is APPROVED
- **WHEN** the aging report runs
- **THEN** the order is listed as MISMATCH

### Requirement: Daily low-stock report
Recovered from: BATCH-REQ-0007
The system SHALL produce a daily report of supplier items with stock below 500 units, after the order extract has succeeded.

#### Scenario: Daily low-stock report
- **GIVEN** an item with quantity 120
- **WHEN** the inventory report runs at 01:50 after the extract
- **THEN** the item is listed

### Requirement: Daily catalog integrity check
Recovered from: BATCH-REQ-0009
The system SHALL run a catalog integrity check daily at 06:00, covering categories without products, products without items, items priced below cost, items without a description for a category locale, and items without inventory.

#### Scenario: Daily catalog integrity check
- **GIVEN** 06:00 arrives
- **WHEN** the scheduler fires
- **THEN** the five checks run independent of the nightly chain

### Requirement: Batch execution context
Recovered from: BATCH-REQ-0012
The system SHALL run all batch jobs under the application service account on the single application node, from the batch script directory.

#### Scenario: Batch execution context
- **GIVEN** a scheduled job
- **WHEN** it starts
- **THEN** it runs as the service account on the application node

### Requirement: Default operating limits
Recovered from: BATCH-RULE-0008
The system SHALL apply these default operating limits, configurable in the batch environment: order retention 180 days, backup retention 7 days, stuck-order limit 24 hours, low-stock limit 500 units.

#### Scenario: Default operating limits
- **GIVEN** no overrides in the batch environment
- **WHEN** jobs run
- **THEN** the defaults apply; an override changes the limit

### Requirement: Job logging and exit codes
Recovered from: BATCH-RULE-0012
The system SHALL write one log line per job start and end to batch.log, and SHALL use exit code 0 for success, 4 for a report or check that found something, and 8 for a SQL, file or HTTP error.

#### Scenario: Job logging and exit codes
- **GIVEN** a report job that finds a stuck order
- **WHEN** it ends
- **THEN** exit code is 4 and start and end lines are logged

### Requirement: Nightly chain ordering
Recovered from: BATCH-WORKFLOW-0001
The system SHALL run a nightly chain in which the database backup (01:00) must succeed before the order extract (01:30) starts, and the order aging report (01:45), inventory report (01:50) and weekly purge (Sunday 02:00) each start only after the extract has succeeded; the catalog check SHALL run daily at 06:00 independent of that chain.

#### Scenario: Nightly chain ordering
- **GIVEN** the backup failed
- **WHEN** 01:30 arrives
- **THEN** the extract waits and does not run

### Requirement: Low-stock report content
Recovered from: BATCH-BR-0002
The system SHALL report supplier inventory items whose quantity is below the configured low-stock threshold (500 by default), ordered by lowest quantity first, with item, product and English description, plus total items tracked and units in stock.

#### Scenario: Low-stock report content
- **GIVEN** items with quantities 10 and 300
- **WHEN** the report runs
- **THEN** item 10 is listed before item 300 with the totals

### Requirement: Operating policy summary
ID: SWHM3-R-0016
Recovered from: BATCH-REQ-0001
The system SHALL delete completed and denied orders older than 180 days, keep backups for 7 days, report orders pending or approved for more than 24 hours as stuck, and list supplier items with stock below 500 units.

#### Scenario: Operating policy summary
- **GIVEN** default settings
- **WHEN** the batch jobs run
- **THEN** those four limits are applied

### Requirement: Nightly database backup
Recovered from: BATCH-REQ-0002
The system SHALL take an online backup of the order database daily at 01:00, keep backups for 7 days and delete older ones; a failed backup SHALL end the job with code 8, notify operations, and be rerun up to 2 times.

#### Scenario: Nightly database backup
- **GIVEN** a backup folder 9 days old
- **WHEN** the backup job runs
- **THEN** the old folder is deleted

### Requirement: Extract failure notification
Recovered from: BATCH-REQ-0005
The system SHALL, when the order extract fails, send an e-mail to the Finance mailbox stating that the extract was not produced.

#### Scenario: Extract failure notification
- **GIVEN** the extract fails
- **WHEN** the job ends with code 8
- **THEN** Finance receives an e-mail that the extract was not produced

### Requirement: Web module health check
Recovered from: BATCH-REQ-0011
The system SHALL check every 10 minutes, all day from 00:00 to 23:59, that the storefront, order processing, supplier and admin web modules each answer HTTP 200 within 20 seconds; any that does not SHALL be logged as DOWN, the job SHALL end with code 8 and operations SHALL be mailed.

#### Scenario: Web module health check
- **GIVEN** the supplier module does not answer within 20 seconds
- **WHEN** the check runs
- **THEN** it is logged DOWN, exit code is 8 and operations is mailed

### Requirement: Nightly chain start times
Recovered from: BATCH-WF-0001
The system SHALL run a nightly batch chain in which the database backup starts at 01:00 every day, the order extract starts no earlier than 01:30 and only after the backup succeeded, and the dependent reports and Sunday purge follow only after a successful extract.

#### Scenario: Nightly chain start times
- **GIVEN** a successful backup
- **WHEN** 01:30 arrives
- **THEN** the extract starts

