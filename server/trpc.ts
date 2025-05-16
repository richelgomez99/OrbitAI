import { initTRPC } from '@trpc/server';
// If you plan to use context with Prisma or session, you might import PrismaClient/Session here
// import { PrismaClient } from '@prisma/client';
// import { type Session } from 'next-auth'; // Example if using NextAuth

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */

// Context type can be defined here if needed, e.g.:
// export interface Context {
//   prisma?: PrismaClient;
//   session?: Session | null;
//   user?: { id: string; /* other user properties */ };
// }

// Initialize tRPC without context first, or define and use Context type
// const t = initTRPC.context<Context>().create();
const t = initTRPC.create();

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

