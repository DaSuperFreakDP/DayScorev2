# DayScorev2

DayScore: a daily self-rating journal with an iOS app and an Express backend.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the Replit API server (port 5000, requires `DATABASE_URL`)
- `pnpm --filter @workspace/windows-server run build` — build the Windows standalone executable
- `pnpm --filter @workspace/windows-server run dev` — run the local/Windows server via Bun for testing
- `pnpm run typecheck` — full typecheck across all packages (note: `journal-app` has pre-existing type errors)
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only, PostgreSQL)
- Required env for Replit server: `DATABASE_URL` — Postgres connection string

## Local/Windows Server

`artifacts/windows-server/` produces `DayScoreServer.exe` — a self-contained Windows console application that runs the backend on the user's PC with an embedded SQLite database. No PostgreSQL install or third-party hosting is required.

- Build output: `artifacts/windows-server/DayScoreServer.exe` (≈110 MB, includes the Bun runtime and SQLite engine)
- Data folder: `DayScoreData/` next to the .exe (configurable via `DAYSCORE_DATA_DIR`)
- Default port: 5000 (configurable via `PORT`)
- The console window shows the local-network URL to use in the iPhone app.

### iPhone connection steps

1. Run `DayScoreServer.exe` on the Windows PC.
2. Note the network URL shown in the console (e.g. `http://192.168.1.50:5000`).
3. In Codemagic, go to **Application environment variables** → create a group named `dayscore` → add `EXPO_PUBLIC_DOMAIN` set to the URL shown by the server (e.g. `http://192.168.1.50:5000`). The `codemagic.yaml` already references this group under `environment.groups`.
4. Rebuild the IPA in Codemagic and install it on the iPhone (same network as the PC).

## Stack

- pnpm workspaces, Node.js 24 / Bun 1.3.6, TypeScript 5.9
- iOS app: Expo + React Native
- API: Express 5
- Replit DB: PostgreSQL + Drizzle ORM
- Local/Windows DB: SQLite (Bun built-in) + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle) / Bun compile (Windows .exe)

## Where things live

_Populate as you build — short repo map plus pointers to the source-of-truth file for DB schema, API contracts, theme files, etc._

## Architecture decisions

_Populate as you build — non-obvious choices a reader couldn't infer from the code (3-5 bullets)._

## Product

_Describe the high-level user-facing capabilities of this app once they exist._

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
