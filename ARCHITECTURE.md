# Architecture

## Stack

- **Runtime**: Node.js and npm, at the versions in `stack.versions.yaml`
- **Framework**: Next.js App Router: server-rendered pages and API route handlers in one app
- **UI**: React and MUI, with the Modernize Free admin shell in `src/shell/` and one theme built
  from `design/tokens.mui.json`
- **Database**: Drizzle ORM over SQLite (libsql, a file) or PostgreSQL (`DATABASE_URL`, or a
  throwaway local cluster in development and tests)
- **Tests**: Jest through `next/jest` (jsdom for components, node for routes and the database),
  Playwright end to end, Stryker for mutation testing
- **Packaging**: a Docker image of Next.js's standalone server, run as the non-root `node` user

## Data flow

A request for a page runs its server component, which reads through `src/lib/` and `getDb()` and
renders MUI components inside the shell. An API route (`src/app/api/**/route.ts`) does the same and
answers JSON. The browser calls the API with `withBasePath()`, so the app works under the staging
preview's path prefix (`NEXT_BASE_PATH`).

`getDb()` (`src/db/client.ts`) connects once per process, applies the migrations in `drizzle/` and
seeds two demo users when the table is empty.

## Deployment

The `Dockerfile` builds the app with `output: "standalone"` and runs `server.js` under Node as the
`node` user on a base image pinned by digest. `compose.yaml` runs it on :3000; a PostgreSQL
project's Compose file adds a `db` service. With the Helm option, `chart/` deploys the image and
its CI job lints and validates it. Vortex never builds or runs the image: CI's `docker-build` job
does.
