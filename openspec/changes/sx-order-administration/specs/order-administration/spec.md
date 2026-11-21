## ADDED Requirements

### Requirement: Administrator-only access
ID: SWHM3-R-0207
Recovered from: ORDER-ADMIN-REQ-0001
The system SHALL restrict the admin entry point to authenticated users holding the "administrator" role, using a form-based sign-in.

#### Scenario: Non-administrator denied
- **GIVEN** a user without the administrator role
- **WHEN** the user requests the admin entry point
- **THEN** access is refused and the sign-in form is presented

#### Scenario: Administrator admitted
- **GIVEN** a user holding the administrator role
- **WHEN** the user signs in through the form
- **THEN** the admin home page is shown

### Requirement: Admin session expiry
ID: SWHM3-R-0111
Recovered from: ORDER-ADMIN-REQ-0002
The system SHALL expire an admin session after 54 minutes of inactivity, and when a data request arrives with no session it SHALL answer with an error telling the user the session timed out and to log in again.

#### Scenario: Idle session
- **GIVEN** an admin session idle for 54 minutes
- **WHEN** the client sends a data request
- **THEN** an error states the session timed out and the user must log in again

### Requirement: Admin home page actions
ID: SWHM3-R-0113
Recovered from: ORDER-ADMIN-WF-0003
The system SHALL let an administrator launch the order-management rich client from the admin home page and log out from the same page.

#### Scenario: Launch client
- **GIVEN** a signed-in administrator on the admin home page
- **WHEN** the administrator chooses to manage orders
- **THEN** a launch descriptor is returned that starts the client with the server, port and session id

#### Scenario: Log out
- **GIVEN** a signed-in administrator on the admin home page
- **WHEN** the administrator chooses to log out
- **THEN** the session ends and the logout page is shown

### Requirement: Order list by status display
ID: SWHM3-R-0109
Recovered from: ORD-APPR-REQ-0010
The administration client SHALL list orders by status, showing for each the order id, user id, order date (month/day/year), order value and status, and MUST present pending orders separately from approved, denied and completed ones.

#### Scenario: Orders of a status displayed
- **GIVEN** orders exist in PENDING, APPROVED, DENIED and COMPLETED status
- **WHEN** the administrator opens the order tool
- **THEN** each order is shown with id, user id, date as M/D/YYYY, value and status, pending ones in an editable view and the others read-only

#### Scenario: Refresh with uncommitted changes
- **GIVEN** an order marked approved or denied but not committed
- **WHEN** the administrator refreshes the data
- **THEN** a warning asks for confirmation before reloading

### Requirement: Orders listing by status for administrators
ID: SWHM3-R-0112
Recovered from: ORDER-ADMIN-REQ-0004
The system SHALL let an administrator list orders filtered by status (PENDING, APPROVED, DENIED, COMPLETED), showing order id, user id, date, amount and status for each, with the total count.

#### Scenario: Status filter
- **GIVEN** 3 PENDING orders
- **WHEN** the PENDING list is requested
- **THEN** a count of 3 and the 3 orders with id, user id, date, amount and status are returned

### Requirement: Find orders by exact status
ID: SWHM3-R-0017
Recovered from: ORDAPP-REQ-0003
The system SHALL return all orders whose current status exactly equals a supplied status value, for use by the administrator.

#### Scenario: Exact match
- **GIVEN** orders in several statuses
- **WHEN** orders with status PENDING are requested
- **THEN** only orders whose status equals PENDING are returned, without paging

### Requirement: Order list data for administration facade
ID: SWHM3-R-0206
Recovered from: ORD-APPR-REQ-0011
The system SHALL compute chart data for a date range as revenue (quantity times unit price) or quantity, grouped by category, or by item within one chosen category.

#### Scenario: Revenue by category
- **GIVEN** orders placed within a date range
- **WHEN** revenue is requested with no category
- **THEN** quantity times unit price is summed per category

#### Scenario: Quantity by item
- **GIVEN** orders placed within a date range
- **WHEN** quantity is requested for a chosen category
- **THEN** quantities are summed per item, counting only lines of that category

### Requirement: Sales charts
ID: SWHM3-R-0208
Recovered from: ORDER-ADMIN-REQ-0007
The system SHALL provide sales charts for a date range (mm/dd/yyyy), showing revenue and order quantity per category, or per item when a category is requested, with a total.

#### Scenario: Chart for a range
- **GIVEN** a start and end date in mm/dd/yyyy
- **WHEN** the REVENUE or ORDERS chart is requested
- **THEN** values per category and a total are returned

### Requirement: Client XML message contract
ID: SWHM3-R-0110
Recovered from: ORDER-ADMIN-INT-0008
The system SHALL exchange XML messages with the rich client, with request types GETORDERS, UPDATESTATUS, REVENUE and ORDERS, and SHALL answer an unknown type with an error response.

#### Scenario: Unknown type
- **GIVEN** a request whose Type is not one of the four
- **WHEN** it is processed
- **THEN** an Error response is returned
