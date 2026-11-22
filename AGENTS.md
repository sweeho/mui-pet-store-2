# Agent Guide

`CLAUDE.md` and `GEMINI.md` are symlinks to this file — one authored manual, whatever
harness is reading it.

**Vortex composes four of the sections below straight into every agent's prompt**:
`## Build & run`, `## Test & validate`, `## Conventions` and `## Gotchas`. Everything
else is named in the prompt and read from the file on demand.

Commands are NOT listed here. They are declared once, machine-readably, in
`.vortex/config.yaml` under `commands:`, and reach every agent as a resolved table
under `## Project commands`. This file explains the ones whose behaviour is not
obvious; it does not restate them.

## Docs

- [README.md](./README.md) — routes, API handlers, database, the shell
- [ARCHITECTURE.md](./ARCHITECTURE.md) — stack, data flow, deployment
- [DESIGN.md](./DESIGN.md) — the MUI theme, its tokens and the shell
- [PRODUCT.md](./PRODUCT.md) — what this is; replace for a real product

## Build & run

`install` then `start`: the Next.js dev server runs pages and API routes together on **:3000**.
Playwright drives its own dev server on **:3100**, and the acceptance suite on **:3101**, so a
running dev server never collides with a test run.

Everything runs under **Node.js and npm**, at the versions `stack.versions.yaml` declares. Install
with `npm ci`, never `npm install`, unless you are changing a dependency on purpose.

The database is the one `stack.versions.yaml` names under `options.database`:

- **SQLite**: libsql, the file `sqlite.db` at the project root (`DATABASE_PATH` changes it),
  created, migrated and seeded on first use.
- **PostgreSQL**: `DATABASE_URL`, or, when it is unset, a throwaway local cluster the process
  starts itself (`src/db/local-postgres.ts`: a temporary folder, a free port on 127.0.0.1, removed
  on exit). That needs the PostgreSQL server programs (`initdb`, `pg_ctl`) and a non-root user.
  Never point it at a host named `postgres`.

## Test & validate

Run the `verify-full` slot before finishing a change. `verify` alone is the browser-free core
gate: the right fallback **only** when Chromium is genuinely missing. Do not retry E2E, and do not
try to install a browser.

| You changed...                    | Add...                             | Copy from                              |
| --------------------------------- | ---------------------------------- | -------------------------------------- |
| A pure function (`src/lib`)       | Unit test, `<name>.test.ts`        | `src/lib/format.test.ts`               |
| A component                       | UI test, `<name>.test.tsx`         | `src/components/HomeView.test.tsx`     |
| An API route                      | Integration test beside `route.ts` | `src/app/api/users/[id]/route.test.ts` |
| A browser-only or cross-page flow | Playwright spec in `e2e/`          | `e2e/home.spec.ts`                     |

Jest runs component tests in jsdom. A test that loads a route or the database starts with a
`@jest-environment node` comment, or it runs in jsdom and fails. The run uses its own database
(`src/db/test-setup.ts`): a fresh SQLite file, or one throwaway PostgreSQL cluster for the run.
A route test that writes must leave the seeded rows as it found them.

**The acceptance suite** lives in `tests/acceptance/<capability>/`: unit-level specs as
`*.test.ts(x)`, browser specs under `e2e/` as `*.spec.ts`. `npm test` leaves the folder out;
`npm run test:acceptance` and `npm run test:acceptance:e2e` run it. Never edit a locked test.

A spec you have not executed is not a test. Never commit a `*.spec.ts` you have not run.

## Conventions

- **Routing is file-based.** A page is `src/app/<path>/page.tsx`; an API handler is
  `src/app/api/<path>/route.ts`. Pages inside the admin shell live under `src/app/(DashboardLayout)/`.
  Add a page to the sidebar in `src/shell/SidebarItems.tsx` (`MENU_ITEMS`).
- **MUI for every component**, styled through the theme. Colours, type and shape come from
  `design/tokens.mui.json` via `src/theme/theme.ts`; never write a colour in a component.
- **Server first.** A page reads its data on the server (see `src/app/(DashboardLayout)/page.tsx`)
  and passes it to a component; mark a component `"use client"` only when it needs state or
  events.
- **The base path.** The staging preview serves the app under a prefix (`NEXT_BASE_PATH`).
  `next/link` adds it; a client `fetch` must use `withBasePath()` from `src/lib/paths.ts`.
- **Database access goes through Drizzle** (`getDb()` in `src/db/client.ts`), never raw SQL. A
  schema change is not done until `db-generate` has written the migration in `drizzle/` and you
  have committed it.
- **TypeScript is strict.** No `any` without a justification comment on the line above it.
- **Mirror the nearest existing file** before writing a page, a route, a component or a test.

## Gotchas

- `next-env.d.ts` is generated and ignored. `npm run typecheck` runs `next typegen` first; give any
  other tsc-only script the same step or it fails on a fresh clone.
- `src/shell/` is vendored Modernize Free (MIT). Change it like your own code, but keep its
  `LICENSE.md`.
- The Docker image runs `server.js` from Next.js's standalone output. A file read at run time
  (the migrations) must be copied in the Dockerfile and listed in `outputFileTracingIncludes`.
- The project's own versions are pinned exactly. Change one only through `stack.versions.yaml`
  and `check-versions`.
- Sign-on (Auth.js, `src/auth.ts`) needs `AUTH_SECRET` in the environment. `.env.development` and
  `.env.test` carry a development-only value; a deployment sets its own. A server component or
  route handler reads the signed-on customer with `getSignedOnCustomer()`
  (`@/lib/customer-accounts/current`) or `customerFromCookies()` (`.../server`), never the token. A
  page behind sign-on adds its prefix to `PROTECTED_PAGE_PREFIXES` in `src/lib/customer-accounts/access.ts`.
- Use `db.batch([...])` for writes that belong together, not `db.transaction`: libsql moves the
  client to a new connection after a transaction, which loses the busy timeout.
- Jest cannot load the ES modules in `next-auth`; a test that imports `src/proxy.ts` or
  `src/lib/customer-accounts/token.ts` mocks `next-auth/jwt` (see `src/proxy.test.ts`).

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
