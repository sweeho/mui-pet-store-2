# Bootstrap, landing page and shared site shell

## Why

Every capability in "Pet Store Modernisation" needs one place to start from and one frame to sit in. Without a shared shell each capability invents its own navigation, header and layout, and nothing owns the landing page.

## What Changes

- The project's stack template already supplies the application scaffold and the site shell: the page layout, header and global navigation. Keep them; build inside them.
- Add the landing page every user arrives at, inside the shell.
- Add one entry per primary area to the shell's navigation.
- Add the shared empty, error and loading frames every page reuses.

## Impact

- Every other capability in this initiative depends on this one and is released after it ships.
- The global navigation carries one entry per primary area:

- Localization (`localization`)
- Order administration (`order-administration`)
