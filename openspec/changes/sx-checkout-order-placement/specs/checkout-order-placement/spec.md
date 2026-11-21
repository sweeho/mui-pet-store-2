## ADDED Requirements

### Requirement: Order references contact and card
ID: SWHM3-R-0002
Recovered from: CHECKOUT-ORDER-PLACEMENT-ENTITY-0001
The system SHALL record each purchase order with a unique identifier, user, e-mail, date, locale and value, and SHALL require every order to reference an existing contact and an existing credit card.

#### Scenario: A purchase order with a contact and card
- **GIVEN** an order referencing a stored contact and a stored credit card
- **WHEN** the order is recorded
- **THEN** it is stored with its unique id, user, e-mail, date, locale and value

#### Scenario: Variant case
- **GIVEN** an order with no existing contact or credit card
- **WHEN** recording is attempted
- **THEN** it is rejected

### Requirement: Credit card mandatory fields
ID: SWHM3-R-0003
Recovered from: CHK-REQ-0006
The system SHALL require card number, card type and expiry date for every credit card record, with no database-level format or expiry validation.

#### Scenario: Card with all fields
- **GIVEN** a card with number, type and expiry date
- **WHEN** it is stored
- **THEN** it is accepted without format or expiry checks

#### Scenario: Variant case
- **GIVEN** a card missing its expiry date
- **WHEN** it is stored
- **THEN** it is rejected as incomplete

### Requirement: Address XML rejected when incomplete
Recovered from: CHK-BR-0005
GIVEN an Address XML document missing the street, city, state, postal code or country element, or whose root is not Address, WHEN it is read THEN the system SHALL reject it with an error.

#### Scenario: Address document missing Country
- **GIVEN** an Address XML document with no Country element
- **WHEN** it is read
- **THEN** it is rejected with an error even though the schema marks Country optional

#### Scenario: Variant case
- **GIVEN** a document whose root is not Address
- **WHEN** it is read
- **THEN** it is rejected with an error

### Requirement: Checkout step routing
Recovered from: CHK-BR-0010
The checkout flow SHALL route the shipping-information step to billing validation on result 1 and to a missing-form-data screen on result 2, and the billing step to shipping entry (1), billing re-display (2) or missing-form-data (3); order commit SHALL require sign-in.

#### Scenario: Shipping step outcomes
- **GIVEN** the shipping-information step finishes with result 1
- **WHEN** the flow continues
- **THEN** the customer goes to billing validation

#### Scenario: Variant case
- **GIVEN** the shipping step finishes with result 2
- **WHEN** the flow continues
- **THEN** the missing-form-data screen is shown

### Requirement: Card expiry defaults
Recovered from: CHECKOUT-BR-0004
GIVEN a card whose expiry date is missing or has no slash, WHEN the expiry month or year is requested, THEN the system SHALL return month "01" and year "2010" respectively.

#### Scenario: Expiry without slash
- **GIVEN** a card whose expiry date has no slash
- **WHEN** the expiry month and year are requested
- **THEN** month "01" and year "2010" are returned

#### Scenario: Variant case
- **GIVEN** a card with no expiry date
- **WHEN** the expiry month is requested
- **THEN** "01" is returned

### Requirement: Named integer counters
Recovered from: CHK-ENT-0010
The system SHALL maintain named integer counters, one per unique name, for generating identifiers.

#### Scenario: Counter uniqueness
- **GIVEN** two counters
- **WHEN** both are created with the same name
- **THEN** only one counter per name exists

#### Scenario: Variant case
- **GIVEN** a counter named for a prefix
- **WHEN** it is stored
- **THEN** it holds an integer value

### Requirement: Purge deletes order address
Recovered from: CHK-REQ-0001
The system SHALL delete a purchase order's address together with its order when a COMPLETED or DENIED order older than 180 days is purged.

#### Scenario: Old completed order purged
- **GIVEN** a COMPLETED order older than 180 days
- **WHEN** the purge runs
- **THEN** the order and its address are deleted

#### Scenario: Variant case
- **GIVEN** a DENIED order older than 180 days
- **WHEN** the purge runs
- **THEN** the order and its address are deleted

### Requirement: Order line quantity positive
Recovered from: CHECKOUT-BR-0001
The system SHALL reject an order line whose quantity is not greater than zero.

#### Scenario: Zero quantity
- **GIVEN** an order line with quantity 0
- **WHEN** it is recorded
- **THEN** it is rejected

#### Scenario: Variant case
- **GIVEN** an order line with quantity 2
- **WHEN** it is recorded
- **THEN** it is accepted

### Requirement: Expiry date month/year form
Recovered from: CHECKOUT-BR-0003
The system SHALL treat the expiry date as text in the form month/year, returning the part before the slash as the expiry month and the part after it as the expiry year.

