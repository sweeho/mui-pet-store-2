# Design: batch-operations (legacy implementation notes)

## User interface
No screen records were extracted for this capability; its user interface is unspecified.

## Legacy implementation
- Scheduling: Control-M folder PS_PETSTORE_DAILY (legacy-source/scheduler/control-m/PS_PETSTORE.xml). Conditions PS_DB_BACKUP-OK and PS_ORDER_EXTRACT-OK chain the jobs; the extract deletes the backup condition after use.
- Jobs are shell scripts under legacy-source/batch/ (e.g. ps_db_backup.sh) using a shared logging helper writing batch.log, and an `ij` SQL runner; a script fails when any output line begins with ERROR.
- Backup uses SYSCS_BACKUP_DATABASE, renames the folder to PetStoreDB_YYYYMMDD, and removes folders older than PS_BACKUP_KEEP_DAYS with find -mtime.
- Limits (180/7/24h/500) live in env.sh and are also stated in properties and the operations runbook.
- Exit codes: 0 success, 4 finding, 8 error. Failures mail operations or Finance via the scheduler.
- Catalog check C1-C5 are SQL queries; missing tables trigger a non-forced storefront populate request.
- Order indexes and the OPC status view are defined in the db schema DDL.
- Records overlap across passes (extract, purge, aging, low-stock, backup, chain ordering each appear two or three times); consolidated keys are kept as separate requirements for review.
- Open point: BATCH-REQ-0007 says Sunday-only purge at 02:00; reachability of weekday settings in the scheduler is not independently confirmed.
