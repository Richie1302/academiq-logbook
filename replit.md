# AcademiQ Logbook

A SIWES logbook assistant for Nigerian university students. Write raw daily notes and get them rewritten into professional logbook entries using AI. Export to PDF, track streaks, and manage your SIWES profile.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, shadcn/ui, wouter routing
- Auth: Clerk (email + Google OAuth)
- AI: OpenAI via Replit AI integration (AI_INTEGRATIONS_OPENAI_BASE_URL / KEY)
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — source of truth for API contracts
- `lib/db/src/schema/` — Drizzle ORM table schemas (`entries.ts`, `profiles.ts`)
- `lib/api-zod/src/generated/api.ts` — generated Zod schemas (do not edit)
- `lib/api-client-react/src/generated/` — generated React Query hooks (do not edit)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/academiq-logbook/src/pages/` — React page components
- `artifacts/academiq-logbook/src/hooks/useDisplayName.ts` — resolves display name from profile + Clerk
- `artifacts/academiq-logbook/src/lib/pdf-export.ts` — jspdf PDF export utility

## Architecture decisions

- Contract-first API: OpenAPI spec → Orval codegen → typed React Query hooks and Zod validators
- All entries are scoped to `userId` from Clerk JWT — users only ever see their own data
- `serializeRow()` helper converts Drizzle `Date` objects to ISO strings before Zod parse (Drizzle returns JS Date, Zod expects string)
- Profile greeting uses priority chain: profile `fullName` → Clerk `firstName` → Clerk `fullName` first word → email username → "Student"
- Orval zod config uses `mode: "single"` with absolute target path to avoid generating a barrel `index.ts` that references non-existent schema split files

## Product

- **Landing** — marketing page with sign in/up CTAs
- **Dashboard** — dynamic greeting, 4-stat summary, week progress tracker, recent entries
- **New Entry** — date/week input, raw notes textarea, AI rewrite with Concise/Detailed toggle, save
- **History** — searchable/filterable list of all entries; edit, delete, copy, per-entry PDF download, bulk PDF export
- **Profile** — SIWES student details form (name, school, course, company, department, duration)
- **Settings** — password change, sign out, delete account

## User preferences

- Keep the app lightweight and fast — no enterprise dashboards
- Mobile-first layout with bottom nav on mobile, sidebar on desktop
- Font: Inter
- AI rewrite uses gpt-4.1 via Replit AI integration

## Gotchas

- `lib/api-zod/src/index.ts` must only export `export * from "./generated/api"` — orval previously regenerated this file with split-mode barrel exports that referenced non-existent files. Fixed by using `mode: "single"` with absolute target path in orval config.
- After adding new `@radix-ui/*` packages, restart the frontend workflow once to force Vite to pre-bundle them (they're listed in `optimizeDeps.include`).
- Do NOT run `pnpm dev` at workspace root — use workflows.
- `dayOfWeek` in new entries is computed from date string using `date + "T12:00:00"` to avoid timezone midnight rollover issues.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
