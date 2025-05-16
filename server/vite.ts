declare const __IS_DEV__: boolean;

import type { Express } from "express";
import fs from "fs";
import path from "path";
import type { Server as HttpServer } from "http";
import { nanoid } from "nanoid";

async function _actualDevSetupVite(app: Express, server: HttpServer) {
  // Dynamically import Vite and related packages ONLY in development
  const { createServer: createViteServer, createLogger, defineConfig } = await import("vite");
  const react = (await import("@vitejs/plugin-react")).default;
  const viteConfigPlain = (await import("../vite.config.ts")).default; // .js extension, as it's processed by Vite/Node

  if (!viteConfigPlain) {
    throw new Error('Failed to load Vite configuration from ../vite.config.ts');
  }

  // Define and apply React plugin within the dev setup
  const viteUserConfig = defineConfig({
    ...viteConfigPlain,
    plugins: [react()], // Add react plugin here
  });

  const viteLogger = createLogger();
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as true,
  };

  const vite = await createViteServer({
    ...viteUserConfig,
    configFile: false, // We've already loaded the config
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      // template = template.replace(
      //   `src="/src/main.tsx"`,
      //   `src="/src/main.tsx?v=${nanoid()}`,
      // );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export async function setupVite(app: Express, server: HttpServer): Promise<void> {
  console.log("Development mode: Initializing Vite setup...");
  await _actualDevSetupVite(app, server);
}
