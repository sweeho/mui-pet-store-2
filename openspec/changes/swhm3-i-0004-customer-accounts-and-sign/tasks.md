## 1. Data model

- [ ] 1.1 Define the sign-on credential (unique user name, mandatory password, max 50 chars)
- [ ] 1.2 Define the customer with its one-to-one account and profile
- [ ] 1.3 Define the account with status (active, disabled), contact info and credit card
- [ ] 1.4 Define contact info and address with mandatory fields
- [ ] 1.5 Define the profile with preferences and defaults

## 2. Sign-on and sign-off

- [ ] 2.1 Implement authentication by user name and password
- [ ] 2.2 Implement protected-page redirect and return to the requested URL
- [ ] 2.3 Implement sign-on error handling and screen mapping
- [ ] 2.4 Implement the remember-user-name cookie
- [ ] 2.5 Implement sign-off discarding the session and keeping the locale
- [ ] 2.6 Implement session timeouts after resolving 15 vs 30 minutes

## 3. Customer management

- [ ] 3.1 Implement user creation with length rules and error redirect
- [ ] 3.2 Implement creation of account and profile with defaults for a new customer
- [ ] 3.3 Implement profile create/update with validation and storage
- [ ] 3.4 Set session and cart locale from the preferred language at sign-on
- [ ] 3.5 Implement customer listing
- [ ] 3.6 Resolve the plain-text password and card storage defect with the Business Owner
