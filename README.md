# MUI Pet Store 2

A full-stack TypeScript web app, created by Vortex from the Next.js, MUI and Modernize stack
template.

- **Next.js App Router** for pages and API routes, on **Node.js and npm**
- **MUI** with the **Modernize Free** admin shell (sidebar, header, theme)
- **Drizzle ORM** over **SQLite** (libsql) or **PostgreSQL**, as the project was created
- **Jest** (through `next/jest`) and Testing Library, **Playwright**, **Stryker**
- A **Docker** image from Next.js's standalone output, and Compose to run it

## Getting started

```bash
npm ci
npm run dev
```

Then open http://localhost:3000. The commands this project declares are in
[.vortex/config.yaml](./.vortex/config.yaml); [AGENTS.md](./AGENTS.md) explains the ones that are
not obvious.

## Layout

```
src/
├── app/                      # Pages and API routes (App Router)
│   ├── (DashboardLayout)/    # Pages inside the admin shell
│   └── api/                  # GET /api/hello, /api/users, /api/users/:id
├── components/               # The app's own components
├── db/                       # Drizzle schema and client
├── lib/                      # Pure functions and data access
├── shell/                    # Modernize Free's layout, vendored (MIT)
└── theme/                    # The one MUI theme
design/tokens.mui.json        # Colours, type and shape the theme is built from
drizzle/                      # Generated SQL migrations (committed)
e2e/                          # Playwright specs
tests/acceptance/             # The locked acceptance suite
```

## Database

The database is the one `stack.versions.yaml` names under `options.database`. SQLite keeps a file,
`sqlite.db`, created and seeded on first use. PostgreSQL reads `DATABASE_URL`, and starts a
throwaway local cluster when it is unset (it needs the PostgreSQL server programs). After changing
`src/db/schema.ts`, run `npm run db:generate` and commit the migration in `drizzle/`.

## Docker

`docker compose up --build` runs the production image on :3000 (with a PostgreSQL service for a
PostgreSQL project). Building the image needs Docker; CI's `docker-build` job builds it on every
change. Vortex never builds or runs it, and publishing it is your release process.
