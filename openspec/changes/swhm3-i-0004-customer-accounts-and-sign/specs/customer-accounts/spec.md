## ADDED Requirements

### Requirement: Customer listing
ID: SWHM3-R-0183
Recovered from: CUSTOMER-ACCOUNTS-REQUIREMENT-0008
The system SHALL allow all customers to be listed.

#### Scenario: Behaviour holds
ID: SWHM3-R-0183.01
- **GIVEN** customers exist
- **WHEN** the list is requested
- **THEN** all customers are returned

### Requirement: Sign-in routing and error screens
ID: SWHM3-R-0181
Recovered from: CUSTOMER-ACCOUNTS-RULE-0007
The system SHALL route pages marked as requiring sign-in only to signed-in customers, and SHALL map sign-in failure, duplicate account and general failure exceptions to the SIGN_IN_ERROR, DUPLICATE_ACCOUNT and ERROR screens.

#### Scenario: Behaviour holds
ID: SWHM3-R-0181.01
- **GIVEN** a visitor who is not signed in
- **WHEN** a page marked as requiring sign-in is requested
- **THEN** the visitor is not shown the page and a sign-in failure is shown on the SIGN_IN_ERROR screen

### Requirement: Sign-up from sign-in page
ID: SWHM3-R-0190
Recovered from: ACCT-REQ-0003
The system SHALL let a new visitor sign up for an account from the sign-in page.

#### Scenario: Behaviour holds
ID: SWHM3-R-0190.01
- **GIVEN** a visitor on the sign-in page
- **WHEN** the visitor chooses to sign up
- **THEN** the account creation flow is offered

### Requirement: Profile mandatory fields
ID: SWHM3-R-0195
Recovered from: CUST-REQ-0006
The system SHALL require, for profile create/update, a non-blank last name, first name, street, city, state or province, postal code and telephone, plus language and favorite category.

#### Scenario: Behaviour holds
ID: SWHM3-R-0195.01
- **GIVEN** a profile form with a blank postal code
- **WHEN** the profile is saved
- **THEN** the save is refused and the missing field is reported

### Requirement: Signed-on session ends after 15 minutes
ID: SWHM3-R-0182
Recovered from: CUST-RULE-0001
The system SHALL end a customer's signed-on session after 15 minutes.

#### Scenario: Behaviour holds
ID: SWHM3-R-0182.01
- **GIVEN** a signed-on customer idle for 15 minutes
- **WHEN** the next request arrives
- **THEN** the session has ended and sign-on is required

### Requirement: Inactive sign-on timeout and username cookie
ID: SWHM3-R-0196
Recovered from: CUSTAC-REQ-0001
The system SHALL end an inactive customer sign-on session after 15 minutes and SHALL remember the username in a cookie named bp_signon.

#### Scenario: Behaviour holds
ID: SWHM3-R-0196.01
- **GIVEN** a customer who chose to be remembered
- **WHEN** sign-on completes
- **THEN** the username is held in a cookie named bp_signon

### Requirement: Account status
ID: SWHM3-R-0199
Recovered from: CUSTOMER-ACCOUNTS-ENTITY-0003
The system SHALL hold an account status for each customer, with the values "active" and "disabled".

#### Scenario: Behaviour holds
ID: SWHM3-R-0199.01
- **GIVEN** an account
- **WHEN** its status is stored
- **THEN** the status is either active or disabled

### Requirement: Web session expiry after 30 minutes
ID: SWHM3-R-0202
Recovered from: CUSTOMER-ACCOUNTS-RULE-0006
The system SHALL expire an inactive web session after 30 minutes.

#### Scenario: Behaviour holds
ID: SWHM3-R-0202.01
- **GIVEN** a web session with no activity for 30 minutes
- **WHEN** a further request arrives
- **THEN** the session is expired

### Requirement: Customer composition
ID: SWHM3-R-0184
Recovered from: ACC-ENT-0001
The system SHALL hold a customer as a user identified by user id that links to one sign-on user, one account and one profile, with all three present.

#### Scenario: Behaviour holds
ID: SWHM3-R-0184.01
- **GIVEN** a customer
- **WHEN** the customer is stored
- **THEN** it links to one sign-on user, one account and one profile

### Requirement: Account composition
ID: SWHM3-R-0185
Recovered from: ACC-ENT-0002
The system SHALL hold an account with a mandatory status, exactly one contact record and exactly one credit card record.