#### Scenario: Expiry 10/2001
- **GIVEN** a card with expiry date "10/2001"
- **WHEN** month and year are requested
- **THEN** month "10" and year "2001" are returned

#### Scenario: Variant case
- **GIVEN** a card with expiry date "03/2030"
- **WHEN** the month is requested
- **THEN** "03" is returned

### Requirement: Purchase order and line persistence
Recovered from: CHECKOUT-ENT-0001
The system SHALL persist a purchase order with a unique order id, user id, e-mail, creation time in epoch milliseconds, locale, total value (12,2), a contact and a payment card, plus order lines keyed by (order id, line number) each carrying category, product, item, quantity, unit price and quantity shipped.

#### Scenario: Order with lines
- **GIVEN** a purchase order with two lines
- **WHEN** it is persisted
- **THEN** the lines are keyed by order id and line number

#### Scenario: Variant case
- **GIVEN** two lines with the same order id and line number
- **WHEN** they are persisted
- **THEN** the second is rejected

### Requirement: Placed order sent to OPC
Recovered from: CHECKOUT-INT-0004
The system SHALL send each placed order as an XML purchase-order message asynchronously to the Order Processing Center, and SHALL then empty the shopping cart and return the order id and bill-to e-mail to the customer.

#### Scenario: Order placed
- **GIVEN** a valid order is placed
- **WHEN** placement succeeds
- **THEN** an XML purchase-order message is sent asynchronously to the Order Processing Center

#### Scenario: Variant case
- **GIVEN** the message is sent
- **WHEN** the customer receives the response
- **THEN** the cart is empty and the order id and bill-to e-mail are returned

### Requirement: Payment card XML form
Recovered from: CHECKOUT-REQ-0002
The system SHALL exchange payment card data in XML documents containing CardNumber, CardType and ExpiryDate elements, in that order.

#### Scenario: Card document
- **GIVEN** a payment card
- **WHEN** it is written to XML
- **THEN** the document has CardNumber, CardType and ExpiryDate in that order

#### Scenario: Variant case
- **GIVEN** a card document
- **WHEN** it is read
- **THEN** elements are read in that order

### Requirement: Card record open to all callers
Recovered from: CHECKOUT-REQ-0006
The system SHALL allow any caller to use the card record without a role check.

#### Scenario: Unprivileged caller
- **GIVEN** a caller with no role
- **WHEN** it reads or changes a card record
- **THEN** the call is allowed

#### Scenario: Variant case
- **GIVEN** an anonymous caller
- **WHEN** it creates a card record
- **THEN** the call is allowed

### Requirement: Contact deletion removes address
Recovered from: CHK-BR-0002
The system SHALL delete a contact's address when the contact is deleted.

#### Scenario: Contact deleted
- **GIVEN** a contact with an address
- **WHEN** the contact is deleted
- **THEN** its address is deleted too

#### Scenario: Variant case
- **GIVEN** a contact
- **WHEN** it is deleted
- **THEN** no orphan address remains

### Requirement: Address record open to all callers
Recovered from: CHK-BRL-0005
The system SHALL allow any caller to create, read, update and remove addresses without a role check.

#### Scenario: Unprivileged address change
- **GIVEN** a caller with no role
- **WHEN** it creates or removes an address
- **THEN** the call is allowed

#### Scenario: Variant case
- **GIVEN** a caller with no role
- **WHEN** it reads an address
- **THEN** the call is allowed

### Requirement: Purchase order record
Recovered from: CHK-ENT-0001
The system SHALL persist a purchase order identified by a unique order id, holding user id, e-mail id, order date (epoch milliseconds), locale, and total value.

#### Scenario: Order stored
- **GIVEN** a new purchase order
- **WHEN** it is persisted
- **THEN** it holds order id, user id, e-mail id, order date in epoch milliseconds, locale and total value

#### Scenario: Variant case
- **GIVEN** two orders
- **WHEN** they are persisted
- **THEN** each has a distinct order id

### Requirement: Order line record
Recovered from: CHK-ENT-0007
The system SHALL record each purchase order line with a line number, category, product, item, quantity, unit price and quantity shipped, uniquely identified by order and line number and belonging to an existing purchase order.

#### Scenario: Line for missing order
- **GIVEN** a line referring to a nonexistent purchase order
- **WHEN** it is recorded
- **THEN** it is rejected

#### Scenario: Variant case
- **GIVEN** a line for an existing order
- **WHEN** it is recorded
- **THEN** it is identified by order and line number

### Requirement: Address and contact mandatory fields
Recovered from: CHK-REQ-0005
The system SHALL require street name 1, city, state, zip code and country for an address, and family name, given name, telephone and e-mail for contact information; street name 2 is optional.

#### Scenario: Address without second street
- **GIVEN** an address with street 1, city, state, zip and country
- **WHEN** it is stored without street 2
- **THEN** it is accepted

