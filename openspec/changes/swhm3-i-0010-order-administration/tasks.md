## 1. Access and session

- [ ] 1.1 Restrict the admin entry point to the administrator role with a form sign-in
- [ ] 1.2 Enforce role (not just session existence) on the data endpoint, pending Business Owner decision
- [ ] 1.3 Implement 54-minute idle session expiry and the session-timed-out error
- [ ] 1.4 Implement the admin home page with launch-client and logout actions

## 2. Order listing

- [ ] 2.1 Implement find-orders-by-exact-status
- [ ] 2.2 Return id, user id, M/D/YYYY date, value, status and total count per listing
- [ ] 2.3 Build the order list screen for the four statuses with pending/non-pending views
- [ ] 2.4 Implement unsaved-changes warning on refresh

## 3. Sales charts

- [ ] 3.1 Aggregate revenue or quantity per category for a date range
- [ ] 3.2 Aggregate per item within a chosen category
- [ ] 3.3 Parse month/day/year dates with validation
- [ ] 3.4 Decide money precision for revenue totals

## 4. Client message contract

- [ ] 4.1 Implement GETORDERS, UPDATESTATUS, REVENUE and ORDERS requests
- [ ] 4.2 Return an error response for unknown or unparseable requests
