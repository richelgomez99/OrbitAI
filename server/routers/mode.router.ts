import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { Prisma } from '@prisma/client';

export const modeRouter = router({
  startSession: protectedProcedure
    .input(
      z.object({
        mode: z.enum(['BUILD', 'FLOW', 'RESTORE']),
        energyLevel: z.number().min(0).max(100).default(50),
        taskId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { prisma, session } = ctx;
      const { mode, energyLevel, taskId } = input;

      // End any active sessions
      await prisma.focusSession.updateMany({
        where: {
          userId: session.user.id,
          endTime: null,
        },
        data: {
          endTime: new Date(),
        },
      });

      // Create new session
      const newSession = await prisma.focusSession.create({
        data: {
          userId: session.user.id,
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
        where: { id: session.user.id },
        data: { lastActive: new Date() },
      });

      return newSession;
    }),

  endSession: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
        endTime: z.date().optional(),
        energyLevel: z.number().min(0).max(100).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { prisma, session } = ctx;
      const { sessionId, endTime = new Date(), energyLevel } = input;

      const updatedSession = await prisma.focusSession.update({
        where: {
          id: sessionId,
          userId: session.user.id,
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

  getCurrentSession: protectedProcedure
    .query(async ({ ctx }) => {
      const { prisma, session } = ctx;

      const activeSession = await prisma.focusSession.findFirst({
        where: {
          userId: session.user.id,
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

  getModeStats: protectedProcedure
    .query(async ({ ctx }) => {
      const { prisma, session } = ctx;

      // Get time spent in each mode
      const modeDurations = await prisma.$queryRaw<Array<{ mode: string; duration: number }>>`
        SELECT 
          "mode",
          SUM(EXTRACT(EPOCH FROM (COALESCE("endTime", NOW()) - "startTime")) / 60) as duration
        FROM "FocusSession"
        WHERE "userId" = ${session.user.id}
        GROUP BY "mode"
      `;

      // Get current streak
      const streak = await prisma.$queryRaw<Array<{ current_streak: number }>>`
        WITH daily_activity AS (
          SELECT 
            DATE("lastActive") as activity_date
          FROM "User"
          WHERE "id" = ${session.user.id}
          
          UNION
          
          SELECT 
            DATE("createdAt") as activity_date
          FROM "Reflection"
          WHERE "userId" = ${session.user.id}
          
          UNION
          
          SELECT 
            DATE("startTime") as activity_date
          FROM "FocusSession"
          WHERE "userId" = ${session.user.id}
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
