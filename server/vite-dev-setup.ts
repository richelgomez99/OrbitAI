import type { Express } from "express";
import type { Server as HttpServer } from "http";
import fs from "fs"; // Built-in, fine as static import
import path from "path"; // Built-in, fine as static import

export async function initializeViteDevEnvironment(app: Express, server: HttpServer) {
  console.log("[_vite-dev-setup] Initializing Vite dev environment. Dynamically importing Vite's createServer...");

  // Dynamically import createServer from Vite.
  // Vite itself will then handle loading vite.config.ts and its plugins (like @vitejs/plugin-react)
  // This dynamic import ensures 'vite' is only resolved if this dev-only function is called.
  const { createServer: createViteServer } = await import("vite");

  const vite = await createViteServer({
    // Vite will automatically find and use vite.config.ts in the project root.
    // The vite.config.ts should have @vitejs/plugin-react in its plugins array.
    server: {
      middlewareMode: true,
      hmr: { server }, // Pass the HTTP server for HMR
    },
    appType: "custom", // We're integrating into an existing Express app
    customLogger: { 
        info(msg: string, options?: { clear?: boolean; timestamp?: boolean }) {
            console.info(`[VITE-INFO] ${msg}`);
        },
        warn(msg: string, options?: { clear?: boolean; timestamp?: boolean }) {
            console.warn(`[VITE-WARN] ${msg}`);
        },
        error(msg: string, options?: { error?: Error | null; timestamp?: boolean }) {
            console.error(`[VITE-ERROR] ${msg}`);
            if (options?.error?.stack) console.error(options.error.stack);
            // Consider if process.exit(1) is too aggressive here for all Vite errors.
        },
        // clearScreen can be optionally implemented if needed
        // clearScreen(type: 'error' | 'warning') { console.clear(); }
    }
  });

  app.use(vite.middlewares);
  console.log("[_vite-dev-setup] Vite dev middlewares applied.");

  // Fallback to client's index.html for client-side routing
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      // Ensure path to client's index.html is correct relative to CWD at runtime
      const clientHtmlPath = path.resolve(process.cwd(), "client", "index.html");
      if (!fs.existsSync(clientHtmlPath)) {
        console.error(`[Vite Dev] Client HTML not found at: ${clientHtmlPath}. Current CWD: ${process.cwd()}`);
        return res.status(404).send("Client HTML not found. Ensure 'client/index.html' exists and CWD is project root.");
      }
      let template = await fs.promises.readFile(clientHtmlPath, "utf-8");
      const page = await vite.transformIndexHtml(url, template); // Vite processes the HTML
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e: any) { // Catch any error
      if (vite && typeof vite.ssrFixStacktrace === 'function') {
        vite.ssrFixStacktrace(e);
      }
      next(e);
    }
  });
  console.log("[_vite-dev-setup] Vite wildcard handler for index.html applied.");
}