#### Scenario: Behaviour holds
ID: SWHM3-R-0185.01
- **GIVEN** an account without a status
- **WHEN** it is stored
- **THEN** it is refused because status is mandatory

### Requirement: Unique sign-on record per user name
ID: SWHM3-R-0186
Recovered from: ACCOUNTS-BR-0001
The system SHALL allow only one sign-on record per user name (user name is the unique key, max 50 characters, password max 50 characters, both mandatory).

#### Scenario: Behaviour holds
ID: SWHM3-R-0186.01
- **GIVEN** a sign-on record exists for user name "j2ee"
- **WHEN** another record with user name "j2ee" is created
- **THEN** creation is refused

### Requirement: Plain-text credential and card storage (legacy)
ID: SWHM3-R-0187
Recovered from: ACCOUNTS-BR-0002
The system SHALL store the sign-on password as plain text and the payment card number in clear text.

#### Scenario: Behaviour holds
ID: SWHM3-R-0187.01
- **GIVEN** a new sign-on password
- **WHEN** it is stored
- **THEN** it is held unhashed, as the legacy system does; this is flagged as a defect for the Business Owner

### Requirement: Customer record structure
ID: SWHM3-R-0188
Recovered from: ACCOUNTS-ENT-0001
The system SHALL store a customer as a unique user name linked one-to-one to a sign-on credential, an account (status, contact information, payment card) and a profile (preferred language, optional favorite category, my-list preference, banner preference).

#### Scenario: Behaviour holds
ID: SWHM3-R-0188.01
- **GIVEN** a customer
- **WHEN** it is stored
- **THEN** each linked part exists exactly once

### Requirement: Contact information mandatory fields
ID: SWHM3-R-0189
Recovered from: ACCOUNTS-ENT-0002
The system SHALL record contact information (family name, given name, telephone, e-mail, address) with all of those fields mandatory, and an address with street line 1, city, state, zip code and country mandatory and street line 2 optional.

#### Scenario: Behaviour holds
ID: SWHM3-R-0189.01
- **GIVEN** contact information without an e-mail
- **WHEN** it is stored
- **THEN** it is refused

### Requirement: Sign-on required for customer pages
ID: SWHM3-R-0191
Recovered from: CUST-REQ-0001
The system SHALL require sign-on for the customer screen, the customer action, the enter-order-information screen and the sign-on welcome screen, and SHALL redirect unauthenticated requests to the sign-on form, showing the sign-on error page when sign-on fails.

#### Scenario: Behaviour holds
ID: SWHM3-R-0191.01
- **GIVEN** an unauthenticated request for the customer screen
- **WHEN** it is received
- **THEN** the sign-on form is presented

### Requirement: Sign-on required before profile and order entry
ID: SWHM3-R-0192
Recovered from: CUST-REQ-0002
The system SHALL require sign-on before the customer profile screen, the customer update action, the enter-order-information screen and the sign-on welcome screen can be used.

#### Scenario: Behaviour holds
ID: SWHM3-R-0192.01
- **GIVEN** a visitor who is not signed on
- **WHEN** the profile screen is requested
- **THEN** sign-on is required first

### Requirement: Sign-on outcome handling
ID: SWHM3-R-0193
Recovered from: CUST-REQ-0003
GIVEN authentication succeeds WHEN sign-on is processed THEN the system SHALL record the user name and a signed-on flag in the session and redirect to the originally requested URL; GIVEN it fails THEN the system SHALL redirect to the configured sign-on error page.

#### Scenario: Behaviour holds
ID: SWHM3-R-0193.01
- **GIVEN** valid credentials
- **WHEN** sign-on is processed
- **THEN** the user name and signed-on flag are in the session and the customer is redirected to the originally requested URL

### Requirement: Profile storage on create/update
ID: SWHM3-R-0194
Recovered from: CUST-REQ-0005
The system SHALL, when a customer creates or updates their profile, store contact name, phone, e-mail, address, payment card (number, type, expiry month/year) and profile preferences (preferred language, favorite category, my-list on/off, banners on/off), and SHALL switch the session locale to the preferred language.

#### Scenario: Behaviour holds
ID: SWHM3-R-0194.01
- **GIVEN** a customer saving a profile with preferred language de_DE
- **WHEN** the save succeeds
- **THEN** all contact, card and preference data are stored and the session locale becomes de_DE

