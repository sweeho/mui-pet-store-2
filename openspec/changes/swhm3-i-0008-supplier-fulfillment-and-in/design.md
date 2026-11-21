## Legacy implementation notes

- Supplier orders arrive on a message-driven bean from the supplier purchase-order queue; a facade session bean parses, persists (container-managed entity beans) and processes them (`processPO`, `processAnOrder`). Invoices go to the invoice topic.
- Orders are created by the order approval consumer in the order processing center, which builds the XML with a document editor class (TPASupplierOrderXDE) and sends it before the customer mail.
- Inventory updates are posted from a servlet request processor under a user transaction; it then reprocesses PENDING orders. Access is limited by a web.xml security constraint plus a role check in the inventory JSP. The user guide calls the user a stock clerk; the code says administrator.
- Initial inventory is loaded by a populate servlet from an XML file.
- Line item and order entities use a container-generated key; unit price is a binary float in Java but number(12,2) in the DDL.

## Disputes and suspected defects

- D1: Status set. The code constants allow PENDING, APPROVED, DENIED, COMPLETED, the DDL check allows PENDING or COMPLETED, and the order side uses SHIPPED_PART.
- D2: Non-negative stock. One DDL export has a check; another has none; the reduce operation does not guard.
- D3: Shipped cap. The check exists only on the purchase-order line table; supplier lines have none.
- D4: Invoice addressee and user id are hard-coded literals.
- D5: Invoice receipt matches by item id only and uses exact equality, so over-shipment or duplicate item ids misbehave.
- D6: Zero unit price is allowed by the XSD despite the type name.

## User interface

The consolidated records for this capability include no `kind: screen` record, so this change carries no screen requirement. A screen-shaped inventory display record (item id, existing quantity, new-quantity input, Update tick box, empty-state message) exists in a pass file but was not consolidated under a record key; it is noted here, not specified. Whether the interface is specified is for the reviewer to settle against the recorded screen count.
