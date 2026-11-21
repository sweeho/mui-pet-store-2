# Legacy implementation notes: customer accounts

## User interface
No screen records were extracted for this capability; its user interface is unspecified. The sign-on, sign-up and profile pages exist in the legacy source but are not specified here.

## Legacy implementation

- Sign-on: a filter holds the protected-URL list from the sign-on configuration, remembers the requested URL, and redirects after authentication (see `legacy-source/app/src/components/signon`).
- User creation: CreateUserServlet calls the SignOn EJB createUser; the user name is the primary key so duplicates fail with CreateException and redirect to the user creation error page. The servlet writes the user name and password to standard output (legacy defect).
- Profile: CustomerHTMLAction.extractContactInfo accumulates missing address fields; the missing-list for language, favorite category and card fields is built and never used, so only address fields are effectively enforced.
- Session (legacy): the repository has two timeouts, 15 minutes (sign-on) and 30 minutes (web session), and which governs in production is unknown. The new build does not carry this ambiguity over; it uses the rules below.
- Session (new build, SEC-116, ARC-103): the session is a server-side record in a networked session store shared by every server instance (a shared cache, for example Redis), referenced by an opaque cookie. It is not kept in process memory, and not in the embedded SQLite file on the server's own disk, which ARC-103 does not count as a networked store. The session store is a new data store: it must be proposed and approved in the system design (a2a_submit_system_design) before it is built. Each record has a time-to-live equal to the maximum age, and every call to the store has a time limit (AVL-002). The server ends a session, and refuses the cookie afterwards, in these cases:
  - Idle time: 15 minutes without a request (the stricter of the two legacy values). Each authenticated request moves the idle deadline forward.
  - Maximum age: 8 hours from sign-in, whatever the activity. The user must sign in again.
  - Sign-out: the sign-out action deletes the server-side session record; clearing the cookie in the browser is not what ends it.
  - Change of rights: when the user's rights, role or password change, or the account is disabled, every session of that user is deleted from the session store right after the change commits. The account data and the session store are different stores, so this cannot be one transaction. To keep the guarantee if the deletion fails, each session record carries the user's credential version at sign-in, and each request compares it with the account's current version and refuses the session on a mismatch.
  - Idle time and maximum age are checked on the server on every request, and the cookie's own expiry is set to match but is never trusted.
- Data: sign-on, account, contact info, credit card and profile tables are linked one-to-one per customer. Passwords and card numbers are stored unhashed.
- Contradictions to settle: user name limit is 25 characters in user creation but 50 in the schema; user ID containing '%' or '*' is rejected in one pass but not in the requirement text above.
