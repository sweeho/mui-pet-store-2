## ADDED Requirements

### Requirement: Order-status mail enablement
Recovered from: NOTIF-RULE-0003

The system SHALL send order-status e-mails only when notifications have been enabled by an administrator, and notifications SHALL be disabled by default.

#### Scenario: Notifications not enabled
- **GIVEN** an administrator has not enabled notifications
- **WHEN** an order changes status
- **THEN** no order-status e-mail is sent

#### Scenario: Notifications enabled
- **GIVEN** an administrator has enabled notifications
- **WHEN** an order changes status
- **THEN** the order-status e-mail is sent

### Requirement: Notification addressing and subjects
Recovered from: CUSTN-RULE-0002

The system SHALL address each notification to the e-mail on the purchase order, with subject "Java Pet Store Order Status: <orderId>" for approval/denial, "Java Pet Store Order Shipped: <orderId>" for shipment and "Java Pet Store Order COMPLETED: <orderId>" for completion, and a body rendered by a locale-specific stylesheet.

#### Scenario: Completion e-mail
- **GIVEN** order 123 with e-mail a@b.com is completed
- **WHEN** the completion notification is sent
- **THEN** it is addressed to a@b.com with subject "Java Pet Store Order COMPLETED: 123"

#### Scenario: Locale stylesheet missing
- **GIVEN** an order whose locale has no stylesheet
- **WHEN** the notification body is rendered
- **THEN** rendering fails and the message fails

### Requirement: Shipped mail switches off by default
Recovered from: CUSTNO-REQ-0001

The system SHALL NOT send confirmation, approval or completed-order e-mails while the corresponding mail switches are false, and all three SHALL be false in the shipped configuration.

#### Scenario: Default configuration
- **GIVEN** the shipped configuration
- **WHEN** an order is confirmed, approved or completed
- **THEN** no e-mail is sent for any of the three

### Requirement: Outgoing e-mail document
Recovered from: CUSTNOT-ENT-0007

The system SHALL represent an outgoing e-mail document as an address, a subject and a content body.

#### Scenario: Document composed
- **GIVEN** a customer e-mail to be sent
- **WHEN** the document is built
- **THEN** it carries an address, a subject and a content body

### Requirement: Send within caller's transaction
Recovered from: CUSTNOTIF-BR-0003

The system SHALL send each queued message within a transaction that joins the caller's transaction, so the message is only released if the caller's work commits.

#### Scenario: Caller rolls back
- **GIVEN** a caller has submitted a message in its transaction
- **WHEN** the caller's transaction rolls back
- **THEN** the message is not released to the queue

#### Scenario: Caller commits
- **GIVEN** a caller has submitted a message in its transaction
- **WHEN** the caller's transaction commits
- **THEN** the message is released to the queue

### Requirement: Unrestricted internal send
Recovered from: CUSTNOTIF-REQ-0004

The system SHALL allow the send operation to be called by any caller inside the application without a role check.

#### Scenario: Caller without role
- **GIVEN** an internal caller holding no particular role
- **WHEN** it submits a message
- **THEN** the message is accepted

### Requirement: Enqueue failure reporting
Recovered from: NOTIF-BR-0001

The system SHALL report failure to the caller as an error rather than silently dropping the message when the queue cannot be reached or the message cannot be sent, and SHALL always close the queue connection.

#### Scenario: Queue unreachable
- **GIVEN** the queue cannot be reached
- **WHEN** a caller submits a message
- **THEN** an error is raised to the caller and the connection is closed

### Requirement: Mail request structure
Recovered from: NOTIF-ENT-0001

The system SHALL represent a mail request as exactly three elements in order: Address, Subject, Content, all text.

#### Scenario: Out-of-order request
- **GIVEN** a mail request with Subject before Address
- **WHEN** it is parsed
- **THEN** it is rejected as not valid

### Requirement: HTML mail delivery
Recovered from: NOTIF-REQ-0001

The system SHALL send each e-mail as HTML content to the recipients parsed from the address field (non-strict parsing), with the subject as given, a sender address defaulted from the mail session configuration, a sent-date of the current time and an X-Mailer header of "JavaMailer".

#### Scenario: Mail sent
- **GIVEN** a mail request with address, subject and HTML content
- **WHEN** it is processed
- **THEN** an HTML e-mail is sent to the parsed recipients with the configured sender, current sent date and X-Mailer "JavaMailer"

### Requirement: Undeliverable mail discarded
Recovered from: NOTIF-RULE-0001

The system SHALL discard the request without retry and without failing the surrounding transaction when the mail cannot be sent (no mail server configured or delivery failure).

#### Scenario: No mail server
- **GIVEN** no mail server is configured
- **WHEN** a mail request is processed
- **THEN** the request is discarded, not retried, and order processing is unaffected

### Requirement: Malformed message rollback
Recovered from: NOTIF-RULE-0002

The system SHALL raise a system error so the message is rolled back and redelivered when a queued message is not readable as a text message or is not valid Mail XML.

#### Scenario: Invalid XML
- **GIVEN** a queued message that is not valid Mail XML
- **WHEN** it is processed
- **THEN** a system error is raised and the message is rolled back for redelivery

### Requirement: Locale-specific e-mail rendering
Recovered from: ORD-APPR-REQ-0009

The system SHALL render each customer e-mail from the order's stored locale using a locale-specific style sheet (default, en_US, ja_JP, zh_CN), with a subject made of a fixed prefix and the order id, addressed to the e-mail on the order.

#### Scenario: Japanese order
- **GIVEN** an order whose stored locale is ja_JP
- **WHEN** its e-mail is rendered
- **THEN** the ja_JP style sheet is used and the subject carries the prefix and order id

### Requirement: Queue hand-off of text messages
Recovered from: NOTIF-INT-0001

The system SHALL accept a text message from a caller and publish it as a single text message onto a configured asynchronous queue, so that the message is processed later by a separate consumer.

#### Scenario: Message queued
- **GIVEN** a caller with a text message
- **WHEN** it submits the message
- **THEN** one text message is placed on the configured queue and the caller is not kept waiting for processing

### Requirement: Mail consumption from queue
Recovered from: NOTIF-WF-0001

The system SHALL consume each mail request from a queue as an XML message containing an address, a subject and a content body, and send one e-mail per message.

#### Scenario: One message, one e-mail
- **GIVEN** a valid mail request on the queue
- **WHEN** it is consumed
- **THEN** exactly one e-mail is sent
