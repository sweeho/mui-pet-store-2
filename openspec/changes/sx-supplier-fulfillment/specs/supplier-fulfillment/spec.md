## ADDED Requirements

### Requirement: Supplier order status set
Recovered from: SUPP-RULE-0001
The system SHALL restrict supplier order status to PENDING, APPROVED, DENIED and COMPLETED, progressing PENDING to APPROVED to COMPLETED, or PENDING to DENIED.

#### Scenario: Supplier order status set
- **GIVEN** a supplier order in PENDING status
- **WHEN** its status is changed
- **THEN** only PENDING, APPROVED, DENIED or COMPLETED are valid, following the stated progression

### Requirement: Initial inventory population
Recovered from: SUPPLIER-FULFILLMENT-WORKFLOW-0012
The system SHALL provide a populate function that loads initial inventory from an XML file.

#### Scenario: Initial inventory population
- **GIVEN** an XML file of initial inventory
- **WHEN** the populate function is run
- **THEN** inventory records are loaded from the file

### Requirement: Line item creation
Recovered from: supplier-fulfillment-REQ-0002
The system SHALL create a line item either from explicit values (category, product, item, line number, quantity, price, quantity shipped) or by copying a line item data object and setting quantity shipped from a separately supplied quantity.

#### Scenario: Line item creation
- **GIVEN** explicit values or an existing line item with a shipped quantity
- **WHEN** a line item is created
- **THEN** a line item with those values is stored without further validation

### Requirement: Invoice receipt updates shipped quantities
Recovered from: SUP-BR-0004
WHEN a supplier invoice is received for a purchase order, the system SHALL add the shipped quantity to the shipped quantity of each matching line item (by item id) and SHALL report the order as completely fulfilled only if every line item's quantity equals its shipped quantity.

#### Scenario: Invoice receipt updates shipped quantities
- **GIVEN** a purchase order with two lines and an invoice shipping one of them
- **WHEN** the invoice is received
- **THEN** that line shipped quantity increases by the invoiced amount and the order is reported not complete

### Requirement: Invoice XML document
ID: SWHM3-R-0005
Recovered from: SUPFUL-INT-0004
The system SHALL return shipment results from the supplier as an Invoice XML document carrying order id, user id, order date, shipping date (yyyy-MM-dd) and one or more line items.

#### Scenario: Invoice XML document
- **GIVEN** a shipment made by the supplier
- **WHEN** the invoice document is produced
- **THEN** it carries order id, user id, order date, shipping date and at least one line item

### Requirement: Line item document fields
Recovered from: SUPFUL-RULE-0005
The system SHALL describe each line item with category id, product id, item id, line number, quantity and unit price, and under XSD validation SHALL require all six, line number non-negative, quantity a positive integer and unit price a decimal of at least 0.

#### Scenario: Line item document fields
- **GIVEN** a line item document validated under XSD
- **WHEN** the line item has quantity 0
- **THEN** validation fails

### Requirement: All-or-nothing line shipment
Recovered from: SUPPLIER-FULFILLMENT-RULE-0002
The system SHALL ship a purchase-order line only when stock for its item is at least the line quantity, in which case it SHALL reduce stock by the line quantity and mark the whole line shipped; lines already fully shipped SHALL be skipped.

#### Scenario: All-or-nothing line shipment
- **GIVEN** a line of quantity 5 and stock of 3 for its item
- **WHEN** the order is processed
- **THEN** the line is not shipped and stock stays at 3

### Requirement: Invoice contents
Recovered from: SUPPLIER-FULFILLMENT-RULE-0005
The system SHALL issue an invoice only for the lines shipped in the current pass, carrying order id, order date, the shipping date (current date) and, per line, category, product, item, line number, quantity and unit price, and SHALL address it to the fixed text "Dear PetStore Customer".

#### Scenario: Invoice contents
- **GIVEN** an order with one line shipped this pass and one not
- **WHEN** the invoice is issued
- **THEN** it contains only the shipped line, dated today, addressed to "Dear PetStore Customer"

### Requirement: Inventory access restriction
Recovered from: SUPPLIER-FULFILLMENT-RULE-0009
The system SHALL restrict the supplier inventory screens and update action to users in the administrator role, over a confidential transport, and SHALL show a not-authorised message to others on the inventory page.

#### Scenario: Inventory access restriction
- **GIVEN** a signed-in user who is not an administrator
- **WHEN** the inventory page is requested
- **THEN** a not-authorised message is shown and no update is accepted

### Requirement: Order line item record
Recovered from: supplier-fulfillment-ENT-0001
The system SHALL represent each order line item with category id, product id, item id, line number, quantity, unit price and quantity shipped.

#### Scenario: Order line item record
- **GIVEN** an order line
- **WHEN** it is stored
- **THEN** category, product, item, line number, quantity, unit price and quantity shipped are held

