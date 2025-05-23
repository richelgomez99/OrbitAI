// server/index.ts (PRODUCTION ONLY)
import express, { type Request, Response, NextFunction } from "express";
import type { PrismaClient, Prisma } from "@prisma/client";
import { registerRoutes } from "./routes.js";
import { createTRPCExpressMiddleware } from "./appRouter.js";
import cors from 'cors';
import fs from "fs";
import path from "path";
import { type Server as HttpServer } from "http";

// serveStatic function
function serveStatic(app: express.Express) {
  const distPath = path.resolve(process.cwd(), "dist", "public");
  if (!fs.existsSync(distPath)) {
    console.warn(
      `Static asset directory not found: ${distPath}. If deploying to Fly.io with [statics] configured, this might be okay.`,
    );
  } else {
    app.use(express.static(distPath));
    // SPA fallback: This should be after all API routes and other specific static paths.
    app.use("*", (_req, res) => { 
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }
}

const app = express();

// CORS configuration (needed for prod)
const allowedOrigins = [
  'http://localhost:5001', // Still useful if API is hit directly during local client dev pointing to prod API
  'https://orbitassistant.com',
  /^https:\/\/.*\.orbitassistant\.com$/,
  /^https:\/\/orbit-web-.*\.vercel\.app$/,
  'https://orbit-web.vercel.app'
];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    let allowed = false;
    for (const checkOrigin of allowedOrigins) {
      if (typeof checkOrigin === 'string' && checkOrigin === origin) {
        allowed = true;
        break;
      }
      if (checkOrigin instanceof RegExp && checkOrigin.test(origin)) {
        allowed = true;
        break;
      }
    }
    if (allowed) {
      callback(null, true);
    } else {
      console.warn(`CORS: Origin ${origin} not allowed.`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// tRPC middleware
app.use('/trpc', createTRPCExpressMiddleware());

// Logging middleware (useful for prod)
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

  // Error handling for production
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error("Unhandled error in Express middleware (production):", err); // Log the actual error
    res.status(status).json({ message }); // Send generic message to client
  });

  // Serve static assets in production (after API routes and error handlers for API)
  console.log("Production mode: Serving static assets.");
  serveStatic(app);

  const port = process.env.PORT || 5001; // Fly.io provides PORT
  server.listen({
    port,
    host: "0.0.0.0", // Required by Fly.io
  }, () => {
    console.log(`Production server running on port ${port}`);
  });
})();