### Requirement: Account contact info and credit card
ID: SWHM3-R-0197
Recovered from: CUSTACC-ENT-0004
The system SHALL store for each account a contact info (given name, family name, telephone, e-mail, address) and a credit card (type, number, expiry).

#### Scenario: Behaviour holds
ID: SWHM3-R-0197.01
- **GIVEN** an account
- **WHEN** it is stored
- **THEN** it holds one contact info and one credit card

### Requirement: Sign-on user
ID: SWHM3-R-0198
Recovered from: CUSTOMER-ACCOUNTS-ENT-0001
The system SHALL hold a sign-on user as a unique user name (primary key) and a password.

#### Scenario: Behaviour holds
ID: SWHM3-R-0198.01
- **GIVEN** a sign-on user
- **WHEN** it is stored
- **THEN** user name is unique

### Requirement: Sign-on credential
ID: SWHM3-R-0004
Recovered from: CUSTOMER-ACCOUNTS-ENTITY-0001
The system SHALL store one sign-on credential per username, with a mandatory username (max 50 chars) as unique key and a mandatory password (max 50 chars).

#### Scenario: Behaviour holds
ID: SWHM3-R-0004.01
- **GIVEN** a credential without a password
- **WHEN** it is stored
- **THEN** it is refused

### Requirement: Authentication by exact password match
ID: SWHM3-R-0200
Recovered from: CUSTOMER-ACCOUNTS-REQ-0001
The system SHALL authenticate a user by looking up the account by user name and comparing the supplied password to the stored password by exact string equality; an unknown user name SHALL yield a failed authentication.

#### Scenario: Behaviour holds
ID: SWHM3-R-0200.01
- **GIVEN** an unknown user name
- **WHEN** authentication is attempted
- **THEN** authentication fails

### Requirement: Return to requested page after sign-on
ID: SWHM3-R-0201
Recovered from: CUSTOMER-ACCOUNTS-REQ-0004
GIVEN a user is not signed on WHEN they request a protected resource listed in the sign-on configuration THEN the system SHALL remember the requested URL and present the sign-on page; after successful sign-on it SHALL redirect to the remembered URL, and after failed sign-on to the configured error page.

#### Scenario: Behaviour holds
ID: SWHM3-R-0201.01
- **GIVEN** an unsigned user requesting a protected URL
- **WHEN** the user signs on successfully
- **THEN** the user is redirected to the remembered URL

### Requirement: Account linkage
ID: SWHM3-R-0009
Recovered from: ACC-ENT-0004
The system SHALL store a customer account as linked to exactly one contact record and one credit card record, with a status, and a customer.

#### Scenario: Behaviour holds
ID: SWHM3-R-0009.01
- **GIVEN** an account
- **WHEN** it is stored
- **THEN** it is linked to exactly one contact record and one credit card record and has a status

### Requirement: Sign-off discards session
ID: SWHM3-R-0072
Recovered from: CUST-REQ-0004
The system SHALL, on sign-off, discard the whole session (including cart and customer state), start a new session that keeps only the chosen locale, and show the sign-off screen.

#### Scenario: Behaviour holds
ID: SWHM3-R-0072.01
- **GIVEN** a signed-on customer with a cart
- **WHEN** the customer signs off
- **THEN** the old session is discarded, a new session keeps only the locale, and the sign-off screen is shown

### Requirement: Locale set at sign-on
ID: SWHM3-R-0073
Recovered from: CUST-REQ-0007
The system SHALL, on sign-on, set the session locale and cart locale to the customer's preferred language, and SHALL tolerate a missing customer record (first-time creation).

#### Scenario: Behaviour holds
ID: SWHM3-R-0073.01
- **GIVEN** a customer whose preferred language is ja_JP
- **WHEN** sign-on completes
- **THEN** session and cart locale are ja_JP; a missing customer record raises no error

### Requirement: Profile defaults (entity)
ID: SWHM3-R-0074
Recovered from: CUSTACC-ENT-0003
The system SHALL default a new profile to preferred language en_US, no favorite category, my-list enabled and banner enabled.

#### Scenario: Behaviour holds
ID: SWHM3-R-0074.01
- **GIVEN** a new profile
- **WHEN** it is created without values
- **THEN** it has en_US, no favorite category, my-list and banner enabled