### Requirement: Shipped not above ordered
Recovered from: FULFILL-BR-0001
The system SHALL NOT allow the quantity shipped on a line to exceed the quantity ordered.

#### Scenario: Shipped not above ordered
- **GIVEN** a purchase-order line item of quantity 5
- **WHEN** quantity shipped is set to 6
- **THEN** the change is rejected

### Requirement: Supplier order and inventory storage
Recovered from: FULFILL-ENT-0001
The system SHALL keep supplier orders (id, date, status PENDING or COMPLETED, contact) with supplier lines keyed by (order id, line number), and a supplier inventory with one quantity per item that is never negative.

#### Scenario: Supplier order and inventory storage
- **GIVEN** an inventory record
- **WHEN** a negative quantity is stored
- **THEN** the store rejects it

### Requirement: Inventory quantity
ID: SWHM3-R-0013
Recovered from: SUP-ENT-0009
The system SHALL hold one mandatory stock quantity per item, with no database rule preventing a negative quantity.

#### Scenario: Inventory quantity
- **GIVEN** an inventory record for an item
- **WHEN** it is stored without a quantity
- **THEN** it is refused as the quantity is mandatory

### Requirement: Purchase order document
Recovered from: SUP-REQ-0006
The system SHALL exchange a purchase order as an XML document containing locale (default en_US), order id, user id, e-mail id, order date, shipping info, billing info, total price, credit card and at least one line item, and SHALL validate it against the published schema when reading.

#### Scenario: Purchase order document
- **GIVEN** a purchase order document missing its line items
- **WHEN** it is read
- **THEN** it is rejected by validation

### Requirement: Document element construction
Recovered from: SUPFUL-REQ-0008
The system SHALL refuse to build a supplier-order or invoice element with a null value, and SHALL serialise dates as yyyy-MM-dd.

#### Scenario: Document element construction
- **GIVEN** a supplier order with a null order date
- **WHEN** the element is built
- **THEN** building is refused

### Requirement: DTD or XSD document validation
Recovered from: SUPFUL-REQ-0009
The system SHALL allow supplier documents to be produced and checked against either a DTD or an XSD, chosen per builder instance, resolving the schema location through an optional entity catalog and falling back to built-in schema locations.

#### Scenario: DTD or XSD document validation
- **GIVEN** a builder configured for XSD
- **WHEN** a document is produced
- **THEN** no DOCTYPE is written and the XSD location is resolved by catalog or built-in default

### Requirement: Document editor selection
Recovered from: SUPFUL-REQ-0010
The system SHALL select a document editor class by mapping a schema URI through a catalog and SHALL fail with an error when no mapping exists or the class cannot be instantiated.

#### Scenario: Document editor selection
- **GIVEN** a schema URI with no catalog mapping
- **WHEN** an editor is requested
- **THEN** an error is raised

### Requirement: Supplier order creation copies
Recovered from: SUPP-REQ-0002
The system SHALL, when a supplier purchase order is created, store a copy of the shipping contact information and one line item record per incoming line item, each created with an initial shipped quantity of 0.

#### Scenario: Supplier order creation copies
- **GIVEN** an incoming order with three lines
- **WHEN** a supplier order is created
- **THEN** the contact is copied and three line records exist with shipped quantity 0

### Requirement: Find supplier orders by status
Recovered from: SUPP-REQ-0003
The system SHALL allow supplier purchase orders to be found by status.

#### Scenario: Find supplier orders by status
- **GIVEN** orders in PENDING and COMPLETED status
- **WHEN** orders are searched by PENDING
- **THEN** only PENDING orders are returned

### Requirement: Supplier order record
ID: SWHM3-R-0014
Recovered from: SUPPLIER-FULFILLMENT-ENTITY-0001
The system SHALL record each supplier order with a unique identifier, date, status and a reference to an existing contact.

#### Scenario: Supplier order record
- **GIVEN** a supplier order
- **WHEN** it is recorded
- **THEN** it has a unique id, date, status and an existing contact

### Requirement: Supplier order line record
ID: SWHM3-R-0015
Recovered from: SUPPLIER-FULFILLMENT-ENTITY-0002
The system SHALL record supplier order lines uniquely per supplier order and line number, each with category, product, item, quantity, unit price and quantity shipped, and SHALL require each line to belong to an existing supplier order.

#### Scenario: Supplier order line record
- **GIVEN** a line for an unknown supplier order
- **WHEN** it is recorded
- **THEN** it is refused

### Requirement: Inventory record
Recovered from: SUPPLIER-FULFILLMENT-ENTITY-0011
The system SHALL keep one inventory record per item id holding an integer on-hand quantity.

#### Scenario: Inventory record
- **GIVEN** an item id
- **WHEN** inventory is recorded
- **THEN** one integer quantity exists for that item

