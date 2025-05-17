// This global is defined by esbuild for production builds.
// It will be undefined during local 'tsx' development.
declare const __IS_DEV__: boolean | undefined; 

import type { Express } from "express";
import type { Server as HttpServer } from "http";

export async function setupVite(app: Express, server: HttpServer): Promise<void> {
  // This check determines if we are in a true development environment.
  // 1. __IS_DEV__ is undefined (e.g., running with `tsx` locally) AND NODE_ENV is 'development'.
  // OR
  // 2. __IS_DEV__ is explicitly true (though esbuild sets it to false for prod).
  const isTrulyDevelopment = 
    (typeof __IS_DEV__ === 'undefined' && process.env.NODE_ENV === 'development') ||
    (typeof __IS_DEV__ === 'boolean' && __IS_DEV__ === true);

  if (isTrulyDevelopment) {
    console.log("[setupVite] Development mode detected: Dynamically importing and initializing vite-dev-setup...");
    try {
      // IMPORTANT: Use .js extension for dynamic import if esbuild doesn't rewrite it for Node's ESM resolver.
      // Assuming esbuild output target is ESM and Node will resolve .js from .ts source.
      const { initializeViteDevEnvironment } = await import("./vite-dev-setup.js"); 
      await initializeViteDevEnvironment(app, server);
      console.log("[setupVite] vite-dev-setup completed.");
    } catch (e) {
      console.error("[setupVite] Failed to load or run vite-dev-setup:", e);
      // Optionally, exit or provide a fallback if Vite is critical for dev
    }
  } else {
    console.log("[setupVite] Production mode or non-dev environment (__IS_DEV__ is false or not explicitly dev): Vite setup will be skipped.");
    // This function should ideally not even be part of the production bundle if tree-shaking works on the dynamic import.
  }
}