### Requirement: Customer creation creates account and profile
ID: SWHM3-R-0075
Recovered from: CUSTOMER-ACCOUNTS-BUSINESS-RULE-0002
GIVEN a new customer is created, WHEN creation completes, THEN the system SHALL also create an account with status "active" and a profile.

#### Scenario: Behaviour holds
ID: SWHM3-R-0075.01
- **GIVEN** a new customer
- **WHEN** creation completes
- **THEN** an active account and a profile exist

### Requirement: Empty contact and card on account creation
ID: SWHM3-R-0076
Recovered from: CUSTOMER-ACCOUNTS-BUSINESS-RULE-0004
GIVEN an account is created without explicit contact or card details, WHEN creation completes, THEN the system SHALL attach a new empty contact-info and a new empty credit-card record.

#### Scenario: Behaviour holds
ID: SWHM3-R-0076.01
- **GIVEN** an account created without contact or card details
- **WHEN** creation completes
- **THEN** an empty contact-info and an empty credit-card record are attached

### Requirement: Profile defaults
ID: SWHM3-R-0077
Recovered from: CUSTOMER-ACCOUNTS-BUSINESS-RULE-0006
The system SHALL default a new profile to preferred language "en_US", no favorite category, my-list enabled and banner enabled.

#### Scenario: Behaviour holds
ID: SWHM3-R-0077.01
- **GIVEN** a new profile
- **WHEN** it is created
- **THEN** it has en_US, no favorite category, my-list and banner enabled

### Requirement: One-to-one customer relationships
ID: SWHM3-R-0078
Recovered from: CUSTOMER-ACCOUNTS-BUSINESS-RULE-0007
The system SHALL give each customer exactly one account and one profile, and each account exactly one contact-info and one credit-card record.

#### Scenario: Behaviour holds
ID: SWHM3-R-0078.01
- **GIVEN** a customer
- **WHEN** it is stored
- **THEN** it has exactly one account and one profile, and the account has one contact-info and one credit-card

### Requirement: Profile record
ID: SWHM3-R-0010
Recovered from: CUSTOMER-ACCOUNTS-ENTITY-0002
The system SHALL store one profile per profile identifier, with mandatory preferred language, mandatory my-list preference flag and mandatory banner preference flag.

#### Scenario: Behaviour holds
ID: SWHM3-R-0010.01
- **GIVEN** a profile without a preferred language
- **WHEN** it is stored
- **THEN** it is refused

### Requirement: Profile preferences
ID: SWHM3-R-0079
Recovered from: CUSTOMER-ACCOUNTS-ENTITY-0005
The system SHALL keep a profile per customer holding preferred language, favorite category, a "my list" display preference and a banner display preference.

#### Scenario: Behaviour holds
ID: SWHM3-R-0079.01
- **GIVEN** a customer
- **WHEN** a profile is stored
- **THEN** it holds those four preferences

### Requirement: User creation limits
ID: SWHM3-R-0080
Recovered from: CUSTOMER-ACCOUNTS-REQ-0002
The system SHALL reject creation of a user whose user name is longer than 25 characters or whose password exceeds the maximum password length.

#### Scenario: Behaviour holds
ID: SWHM3-R-0080.01
- **GIVEN** a user name of 26 characters
- **WHEN** creation is requested
- **THEN** creation is rejected

### Requirement: User creation outcome redirect
ID: SWHM3-R-0081
Recovered from: CUSTOMER-ACCOUNTS-REQ-0003
GIVEN a user creation request is refused WHEN the create fails THEN the system SHALL redirect the caller to the user creation error page; otherwise it SHALL redirect to the target page.

#### Scenario: Behaviour holds
ID: SWHM3-R-0081.01
- **GIVEN** a refused creation
- **WHEN** the create fails
- **THEN** the caller is redirected to the user creation error page

### Requirement: Remember user name cookie
ID: SWHM3-R-0082
Recovered from: CUSTOMER-ACCOUNTS-REQ-0005
WHEN the user ticks "remember user name" at sign-on THEN the system SHALL store the user name in a cookie lasting 2678400 seconds (31 days); otherwise it SHALL expire any existing such cookie.

#### Scenario: Behaviour holds
ID: SWHM3-R-0082.01
- **GIVEN** the box is ticked
- **WHEN** sign-on completes
- **THEN** a cookie holds the user name for 2678400 seconds
