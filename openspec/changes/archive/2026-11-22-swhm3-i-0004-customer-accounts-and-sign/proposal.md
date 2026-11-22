# Proposal: customer accounts (legacy extraction)

## Why
Recover the behaviour of the legacy sign-on, customer, account and profile components as a verifiable specification.

## What changes
Adds 36 requirements covering sign-on and sign-off, session timeouts, the remember-user-name cookie, user creation limits, profile validation and storage, and the customer/account/profile data structure.

## Impact
Replaces the legacy sign-on, customer and account components. Two legacy defects are carried as flagged requirements: plain-text password and card storage, and the create-user servlet logging the password.
