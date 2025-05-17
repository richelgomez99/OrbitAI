// server/dev.ts
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes.js";
import { createTRPCExpressMiddleware } from "./appRouter.js";
import cors from 'cors';
import { type Server as HttpServer } from "http";
import { initializeViteDevEnvironment } from "./vite-dev-setup.js"; // Direct import

const app = express();

// CORS configuration
const allowedOrigins = [
  'http://localhost:5001',
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
    console.error("Unhandled error in Express middleware (dev.ts):", err);
  });

  console.log("Development mode: Initializing Vite dev environment...");
  try {
    await initializeViteDevEnvironment(app, server);
    console.log("Vite development environment initialized successfully.");
  } catch (e) {
    console.error("Failed to initialize Vite dev environment:", e);
  }

  const port = process.env.PORT || 5001;
  server.listen({
    port,
    host: "0.0.0.0",
  }, () => {
    console.log(`Development server running on port ${port}`);
  });
})();
