# Legacy implementation notes: customer accounts

## User interface
No screen records were extracted for this capability; its user interface is unspecified. The sign-on, sign-up and profile pages exist in the legacy source but are not specified here.

## Legacy implementation
- Sign-on: a filter holds the protected-URL list from the sign-on configuration, remembers the requested URL, and redirects after authentication (see `legacy-source/app/src/components/signon`).
- User creation: CreateUserServlet calls the SignOn EJB createUser; the user name is the primary key so duplicates fail with CreateException and redirect to the user creation error page. The servlet writes the user name and password to standard output (legacy defect).
- Profile: CustomerHTMLAction.extractContactInfo accumulates missing address fields; the missing-list for language, favorite category and card fields is built and never used, so only address fields are effectively enforced.
- Session: the repository has two timeouts, 15 minutes (sign-on) and 30 minutes (web session). Which governs in production is unresolved.
- Data: sign-on, account, contact info, credit card and profile tables are linked one-to-one per customer. Passwords and card numbers are stored unhashed.
- Contradictions to settle: user name limit is 25 characters in user creation but 50 in the schema; user ID containing '%' or '*' is rejected in one pass but not in the requirement text above.
