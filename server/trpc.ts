import { initTRPC } from '@trpc/server';
import { PrismaClient, Prisma } from '@prisma/client';

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */

export interface Context {
  prisma: PrismaClient;
  // session?: Session | null; // Assuming no NextAuth session for now
  user?: Prisma.User | null; // User can be null if not authenticated
}

// Initialize tRPC with the defined Context type
const t = initTRPC.context<Context>().create();

/**
 * Export reusable router and procedure helpers
 */
export const router = t.router;
export const publicProcedure = t.procedure;
// export const middleware = t.middleware; // If you define middleware
// export const mergeRouters = t.mergeRouters; // To combine routers, though usually router() itself is used with nested routers.

// AppRouter and createServer will be moved to a new file (e.g., appRouter.ts or handled in index.ts)
// export type AppRouter = typeof appRouter; // This will be defined elsewhere
// export function createServer() { ... } // This will be defined elsewhere or adapted

