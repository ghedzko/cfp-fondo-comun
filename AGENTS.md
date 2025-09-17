# Repository Guidelines

Follow this playbook to contribute confidently to the CFP Fondo Común Next.js + Prisma stack.

## Project Structure & Module Organization
- `src/app`: Next.js App Router routes, layouts, and API handlers (`page.tsx`, `layout.tsx`, `api/*`).
- `src/components`: Reusable React components; shadcn/ui primitives live under `components/ui/*`.
- `src/lib`: Shared utilities including `db.ts` (Prisma client), `axios.ts` (REST wrapper), and helper functions designed for testing.
- `src/providers`: Global providers (theme, React Query) consumed by the App Router.
- `prisma/`: `schema.prisma` plus generated outputs; requires a valid `DATABASE_URL`.
- `public/`: Static assets. Use `docker-compose.yml` for the local Postgres service. Colocate new tests beside their sources.

## Build, Test, and Development Commands
- `npm run dev`: Start the dev server at `http://localhost:3000`.
- `npm run build` → `npm run start`: Produce and serve the production bundle.
- `npm run lint`: Run ESLint; auto-fix with `npx eslint . --fix` when safe.
- `npx prisma generate`: Regenerate the Prisma Client after schema edits.
- `npx prisma db push`: Apply schema changes to the local database.
- `docker-compose up -d`: Launch Postgres; follow with `node scripts/create-test-user.js` to seed sample users.

## Coding Style & Naming Conventions
- TypeScript in `strict` mode; import via the `@/*` alias for `src/*`.
- Format with Prettier defaults (2 spaces, 80 columns, single quotes, semicolons, ES5 trailing commas).
- Resolve ESLint `next/core-web-vitals` + TypeScript warnings before committing.
- Components export in PascalCase; filenames in `src/components` stay kebab-case (`theme-toggle.tsx`).

## Testing Guidelines
- Prefer colocated specs named `*.test.ts` or `*.test.tsx` alongside the code.
- Use Vitest/Jest with Testing Library; emphasize business rules in `src/lib/*` and pure utilities.
- Run `npm run lint` plus any new test scripts before pushing; document missing coverage in the PR description when unavoidable.

## Commit & Pull Request Guidelines
- Commits follow Conventional Commits (`feat:`, `fix:`, `chore:`, etc.); include a scope for clarity (`feat(app): …`).
- Branch names use `feature/<name>` or `fix/<name>`.
- PRs include a concise summary, linked issues, reproduction steps or test notes, and UI screenshots when relevant.
- Surface Prisma changes by noting `schema.prisma` updates and required commands (`prisma generate`, `prisma db push`), and extend `env.example` for new env vars.

## Security & Configuration Tips
- Never commit secrets; copy `env.example` to `.env`, populate `DATABASE_URL`, and guard keys like `JWT_SECRET`/`JWT_REFRESH_SECRET`.
- Enable `COOKIE_SECURE=true` and set `NEXT_PUBLIC_APP_URL` to the deployed origin before shipping.
