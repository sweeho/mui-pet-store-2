# Acceptance tests

The locked acceptance suite: written from the approved test cases before the product code, and
red until Build makes it pass. Vortex's Test Author writes it and locks it; never edit a locked
test to make it pass.

- Unit-level specs: `tests/acceptance/<capability>/*.test.ts` (or `.tsx`), run by
  `npm run test:acceptance`.
- Browser specs: `tests/acceptance/<capability>/e2e/*.spec.ts`, run by
  `npm run test:acceptance:e2e`.

The default `npm test` leaves this folder out (`testPathIgnorePatterns` in `jest.config.mjs`).
CODEOWNERS names an owner for it.