#### Scenario: Variant case
- **GIVEN** an address without a city
- **WHEN** it is stored
- **THEN** it is rejected

### Requirement: Purchase order document
Recovered from: CHKOUT-ENT-0003
The system SHALL represent a purchase order document with order id, user id, e-mail id, order date, shipping address, billing address, total price, credit card (number, expiry date, card type) and one or more line items, with a locale defaulting to en_US.

#### Scenario: Document without locale
- **GIVEN** a purchase order document with no locale
- **WHEN** it is read
- **THEN** the locale is en_US

#### Scenario: Variant case
- **GIVEN** a purchase order document with no line items
- **WHEN** it is read
- **THEN** it is not a valid document

### Requirement: First identifier for a prefix
Recovered from: CHECKOUT-ORDER-PLACEMENT-BR-0002
GIVEN no counter exists for a prefix WHEN an identifier is requested for it THEN the system SHALL create a counter for that prefix starting at 0 so that the first identifier issued uses the value 1.

#### Scenario: New prefix
- **GIVEN** no counter for prefix "PO"
- **WHEN** an identifier is requested
- **THEN** a counter starting at 0 is created and "PO1" is returned

#### Scenario: Variant case
- **GIVEN** a counter for the prefix now exists
- **WHEN** another identifier is requested
- **THEN** "PO2" is returned

### Requirement: Counter per prefix
Recovered from: CHECKOUT-ORDER-PLACEMENT-ENT-0003
The system SHALL persist one counter per identifier prefix, keyed by the prefix name and holding the last issued integer value.

#### Scenario: Counter state
- **GIVEN** identifiers issued up to 5 for a prefix
- **WHEN** the counter is read
- **THEN** it holds 5

#### Scenario: Variant case
- **GIVEN** two prefixes
- **WHEN** identifiers are issued
- **THEN** each has its own counter

### Requirement: Unique identifier per prefix
Recovered from: CHECKOUT-ORDER-PLACEMENT-REQ-0001
The system SHALL return, for a given identifier prefix, a unique identifier formed by the prefix concatenated with a per-prefix counter value that is incremented by one on each request.

#### Scenario: Sequential identifiers
- **GIVEN** a prefix with last value 7
- **WHEN** an identifier is requested
- **THEN** prefix followed by 8 is returned

#### Scenario: Variant case
- **GIVEN** two requests
- **WHEN** they are served in turn
- **THEN** the identifiers differ

### Requirement: Atomic identifier generation
Recovered from: CHECKOUT-ORDER-PLACEMENT-REQ-0004
The system SHALL generate each identifier inside a transaction so that the counter read, increment and store are committed together, and SHALL NOT restrict who may request an identifier.

#### Scenario: Concurrent requests
- **GIVEN** two concurrent requests for the same prefix
- **WHEN** both complete
- **THEN** they receive different identifiers

#### Scenario: Variant case
- **GIVEN** any caller
- **WHEN** it requests an identifier
- **THEN** no role is required

### Requirement: Single resource lookup service
Recovered from: CHECKOUT-REQ-0001
The system SHALL resolve named infrastructure resources (local and remote EJB homes, JMS queue and topic connection factories, queues, topics, data sources, URL / boolean / string environment entries) through a single lookup service that wraps the naming directory.

#### Scenario: Resource requested
- **GIVEN** a named resource
- **WHEN** a component needs it
- **THEN** it is resolved through the lookup service

#### Scenario: Variant case
- **GIVEN** an environment entry
- **WHEN** it is requested
- **THEN** it is resolved through the same service

### Requirement: EJB-tier lookup uncached
Recovered from: CHECKOUT-REQ-0003
GIVEN the EJB-tier lookup service WHEN a resource is requested THEN the system SHALL perform a fresh naming lookup on every call, with a new instance created by the caller and no caching.

#### Scenario: Repeated lookup
- **GIVEN** the EJB-tier lookup service
- **WHEN** the same resource is requested twice
- **THEN** two naming lookups are performed

#### Scenario: Variant case
- **GIVEN** a caller
- **WHEN** it needs the service
- **THEN** it creates its own instance

### Requirement: Web locator init failure
Recovered from: CHECKOUT-REQ-0004
GIVEN the web locator fails to initialise at class load WHEN the failure occurs THEN the system SHALL print it to standard error and leave getInstance returning null.

#### Scenario: Init failure
- **GIVEN** the web locator fails during class load
- **WHEN** the failure occurs
- **THEN** it is printed to standard error

#### Scenario: Variant case
- **GIVEN** the failure has occurred
- **WHEN** getInstance is called
- **THEN** null is returned

