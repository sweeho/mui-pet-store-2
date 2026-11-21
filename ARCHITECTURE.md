# Architecture

## Topology

Approved system design, version 1:

| Element                                                | Kind            | Role                                                                                   |
| ------------------------------------------------------ | --------------- | -------------------------------------------------------------------------------------- |
| Users                                                  | person          | Shoppers, customers and administrators, in a browser                                   |
| Browser code (TypeScript, React, MUI, Modernize shell) | web app         | React client components inside the shell, styled by the one MUI theme                  |
| Node.js process (Next.js standalone `server.js`)       | api             | Renders pages on the server, answers `src/app/api` route handlers, runs `src/proxy.ts` |
| Drizzle ORM                                            | data access     | `src/db` (schema, `getDb()`), migrations in `drizzle/` applied at startup              |
| SQLite (libsql)                                        | database        | The project database, `sqlite.db` on a mounted volume                                  |
| Mail relay (SMTP over TLS)                             | external system | Delivers order-status e-mail and batch failure notices                                 |

Connections: Users → browser code → Node.js (pages and API) → Drizzle → SQLite; Node.js → mail
relay. All of them carry personal data. The browser never reaches the database directly: every
read and write goes through server code in `src/app`, which calls `src/lib`, which calls `src/db`.

## Stack

- **Runtime**: Node.js and npm, at the versions in `stack.versions.yaml`
- **Framework**: Next.js App Router: server-rendered pages and API route handlers in one app
- **UI**: React and MUI, with the Modernize Free admin shell in `src/shell/` and one theme built
  from `design/tokens.mui.json` (see DESIGN.md)
- **Database**: Drizzle ORM over SQLite (libsql, a file)
- **Tests**: Jest through `next/jest` (jsdom for components, node for routes and the database),
  Playwright end to end, Stryker for mutation testing
- **Packaging**: a Docker image of Next.js's standalone server, run as the non-root `node` user

## Data flow

A request for a page runs its server component, which reads through `src/lib/` and `getDb()` and
renders MUI components inside the shell. An API route (`src/app/api/**/route.ts`) does the same and
answers JSON. The browser calls the API with `withBasePath()`, so the app works under the staging
preview's path prefix (`NEXT_BASE_PATH`). A page that loads data from the browser renders its
loading, error and empty states through the shared state frames.

`getDb()` (`src/db/client.ts`) connects once per process, applies the migrations in `drizzle/` and
seeds two demo users when the table is empty.

## Deployment

One container: the `Dockerfile` builds the app with `output: "standalone"` and runs `server.js`
under Node as the `node` user on a base image pinned by digest. The SQLite file lives on a mounted
volume. `compose.yaml` runs it on :3000. Outbound mail goes to the SMTP relay over TLS. Vortex never
builds or runs the image: CI's `docker-build` job does.

## Key Decisions

- **D1. One shell.** Every page renders inside the same layout, header, navigation and footer.
  Chrome changes in one place and the accessibility behaviour is kept in one place.
  (change swhm3-i-0001-bootstrap-landing-page-and, design D1)
- **D2. One navigation.** Every primary area is one entry in `MENU_ITEMS`
  (`src/shell/SidebarItems.tsx`), and the landing page's links are generated from it. Users always
  have one place to find every area and a way home. (change swhm3-i-0001-bootstrap-landing-page-and, design D2)
- **D3. Shared states.** Empty, error and loading frames are shared components reused by every page
  and region, so users see the same wording and each fix is made once.
  (change swhm3-i-0001-bootstrap-landing-page-and, design D3)
- **D4. Existing boilerplate wins.** Extend the Next.js, MUI and Modernize scaffold rather than
  scaffold again, so the codebase is not split in two. (change swhm3-i-0001-bootstrap-landing-page-and, design D4)
- **D5. Sign-in only if the product has it.** The shell gains a sign-in frame once, when
  authentication ships, because a frame with nothing behind it misleads users.
  (change swhm3-i-0001-bootstrap-landing-page-and, design D5)