### Requirement: Supplier order document
Recovered from: SUPPLIER-FULFILLMENT-REQ-0005
The system SHALL exchange supplier orders as documents containing order id, order date, shipping contact and at least one line item.

#### Scenario: Supplier order document
- **GIVEN** a supplier order document with no line items
- **WHEN** it is validated
- **THEN** it is rejected

### Requirement: Item without inventory record
Recovered from: SUPPLIER-FULFILLMENT-RULE-0003
GIVEN an item has no inventory record WHEN a purchase-order line for it is processed THEN the system SHALL treat the line as not available and leave it unshipped without raising an error.

#### Scenario: Item without inventory record
- **GIVEN** an item with no inventory record
- **WHEN** a line for it is processed
- **THEN** the line stays unshipped and no error is raised

### Requirement: Order completion
Recovered from: SUPPLIER-FULFILLMENT-RULE-0004
The system SHALL mark a supplier purchase order COMPLETED only when every one of its lines could be shipped in the current pass; otherwise it SHALL remain pending for later reprocessing.

#### Scenario: Order completion
- **GIVEN** an order whose second line lacks stock
- **WHEN** it is processed
- **THEN** the order remains PENDING

### Requirement: Inventory update entry rules
Recovered from: SUPPLIER-FULFILLMENT-RULE-0008
The system SHALL set an item's stock to the submitted new quantity only when the item's Update box is ticked, the quantity is non-empty and the quantity is zero or greater; other entries SHALL be ignored.

#### Scenario: Inventory update entry rules
- **GIVEN** an item with Update ticked and quantity -3
- **WHEN** the update is submitted
- **THEN** the entry is ignored and stock is unchanged

### Requirement: Line item copy
Recovered from: SUPPLIER-REQ-0002
GIVEN a line item is created from an existing line item and a shipped quantity, the system SHALL copy category, product, item, line number, quantity and unit price from the source and set quantity shipped to the supplied value.

#### Scenario: Line item copy
- **GIVEN** a source line and shipped quantity 2
- **WHEN** a new line is created from it
- **THEN** source fields are copied and shipped quantity is 2

### Requirement: Line item access
Recovered from: supplier-fulfillment-REQ-0004
The system SHALL permit any caller to use line item operations without a role check, and SHALL run each accessor within a transaction.

#### Scenario: Line item access
- **GIVEN** any caller
- **WHEN** a line item operation is invoked
- **THEN** it runs in a transaction with no role check

### Requirement: Supplier order XML document
ID: SWHM3-R-0018
Recovered from: SUPFUL-INT-0003
The system SHALL send each supplier order as a SupplierOrder XML document carrying order id, order date (yyyy-MM-dd), a shipping address (first name, last name, street, city, state, country, zip code, email, phone) and one or more line items.

#### Scenario: Supplier order XML document
- **GIVEN** an approved order
- **WHEN** the supplier order is sent
- **THEN** the document carries order id, date, full shipping address and at least one line

### Requirement: Messaging destinations
ID: SWHM3-R-0019
Recovered from: SUPFUL-REQ-0001
The system SHALL exchange messages through the destinations jms/opc/OrderQueue, jms/opc/OrderApprovalQueue, jms/opc/InvoiceTopic, jms/supplier/PurchaseOrderQueue and jms/opc/MailQueue, and SHALL validate SupplierOrder messages but not against XSD (neither SupplierOrder nor Invoice).

#### Scenario: Messaging destinations
- **GIVEN** a SupplierOrder message
- **WHEN** it is received
- **THEN** it is validated, but not against XSD

### Requirement: Supplier purchase order persistence
Recovered from: SUPP-ENT-0001
The system SHALL persist a supplier purchase order with a purchase order id, a purchase order date and a status.

#### Scenario: Supplier purchase order persistence
- **GIVEN** a supplier purchase order
- **WHEN** it is persisted
- **THEN** id, date and status are stored

### Requirement: Send supplier purchase order on approval
Recovered from: SUPPLIER-FULFILLMENT-WF-0001
The system SHALL, for each order newly set to APPROVED, build a supplier purchase order (order id, date, shipping name/address/email/telephone, and each line with category, product, item, line number, quantity, unit price) and send it to the supplier purchase-order queue; DENIED orders SHALL NOT be sent.

#### Scenario: Send supplier purchase order on approval
- **GIVEN** one APPROVED and one DENIED order
- **WHEN** approval processing completes
- **THEN** one supplier purchase order is sent for the approved order and none for the denied order, before the customer mail

### Requirement: Line item data object
Recovered from: supplier-fulfillment-REQ-0003
The system SHALL expose a line item as a data object containing category id, product id, item id, line number, quantity and unit price, and SHALL NOT include quantity shipped.

#### Scenario: Line item data object
- **GIVEN** a line item with shipped quantity 2
- **WHEN** its data object is requested
- **THEN** it carries the six fields and no shipped quantity

