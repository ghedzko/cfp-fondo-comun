# Repository Guidelines

> Concise guide for contributing to CFP Fondo Común (Next.js + TypeScript + Prisma).

## Project Structure & Module Organization
- `src/app`: App Router (routes, `page.tsx`, `layout.tsx`, `api/*`).
- `src/components`: Shared React components; `components/ui/*` from shadcn/ui.
- `src/lib`: `db.ts` (Prisma client), `axios.ts` (API client), `utils.ts`.
- `src/providers`: App providers (theme, React Query).
- `prisma/`: `schema.prisma` and Prisma assets; configure `DATABASE_URL`.
- `public/`: Static assets. `docker-compose.yml`: local Postgres.

## Build, Test, and Development Commands
- `npm run dev`: Start dev server on `http://localhost:3000`.
- `npm run build`: Production build. `npm run start`: Serve build.
- `npm run lint`: Run ESLint. Example fix: `npx eslint . --fix`.
- `npx prisma generate`: Generate Prisma Client.
- `npx prisma db push`: Sync schema to the database (dev).
- `docker-compose up -d`: Start local Postgres.
- `node scripts/create-test-user.js`: Seed example users (after DB ready).

## Coding Style & Naming Conventions
- Language: TypeScript (`strict: true`), path alias `@/*` to `src/*`.
- Formatting: Prettier (2 spaces, 80 cols, single quotes, semicolons, ES5 trailing commas).
- Linting: ESLint `next/core-web-vitals` + TypeScript rules.
- React: Export components in PascalCase; filenames kebab/lowercase under `components/` (e.g., `theme-toggle.tsx`, `ui/button.tsx`). Routes use folder + `page.tsx`.

## Testing Guidelines
- No test suite yet. Prefer unit tests colocated as `*.test.ts(x)` near sources using Vitest/Jest + Testing Library. Keep pure functions in `src/lib/*` easy to test. Aim for meaningful coverage on business logic.

## Commit & Pull Request Guidelines
- Commits: Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`). Scope when useful.
- Branches: `feature/<name>`, `fix/<name>`.
- PRs: Clear description, linked issues, screenshots for UI, steps to test. Run `npm run lint` before opening. If DB changes: update `prisma/schema.prisma`, include apply steps (`prisma generate`, `prisma db push`) and adjust `env.example` if new vars.

## Security & Configuration Tips
- Never commit real secrets. Copy `env.example` to `.env` and edit locally.
- Set strong `JWT_SECRET`/`JWT_REFRESH_SECRET`. In production set `COOKIE_SECURE=true` and correct `NEXT_PUBLIC_APP_URL`.
- For local dev DB: set `DATABASE_URL` or use `docker-compose`.

