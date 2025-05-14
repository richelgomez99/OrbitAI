# Project Tasks

This file tracks tasks related to the Orbit project migration and ongoing development.

## Migration Tasks

- [Done] Attempt database migration with `npm run db:push`.
  - **ORBIT-ISSUE-009 (Direct Host DNS)**: `ENOTFOUND db.mcsndedmymfmrfampidb.supabase.co`. User has contacted Supabase support (2025-05-14).
  - [Done] Successfully used Supabase pooler connection string as a temporary workaround for database migration (2025-05-14).
- [Done] Successfully started the application locally with `npm run dev` (2025-05-14).
  - Resolved `ENOTSUP` socket error by:
    - Changing server port from `5000` to `5001` (conflict with macOS Control Center).
    - Changing server listen host from `0.0.0.0` to `127.0.0.1`.
    - Removing `reusePort: true` from `server.listen` options in `server/index.ts`.
- [ ] Audit project for Replit-specific configurations and dependencies.
- [ ] Remove or refactor Replit-specific logic.
- [ ] Verify Vite + Tailwind setup for local development.
- [ ] Ensure client/server communication in a local dev context.
- [ ] Establish `.env.example` for environment variables.
- [ ] Update README.md with local development instructions.
- [x] User must set up a PostgreSQL database (local or cloud, e.g., Neon) and provide the `DATABASE_URL` in a `.env` file. This is critical for server operation.
- [ ] Configure `drizzle-kit` to correctly load `DATABASE_URL` from `.env` for migrations (e.g., by using `dotenv-cli`).
- [ ] Confirm and document local server port for client/server communication.
- [x] Remove `.replit` file.
- [x] Remove `@replit/vite-plugin-cartographer` from `package.json` and `vite.config.ts`.
- [x] Remove `@replit/vite-plugin-runtime-error-modal` from `package.json` and `vite.config.ts`.
- [x] Add `OPENAI_API_KEY` to `.env.example` and instruct user to provide value in `.env` file.
- [x] Run `npm install` to populate `node_modules` and potentially resolve type/linting issues.
- [ ] Re-evaluate and resolve any remaining TypeScript/linting errors in `vite.config.ts` and `tsconfig.json` (e.g., missing type definitions for 'node', 'vite/client').
