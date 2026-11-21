## Legacy implementation notes

- Purchase order, contact info, address, credit card and line items were EJB 2.x CMP entity beans (`components/purchaseorder`, `contactinfo`, `address`, `creditcard`, `lineitem`); deleting an order cascaded to dependents via `ejb-jar.xml`.
- Order placement ran in `OrderEJBAction` (petstore): empty cart refused, order built with a generated id, then sent as an XML message to the Order Processing Center (`PurchaseOrderMDB` persists it and registers it PENDING).
- Billing/shipping field checks lived in `OrderHTMLAction`; the credit card on every order is a hard-coded placeholder (1234-2334, Duke Express, 10/2001), not customer input.
- Identifiers came from `uidgen` (`UniqueIdGeneratorEJB` and `CounterEJB`), backed by the `counter` table.
- Step routing is declared in `waf` `requestmappings.xml`.
- XML exchange forms are defined by DTDs; `CHK-BR-0005` records a conflict: Address.dtd marks Country optional while `Address.fromDOM` requires it.
- Service locator records (web tier caches, EJB tier does not) are stack plumbing; see the reject recommendations.
- Order purge (180 days, COMPLETED/DENIED) comes only from the operations runbook (job PS_ORDER_PURGE); the purge code was not read.
- Role checks: descriptors grant open access to address, contact and card beans.

## User interface

No screen records were extracted for this capability; its user interface is unspecified.
