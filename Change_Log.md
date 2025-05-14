# Change Log

This file documents significant changes made to the Orbit project.

| Date | Change Description | Author | Version |
|---|---|---|---|
| 2025-05-14 | Successfully started the development server (`npm run dev`). Resolved persistent `ENOTSUP` socket error by changing port to `5001` (from `5000` due to macOS Control Center conflict), changing listen host to `127.0.0.1` (from `0.0.0.0`), and removing `reusePort: true` from `server.listen` options in `server/index.ts`. | richelgomez | - |
| 2025-05-14 | Removed `.replit` file as part of migration from Replit environment. | richelgomez | - |
| 2025-05-14 | Removed Replit-specific Vite plugins (`@replit/vite-plugin-cartographer`, `@replit/vite-plugin-runtime-error-modal`) from `package.json` and `vite.config.ts`. | richelgomez | - |
| 2025-05-14 | Corrected `import.meta.dirname` usage in `vite.config.ts` to use `path.dirname(new URL(import.meta.url).pathname)` for ES module compatibility. | richelgomez | - |
| 2025-05-14 | Executed `npm install` to install project dependencies. | richelgomez | - |
| 2025-05-14 | Installed `dotenv-cli` as a dev dependency. Modified `db:push` script in `package.json` to use `dotenv-cli` for loading `.env` file before running `drizzle-kit push`. | richelgomez | - |
