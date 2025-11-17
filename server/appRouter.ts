import { router } from './trpc'; // Import the router factory
import { taskRouter } from './routers/task.router'; // Import your specific router(s)
import { modeRouter } from './routers/mode.router'; // Import mode router
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import type { Request, Response } from 'express'; // For context typing
import type { Context } from './trpc';

/**
 * Main application router.
 * Combines all feature routers into a single API surface.
 */
export const appRouter = router({
  task: taskRouter,
  mode: modeRouter,
  // other routers can be added here:
  // reflection: reflectionRouter,
});

/**
 * Export type signature of router for frontend type inference.
 * This enables end-to-end type safety from server to client.
 */
export type AppRouter = typeof appRouter;

/**
 * Options for creating Express context.
 */
export interface CreateExpressContextOptions {
  req: Request;
  res: Response;
}

/**
 * Create tRPC Express middleware with proper context.
 *
 * The context created here is passed to all tRPC procedures.
 * Authentication middleware (authedProcedure) will add user/userId to this context.
 */
export function createTRPCExpressMiddleware() {
  return createExpressMiddleware({
    router: appRouter,
    createContext: ({ req, res }: CreateExpressContextOptions): Context => {
      // Return req and res - authedProcedure will add user/userId when needed
      return { req, res };
    },
    onError: ({ path, error }) => {
      // Log errors for debugging (production should use proper logger)
      // eslint-disable-next-line no-console
      console.error(`tRPC Error on ${path ?? '<no-path>'}:`, error.message);
    },
  });
}
