## ADDED Requirements

### Requirement: Order status set and lifecycle
Recovered from: ORDAPP-RULE-0001
The system SHALL recognise the order statuses PENDING, APPROVED, DENIED, SHIPPED_PART and COMPLETED, with the lifecycle PENDING to APPROVED to SHIPPED_PART to COMPLETED, or PENDING to DENIED.

#### Scenario: Approved order ships in parts
- **GIVEN** an order in APPROVED status
- **WHEN** only some lines are shipped and later all are
- **THEN** the order moves to SHIPPED_PART and then COMPLETED

### Requirement: Pluggable transition step
Recovered from: ORDAPP-WF-0001
The system SHALL support a pluggable transition step, selected by class name at run time, that is instantiated on demand and wraps any instantiation failure in a transition error.

#### Scenario: Step class cannot be instantiated
- **GIVEN** a transition step configured with a class name that cannot be instantiated
- **WHEN** the step is requested
- **THEN** a transition error wrapping the failure is raised

### Requirement: Empty notice batch still forwarded
Recovered from: ORDA-RULE-0007
WHEN an order-approval message is processed and no order in it is PENDING, the system SHALL still forward an (empty) notice batch to customer relations and no supplier orders.

#### Scenario: No pending order in message
- **GIVEN** an order-approval message whose orders are all already decided
- **WHEN** it is processed
- **THEN** an empty notice batch is forwarded and no supplier order is sent

### Requirement: Storefront delegates approval
Recovered from: ORDAPP-DOC-0001
The system SHALL record that the storefront does not decide approval; it SHALL hand every order to the Order Processing Center, which approves automatically under the locale limit (US 500, JP 50000) and otherwise leaves it pending for an administrator.

#### Scenario: Order submitted by storefront
- **GIVEN** an order placed through the storefront
- **WHEN** it is submitted
- **THEN** it is handed to the Order Processing Center, which decides approval

### Requirement: Decisions apply only to pending orders
Recovered from: ORD-APPR-REQ-0004
The system SHALL apply an approval or denial decision only to an order currently in PENDING status and SHALL silently ignore a decision for an order in any other status.

#### Scenario: Late decision on a completed order
- **GIVEN** an order in COMPLETED status
- **WHEN** a denial decision arrives
- **THEN** the status is unchanged and no error is raised

### Requirement: Accepted decision updates status and queues notice
Recovered from: ORD-APPR-REQ-0005
The system SHALL, for each accepted decision, update the order status to the decided status (APPROVED or DENIED) and queue a customer notification for it.

#### Scenario: Pending order approved
- **GIVEN** an order in PENDING status
- **WHEN** an APPROVED decision is accepted
- **THEN** the status becomes APPROVED and a customer notice is queued

### Requirement: Automatic approval by locale limit
Recovered from: ORDAPP-REQ-0001
The system SHALL automatically approve an order whose total is under 500 for the en_US locale and under 50000 for the ja_JP locale, and SHALL leave other orders pending until manually approved or denied.

#### Scenario: Small US order
- **GIVEN** an en_US order with total 499.99
- **WHEN** it is received
- **THEN** it is approved automatically

#### Scenario: Large Japanese order
- **GIVEN** a ja_JP order with total 50000
- **WHEN** it is received
- **THEN** it remains PENDING

### Requirement: Administrator batch decisions
Recovered from: ORDER-ADMIN-REQ-0005
The system SHALL let an administrator change the status of pending orders to APPROVED or DENIED, in batches saved with one commit, and SHALL send the changes asynchronously to the order processing centre as an order-approval message.

#### Scenario: Batch of decisions
- **GIVEN** three pending orders
- **WHEN** an administrator approves two and denies one and saves
- **THEN** the changes are committed once and sent as an order-approval message

### Requirement: Pending admin approval threshold
Recovered from: ORDER-ADMIN-REQ-0006
The system SHALL treat orders as pending admin approval only when their total exceeds 500; orders under 500 are approved automatically.

