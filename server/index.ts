declare const __IS_DEV__: boolean | undefined; // Will be defined by esbuild for production builds
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";

import { createTRPCExpressMiddleware } from "./appRouter"; // Import Express-compatible middleware
import cors from 'cors';
import fs from "fs";
import path from "path";
import { type Server as HttpServer } from "http";


// Moved serveStatic function
function serveStatic(app: express.Express) {
  // This path needs to be relative to where dist/index.js runs from.
  // If dist/index.js is in /app/dist/index.js, then 'public' would be /app/public.
  // We need to confirm client asset location in the Docker image.
  // fly.toml statics directive might make this redundant for Fly.io deployment.
  const distPath = path.resolve(process.cwd(), "public");

  if (!fs.existsSync(distPath)) {
    console.warn(
      `Static asset directory not found: ${distPath}. If deploying to Fly.io with [statics] configured, this might be okay.`,
    );
  } else {
    app.use(express.static(distPath));
    // This catch-all should be specific to static assets and usually comes after API routes.
    // For a Single Page Application (SPA), it serves index.html for any non-API, non-file route.
    app.use("*", (_req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }
}

const app = express();

// Enable CORS for development
app.use(cors({
  origin: 'http://localhost:3000', // Update this with your client URL
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// tRPC middleware
// Directly use the middleware from appRouter
app.use('/trpc', createTRPCExpressMiddleware());

// Logging middleware
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api") || path.startsWith("/trpc")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(logLine);
    }
  });

  next();
});

(async () => {
  const server: HttpServer = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Setup Vite conditionally using __IS_DEV__ (defined by esbuild for prod) or fallback to NODE_ENV for local dev
  const isDevelopment = typeof __IS_DEV__ === 'boolean' ? __IS_DEV__ : process.env.NODE_ENV === 'development';

  if (isDevelopment) {
    console.log("Preparing to dynamically import Vite for development...");
    try {
      const { setupVite } = await import('./vite');
      await setupVite(app, server);
      console.log("Vite setup executed successfully.");
    } catch (e) {
      console.error("Failed to load Vite module for development:", e);
    }
  } else {
    console.log("Vite import will be skipped (isDevelopment is false - production mode).");
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = process.env.PORT || 5001;
  server.listen({
    port,
    host: "0.0.0.0", // Fly.io requires 0.0.0.0
  }, () => {
    console.log(`serving on port ${port}`);
  });
})();
