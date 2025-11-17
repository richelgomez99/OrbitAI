import { initTRPC, TRPCError } from '@trpc/server';
import type { Request, Response } from 'express';
import type { User } from '@supabase/supabase-js';
import { supabaseAdmin } from './supabaseClient';

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */

/**
 * Context available to all tRPC procedures.
 * Contains Express request/response and optionally authenticated user.
 */
export interface Context {
  req: Request;
  res: Response;
  user?: User | null;
  userId?: string | null;
}

/**
 * Authenticated context - guaranteed to have user and userId.
 * Used by authedProcedure middleware.
 */
export interface AuthedContext extends Context {
  user: User;
  userId: string;
}

// Initialize tRPC with the defined Context type
const t = initTRPC.context<Context>().create();

/**
 * Export reusable router and procedure helpers
 */
export const router = t.router;

/**
 * Public procedure - no authentication required.
 * Use sparingly - only for truly public endpoints like health checks.
 */
export const publicProcedure = t.procedure;

/**
 * Authenticated procedure middleware.
 * Validates JWT token from Authorization header and adds user to context.
 *
 * @throws {TRPCError} UNAUTHORIZED if token is missing, invalid, or expired
 *
 * Usage in routers:
 * ```typescript
 * export const taskRouter = router({
 *   getAll: authedProcedure.query(async ({ ctx }) => {
 *     // ctx.userId is guaranteed to exist
 *     return getTasksForUser(ctx.userId);
 *   }),
 * });
 * ```
 */
const authMiddleware = t.middleware(async ({ ctx, next }) => {
  // Extract Authorization header
  const authHeader = ctx.req.headers.authorization;

  if (!authHeader) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Missing authentication token. Please log in to continue.',
    });
  }

  // Validate Bearer token format
  if (!authHeader.startsWith('Bearer ')) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Invalid authentication header format. Expected "Bearer <token>".',
    });
  }

  // Extract token
  const token = authHeader.substring(7); // Remove "Bearer " prefix

  if (!token || token.trim() === '') {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Missing authentication token. Please log in to continue.',
    });
  }

  // Verify token with Supabase
  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data.user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired authentication token. Please log in again.',
      });
    }

    // Add authenticated user to context
    return next({
      ctx: {
        ...ctx,
        user: data.user,
        userId: data.user.id,
      } as AuthedContext,
    });
  } catch (error) {
    // Handle any unexpected errors
    if (error instanceof TRPCError) {
      throw error;
    }

    // Don't expose internal errors to clients
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authentication failed. Please try again.',
    });
  }
});

/**
 * Authenticated procedure - requires valid JWT token.
 * Use this for all mutations and sensitive queries.
 *
 * Automatically validates JWT and provides ctx.user and ctx.userId.
 */
export const authedProcedure = t.procedure.use(authMiddleware);