#### Scenario: Order above 500
- **GIVEN** an order with total 600
- **WHEN** it is received
- **THEN** it awaits administrator approval

### Requirement: No automatic limit for other locales
Recovered from: ORDER-APPROVAL-BR-0002
GIVEN an order whose locale is neither US nor Japan (for example Chinese), WHEN it is received, THEN the system SHALL leave it PENDING regardless of total, because no automatic limit exists for that locale.

#### Scenario: Chinese-locale small order
- **GIVEN** a zh_CN order with total 10
- **WHEN** it is received
- **THEN** it remains PENDING

### Requirement: Single approval-state record per order
Recovered from: APP-ENT-0008
ID: SWHM3-R-0011
The system SHALL keep for each order a single approval-state record with a mandatory status.

#### Scenario: Status mandatory
- **GIVEN** an order
- **WHEN** an approval-state record is stored without a status
- **THEN** the record is rejected

### Requirement: Process-manager status values
Recovered from: APPROVAL-BR-0001
The system SHALL keep one process-manager record per order whose status is only ever PENDING, APPROVED, DENIED or COMPLETED.

#### Scenario: Partly shipped order
- **GIVEN** an approved order partly shipped
- **WHEN** its status is stored
- **THEN** the allowed status set must be reconciled with SHIPPED_PART (disputed)

### Requirement: Status update and not-found signal
Recovered from: ORDAPP-REQ-0002
The system SHALL update the status of an existing order's workflow record to a supplied value, and GIVEN no record exists for the order id WHEN a status update or status read is requested THEN the system SHALL signal that the order was not found.

#### Scenario: Unknown order
- **GIVEN** no record for order id X
- **WHEN** a status read is requested for X
- **THEN** an order-not-found signal is raised

### Requirement: OrderApproval document validation
Recovered from: ORDAPP-RULE-0002
GIVEN an incoming OrderApproval document WHEN it is parsed THEN the system SHALL validate it against the OrderApproval schema by default and SHALL reject documents whose root is not OrderApproval or whose Order lacks OrderId followed by OrderStatus.

#### Scenario: Wrong root element
- **GIVEN** a document whose root is not OrderApproval
- **WHEN** it is parsed
- **THEN** it is rejected

### Requirement: Order status listing
Recovered from: ORDER-APPROVAL-BUSINESS-RULE-0001
ID: SWHM3-R-0012
The system SHALL expose the status of each purchase order by joining the order with its order-manager status, listing order id, user, date, value and status, and only orders that have a matching order-manager record SHALL appear.

#### Scenario: Order without status record
- **GIVEN** an order with no order-manager record
- **WHEN** the status listing is read
- **THEN** that order does not appear

### Requirement: Auto-approved order emits approval message
Recovered from: ORDER-APPROVAL-WF-0001
The system SHALL, for an automatically approved order, emit an order-approval message for that order with status APPROVED to the same approval path used for manual approvals, and SHALL emit nothing when the order is not auto-approved.

#### Scenario: Order not auto-approved
- **GIVEN** an order left PENDING
- **WHEN** auto-approval is evaluated
- **THEN** no order-approval message is emitted

### Requirement: One workflow record per order
Recovered from: ORDAPP-ENT-0001
The system SHALL keep exactly one workflow record per order, identified by the order id, holding the order's current status as a text value.

#### Scenario: Duplicate record
- **GIVEN** an existing record for order X
- **WHEN** another record for X is created
- **THEN** it is refused

### Requirement: OrderApproval exchange document
Recovered from: ORDAPP-INT-0001
The system SHALL exchange order approval/denial results as an OrderApproval XML document containing one or more Order entries, each with an OrderId and an OrderStatus.

#### Scenario: Two orders in one document
- **GIVEN** a document with two Order entries
- **WHEN** it is parsed
- **THEN** both order ids and statuses are available
