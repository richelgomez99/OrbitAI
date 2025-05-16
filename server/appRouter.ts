import { router } from './trpc'; // Import the router factory
import { taskRouter } from './routers/task.router'; // Import your specific router(s)
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import type { Request, Response } from 'express'; // For context typing

// Combine all your routers into the main application router
export const appRouter = router({
  task: taskRouter,
  // other routers can be added here like:
  // reflection: reflectionRouter,
});

// Export type signature of outputted router for frontend inference
export type AppRouter = typeof appRouter;

// Define a context type based on Express Request & Response
export interface CreateExpressContextOptions {
  req: Request;
  res: Response;
  // You can add other properties like a user object if you have auth
  // user?: { id: string; name: string; }; 
}

// Function to create tRPC Express middleware
export function createTRPCExpressMiddleware() {
  return createExpressMiddleware({
    router: appRouter,
    createContext: ({ req, res }: CreateExpressContextOptions) => {
      // This is where you'd typically handle user sessions, database connections, etc., from req object.
      // For now, just returning req and res, or an empty object if preferred.
      return { req, res }; 
    },
    onError: ({ path, error }) => {
      console.error(`❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`);
    },
  });
}