### Requirement: Web-tier environment entries uncached
Recovered from: CHECKOUT-REQ-0005
GIVEN the web-tier lookup service WHEN a URL, boolean or string environment entry is requested THEN the system SHALL read it from the naming directory on every call without caching.

#### Scenario: Repeated entry
- **GIVEN** a string environment entry
- **WHEN** it is requested twice
- **THEN** the naming directory is read both times

#### Scenario: Variant case
- **GIVEN** a URL entry
- **WHEN** it is requested
- **THEN** it is read from the naming directory

### Requirement: Contact creation creates address
Recovered from: CHK-BR-0001
The system SHALL create the contact's address record together with the contact record, either copying the supplied address data or creating an empty address.

#### Scenario: Contact with address data
- **GIVEN** contact data with address data
- **WHEN** the contact is created
- **THEN** a new address copied from it is created

#### Scenario: Variant case
- **GIVEN** contact data with no address
- **WHEN** the contact is created
- **THEN** an empty address is created

### Requirement: Order deletion cascades
Recovered from: CHK-BR-0003
WHEN a purchase order is deleted, the system SHALL also delete its contact information, address, credit card and line items.

#### Scenario: Order deleted
- **GIVEN** a purchase order with contact, card and lines
- **WHEN** it is deleted
- **THEN** its contact, address, card and lines are deleted

#### Scenario: Variant case
- **GIVEN** an order
- **WHEN** it is deleted
- **THEN** no dependent record remains

### Requirement: Optional second street omitted in XML
Recovered from: CHK-BR-0004
GIVEN an address whose second street line is null or empty WHEN it is written to XML THEN the system SHALL omit the second street element.

#### Scenario: Empty second line
- **GIVEN** an address with an empty second street
- **WHEN** it is written to XML
- **THEN** only one StreetName element appears

#### Scenario: Variant case
- **GIVEN** an address with a second street
- **WHEN** it is written to XML
- **THEN** two StreetName elements appear

### Requirement: Contact XML form
Recovered from: CHK-INT-0001
The system SHALL exchange contact information in an XML form consisting of family name, given name, address, e-mail and phone, in that order.

#### Scenario: Contact document
- **GIVEN** a contact
- **WHEN** it is written to XML
- **THEN** elements are family name, given name, address, e-mail, phone in order

#### Scenario: Variant case
- **GIVEN** a contact document
- **WHEN** it is read
- **THEN** fields are read in that order

### Requirement: Order creation attaches parts
Recovered from: CHK-REQ-0002
WHEN a purchase order is created, the system SHALL also create and attach its contact (shipping) information, its credit card record, and one line item per order line, and SHALL fail the creation if a required lookup fails.

#### Scenario: Order with 3 lines
- **GIVEN** an order with 3 lines
- **WHEN** it is created
- **THEN** a contact, a card and 3 line items are attached

#### Scenario: Variant case
- **GIVEN** a required lookup fails
- **WHEN** the order is created
- **THEN** creation fails

### Requirement: Stored address as data object
Recovered from: CHK-REQ-0003
The system SHALL return a stored address as a plain data object containing all six fields.

#### Scenario: Address read
- **GIVEN** a stored address
- **WHEN** it is requested as data
- **THEN** a plain object with six fields is returned

#### Scenario: Variant case
- **GIVEN** an address with no second street
- **WHEN** it is requested
- **THEN** the second street field is empty

### Requirement: Order documents checked for well-formedness only
Recovered from: CHKORD-REQ-0001
The system SHALL validate PurchaseOrder, Invoice and OrderApproval XML documents for well-formedness, and SHALL NOT validate them against XSD schemas.

#### Scenario: Malformed document
- **GIVEN** a malformed PurchaseOrder document
- **WHEN** it is validated
- **THEN** it is rejected

#### Scenario: Variant case
- **GIVEN** a well-formed document that violates the schema
- **WHEN** it is validated
- **THEN** it is accepted

### Requirement: Identifiers from persistent counter
Recovered from: FULFILL-ENT-0002
The system SHALL generate order and purchase-order identifiers from a named persistent counter (name unique, integer value).

#### Scenario: Order id generation
- **GIVEN** a new order
- **WHEN** its id is generated
- **THEN** it comes from a named persistent counter

#### Scenario: Variant case
- **GIVEN** the process restarts
- **WHEN** the next id is generated
- **THEN** it continues from the stored value

### Requirement: Received order persisted as PENDING
Recovered from: ORD-APPR-REQ-0003
The system SHALL, on receiving an order message from the storefront, persist the purchase order and register it with the process manager in PENDING status before any approval decision.

#### Scenario: Order message received
- **GIVEN** an order message from the storefront
- **WHEN** it is received
- **THEN** the order is persisted and registered as PENDING

#### Scenario: Variant case
- **GIVEN** an order not yet decided
- **WHEN** status is read
- **THEN** it is PENDING

