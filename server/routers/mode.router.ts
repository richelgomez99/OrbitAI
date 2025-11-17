import { z } from 'zod';
import { router, authedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { storage } from '../storage';
import { PrismaClient } from '@prisma/client';

// Extend the storage type to include Prisma client
type StorageWithPrisma = typeof storage & {
  prisma: PrismaClient;
};

/**
 * Mode router - handles focus session management (BUILD, FLOW, RESTORE modes).
 * All endpoints require authentication.
 */
export const modeRouter = router({
  /**
   * Start a new focus session.
   *
   * @requires Authentication
   * @param input - Mode type, energy level, and optional task ID
   * @returns Created focus session
   */
  startSession: authedProcedure
    .input(
      z.object({
        mode: z.enum(['BUILD', 'FLOW', 'RESTORE']),
        energyLevel: z.number().min(0).max(100).default(50),
        taskId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const prisma = (storage as StorageWithPrisma).prisma;
      const { mode, energyLevel, taskId } = input;

      // End any active sessions for this user
      await prisma.focusSession.updateMany({
        where: {
          userId: ctx.userId,
          endTime: null,
        },
        data: {
          endTime: new Date(),
        },
      });

      // Create new session
      const newSession = await prisma.focusSession.create({
        data: {
          userId: ctx.userId,
          mode,
          startTime: new Date(),
          energyStart: energyLevel,
          ...(taskId && {
            task: {
              connect: { id: taskId },
            },
          }),
        },
        include: {
          task: true,
        },
      });

      // Update user's last active time
      await prisma.user.update({
        where: { id: ctx.userId },
        data: { lastActive: new Date() },
      });

      return newSession;
    }),

  /**
   * End a focus session.
   *
   * @requires Authentication
   * @requires Ownership - User must own the session
   * @param input - Session ID, end time, and final energy level
   * @returns Updated focus session
   */
  endSession: authedProcedure
    .input(
      z.object({
        sessionId: z.string(),
        endTime: z.date().optional(),
        energyLevel: z.number().min(0).max(100).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const prisma = (storage as StorageWithPrisma).prisma;
      const { sessionId, endTime = new Date(), energyLevel } = input;

      // Verify session ownership
      const session = await prisma.focusSession.findUnique({
        where: { id: sessionId },
        select: { userId: true },
      });

      if (!session) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Focus session not found',
        });
      }

      if (session.userId !== ctx.userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to end this session',
        });
      }

      const updatedSession = await prisma.focusSession.update({
        where: {
          id: sessionId,
        },
        data: {
          endTime,
          ...(energyLevel !== undefined && { energyEnd: energyLevel }),
        },
        include: {
          task: true,
        },
      });

      return updatedSession;
    }),

  /**
   * Get the current active focus session for the authenticated user.
   *
   * @requires Authentication
   * @returns Active focus session or null
   */
  getCurrentSession: authedProcedure
    .query(async ({ ctx }) => {
      const prisma = (storage as StorageWithPrisma).prisma;

      const activeSession = await prisma.focusSession.findFirst({
        where: {
          userId: ctx.userId,
          endTime: null,
        },
        orderBy: {
          startTime: 'desc',
        },
        include: {
          task: true,
        },
      });

      return activeSession;
    }),

  /**
   * Get mode statistics for the authenticated user.
   *
   * @requires Authentication
   * @returns Mode durations and current streak
   */
  getModeStats: authedProcedure
    .query(async ({ ctx }) => {
      const prisma = (storage as StorageWithPrisma).prisma;

      // Get time spent in each mode
      const modeDurations = await prisma.$queryRaw<Array<{ mode: string; duration: number }>>`
        SELECT
          "mode",
          SUM(EXTRACT(EPOCH FROM (COALESCE("endTime", NOW()) - "startTime")) / 60) as duration
        FROM "FocusSession"
        WHERE "userId" = ${ctx.userId}
        GROUP BY "mode"
      `;

      // Get current streak
      const streak = await prisma.$queryRaw<Array<{ current_streak: number }>>`
        WITH daily_activity AS (
          SELECT
            DATE("lastActive") as activity_date
          FROM "User"
          WHERE "id" = ${ctx.userId}

          UNION

          SELECT
            DATE("createdAt") as activity_date
          FROM "Reflection"
          WHERE "userId" = ${ctx.userId}

          UNION

          SELECT
            DATE("startTime") as activity_date
          FROM "FocusSession"
          WHERE "userId" = ${ctx.userId}
        ),
        streaks AS (
          SELECT
            activity_date,
            activity_date - ROW_NUMBER() OVER (ORDER BY activity_date) * INTERVAL '1 day' as grp
          FROM daily_activity
          GROUP BY activity_date
        )
        SELECT
          COUNT(*) as current_streak
        FROM (
          SELECT
            grp,
            MIN(activity_date) as start_date,
            MAX(activity_date) as end_date,
            COUNT(*) as days
          FROM streaks
          GROUP BY grp
          HAVING MAX(activity_date) = CURRENT_DATE - INTERVAL '0 days'
        ) as current_streak;
      `;

      return {
        modeDurations: modeDurations.reduce((acc, { mode, duration }) => ({
          ...acc,
          [mode]: Math.round(duration),
        }), {} as Record<string, number>),
        currentStreak: streak[0]?.current_streak || 0,
      };
    }),
});

export type ModeRouter = typeof modeRouter;
