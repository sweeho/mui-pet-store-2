## Legacy implementation notes

- Per-order status is a CMP entity (ManagerEJB, primary key orderId, cmp field status) behind ProcessManagerEJB (create / update / read; missing record signals not-found). Transition steps are loaded by class name at run time.
- Auto-approval runs in the OPC PurchaseOrderMDB after the order is persisted and registered PENDING; limits come from conf/petstore.properties (en_US 500, ja_JP 50000). An approved order emits an order-approval message on the same path the admin app uses (ApplRequestProcessor, batched with one commit).
- The order-approval MDB ignores updates for non-PENDING orders and always forwards a notice batch (possibly empty) to customer relations.
- OrderApproval XML is validated against its schema by default in the xmldocuments component.
- The v_order_status view joins orders with the order-manager table.

## Disputes and open questions

- Boundary at exactly 500: code uses strictly below 500; ORDER-ADMIN-REQ-0006 and the user guide say "exceeds 500". Needs the Business Owner.
- SHIPPED_PART: set by code and in the lifecycle, but missing from the user guide and from the DDL-level record (APPROVAL-BR-0001). Confirm with an SME.
- Orders for other locales (e.g. zh_CN) never auto-approve.

## User interface

No screen records were extracted for this capability; its user interface is unspecified.
